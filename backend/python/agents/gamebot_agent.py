"""Orquestrador LangGraph do GameBot.

O histórico de conversa é persistido explicitamente como mensagens públicas no
MongoDB. O grafo não usa checkpoints em memória: isso evita perder contexto em
reinícios e impede que prompts, chamadas de ferramentas ou dados internos sejam
salvos como histórico de chat.
"""

from __future__ import annotations

import logging
import os
from dataclasses import dataclass
from typing import Annotated, Literal

from langchain_core.messages import AIMessage, HumanMessage
from langgraph.graph import END, START, StateGraph
from langgraph.prebuilt import ToolNode
from typing_extensions import TypedDict

from agents.config import load_project_environment
from agents.conversation_store import (
    ConversationMessage,
    conversation_session_lock,
    load_recent_messages,
    save_turn,
)
from agents.nodes.guardrail import input_guard, output_guard
from agents.nodes.router import get_specialist_route, route_intent
from agents.nodes.specialists import (
    specialist_general,
    specialist_recommendation,
    specialist_sales,
    specialist_support,
)
from agents.tools.platform_tools import (
    get_recommendation_tools,
    get_sales_tools,
    get_support_tools,
)
from prompt.prompts import RESPOSTA_BLOQUEIO

load_project_environment()

logger = logging.getLogger(__name__)


class ModelUnavailableError(RuntimeError):
    """Indica uma indisponibilidade identificável do provedor de modelos."""


@dataclass(frozen=True)
class ChatAvailability:
    """Estado público dos serviços relevantes para uma resposta do chat."""

    model: Literal["available", "not_used"]
    database: Literal["available", "unavailable"]
    support_handoff: Literal["manual"] = "manual"


@dataclass(frozen=True)
class ChatResult:
    """Resposta do agente com metadados seguros para consumo pela API."""

    response: str
    session_id: str
    intent: str
    blocked: bool
    sources: tuple[str, ...]
    availability: ChatAvailability


class AgentState(TypedDict):
    """Estado de um turno do agente, sempre mantido somente em memória."""

    messages: Annotated[list, lambda old, new: old + new]
    intent: str
    blocked: bool


# ---------------------------------------------------------------------------
# Routing edges
# ---------------------------------------------------------------------------

def route_after_guard(state: AgentState) -> Literal["router", "__end__"]:
    """Encerra o turno quando o guardrail bloqueia a entrada."""
    if state.get("blocked", False):
        return END
    return "router"


def route_after_specialist(state: AgentState) -> Literal[
    "tools_recommendation", "tools_support", "tools_sales", "output_guard"
]:
    """Executa apenas as ferramentas autorizadas para o especialista atual."""
    messages = state["messages"]
    last = messages[-1] if messages else None

    if isinstance(last, AIMessage) and last.tool_calls:
        tools_map = {
            "recomendacao": "tools_recommendation",
            "suporte": "tools_support",
            "vendas": "tools_sales",
        }
        return tools_map.get(state.get("intent", "geral"), "output_guard")

    return "output_guard"


def route_after_tools(state: AgentState) -> str:
    """Depois de uma ferramenta, retorna ao especialista que a solicitou."""
    specialist_map = {
        "recomendacao": "specialist_recommendation",
        "suporte": "specialist_support",
        "vendas": "specialist_sales",
    }
    return specialist_map.get(state.get("intent", "geral"), "specialist_general")


# ---------------------------------------------------------------------------
# Graph builder
# ---------------------------------------------------------------------------

def build_graph() -> StateGraph:
    """Constrói o grafo de um turno sem depender de checkpoint em memória."""
    from agents.nodes.specialists import specialist_accessibility

    builder = StateGraph(AgentState)

    builder.add_node("guard", input_guard)
    builder.add_node("router", route_intent)
    builder.add_node("specialist_recommendation", specialist_recommendation)
    builder.add_node("specialist_support", specialist_support)
    builder.add_node("specialist_sales", specialist_sales)
    builder.add_node("specialist_accessibility", specialist_accessibility)
    builder.add_node("specialist_general", specialist_general)
    builder.add_node("tools_recommendation", ToolNode(get_recommendation_tools()))
    builder.add_node("tools_support", ToolNode(get_support_tools()))
    builder.add_node("tools_sales", ToolNode(get_sales_tools()))
    builder.add_node("output_guard", output_guard)

    builder.add_edge(START, "guard")
    builder.add_conditional_edges("guard", route_after_guard)
    builder.add_conditional_edges("router", get_specialist_route)
    builder.add_conditional_edges("specialist_recommendation", route_after_specialist)
    builder.add_conditional_edges("specialist_support", route_after_specialist)
    builder.add_conditional_edges("specialist_sales", route_after_specialist)
    builder.add_edge("specialist_accessibility", "output_guard")
    builder.add_edge("specialist_general", "output_guard")
    builder.add_conditional_edges("tools_recommendation", route_after_tools)
    builder.add_conditional_edges("tools_support", route_after_tools)
    builder.add_conditional_edges("tools_sales", route_after_tools)
    builder.add_edge("output_guard", END)

    return builder


# Grafo sem MemorySaver: o repositório MongoDB controla a retenção e o TTL.
graph = build_graph().compile()


# ---------------------------------------------------------------------------
# Helpers de resultado e falhas
# ---------------------------------------------------------------------------

def _history_to_messages(history: tuple[ConversationMessage, ...]) -> list:
    """Converte apenas as duas roles públicas permitidas para mensagens LangChain."""
    messages: list = []
    for item in history:
        if item.role == "user":
            messages.append(HumanMessage(content=item.content))
        elif item.role == "assistant":
            messages.append(AIMessage(content=item.content))
    return messages


def _response_text(result: dict) -> str:
    """Extrai a última resposta de usuário, ignorando chamadas intermediárias."""
    for message in reversed(result.get("messages", [])):
        if isinstance(message, AIMessage) and not message.tool_calls:
            if isinstance(message.content, str) and message.content.strip():
                return message.content
    return RESPOSTA_BLOQUEIO


def _is_model_provider_error(error: BaseException) -> bool:
    """Reconhece falhas de transporte/serviço originadas pelo Gemini/LangChain."""
    visited: set[int] = set()
    current: BaseException | None = error
    for _ in range(6):
        if current is None or id(current) in visited:
            break
        visited.add(id(current))
        module = type(current).__module__
        class_name = type(current).__name__.lower()
        if module.startswith((
            "google.",
            "groq.",
            "langchain_google_genai",
            "langchain_groq",
        )):
            return True
        if module.startswith("httpx") and "timeout" in class_name:
            return True
        if isinstance(current, TimeoutError):
            return True
        current = current.__cause__ or current.__context__
    return False


def _accessibility_sources(intent: str) -> tuple[str, ...]:
    """Devolve rótulos públicos, sem caminhos internos, para a resposta visual."""
    if intent != "acessibilidade":
        return ()

    from agents.tools.accessibility_tools import get_accessibility_source_labels

    return tuple(get_accessibility_source_labels())


# ---------------------------------------------------------------------------
# Public chat API
# ---------------------------------------------------------------------------

def chat_with_metadata(
    user_input: str,
    session_id: str = "default",
    usuario_id: int | None = None,
) -> ChatResult:
    """Processa um turno e retorna texto, intenção, fontes e disponibilidade.

    O MongoDB é usado somente para carregar/gravar o histórico público. Quando ele
    estiver fora, a conversa atual ainda é processada sem memória persistente.
    """
    if not (os.getenv("GOOGLE_API_KEY") or os.getenv("GROQ_API_KEY")):
        raise ModelUnavailableError("A configuração do modelo de IA não está disponível.")

    config = {
        "configurable": {
            "usuario_id": usuario_id,
        }
    }

    with conversation_session_lock(session_id):
        history_result = load_recent_messages(session_id)
        initial_state: AgentState = {
            "messages": _history_to_messages(history_result.messages)
            + [HumanMessage(content=user_input)],
            "intent": "",
            "blocked": False,
        }

        try:
            result = graph.invoke(initial_state, config=config)
        except Exception as error:
            if _is_model_provider_error(error):
                raise ModelUnavailableError(
                    "O modelo de IA está indisponível no momento."
                ) from error
            raise

        response = _response_text(result)
        intent = str(result.get("intent") or "geral")
        blocked = bool(result.get("blocked", False))
        history_saved = save_turn(session_id, user_input, response)

    database_status: Literal["available", "unavailable"] = (
        "available" if history_result.available and history_saved else "unavailable"
    )
    model_status: Literal["available", "not_used"] = (
        "not_used" if blocked else "available"
    )
    return ChatResult(
        response=response,
        session_id=session_id,
        intent=intent,
        blocked=blocked,
        sources=_accessibility_sources(intent),
        availability=ChatAvailability(
            model=model_status,
            database=database_status,
        ),
    )


def chat(user_input: str, session_id: str = "default", usuario_id: int | None = None) -> str:
    """Compatibilidade com consumidores que esperam somente o texto da resposta."""
    return chat_with_metadata(user_input, session_id, usuario_id).response


if __name__ == "__main__":
    print("=== GameBot Multi-Agent — Smoke Test ===\n")
    print("Fluxo: Input Guard → Router → Especialista → Tools → Output Guard\n")

    scenarios = [
        ("s1", "Olá! Tudo bem?"),
        ("s1", "Quais jogos de RPG vocês têm?"),
        ("s2", "Meu jogo está travando na tela inicial"),
        ("s3", "Quero saber quais recursos de acessibilidade existem"),
    ]

    for session, message in scenarios:
        print(f"[Sessão {session}] Usuário: {message}")
        print(f"[Sessão {session}] GameBot: {chat(message, session_id=session)}\n{'-' * 60}\n")
