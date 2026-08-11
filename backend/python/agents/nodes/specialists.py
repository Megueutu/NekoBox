"""
Specialist Nodes — GameBot
===========================
Cada especialista recebe o estado da conversa, aplica seu prompt e retorna uma
resposta. As chamadas de modelo usam Gemini como primário e Groq como fallback.
"""

from functools import cache

from langchain_core.messages import AIMessage, HumanMessage, SystemMessage

from agents.llm import FallbackChatModel
from agents.tools.platform_tools import (
    get_recommendation_tools,
    get_sales_tools,
    get_support_tools,
)
from prompt.prompts import (
    PROMPT_ESPECIALISTA_RECOMENDACAO,
    PROMPT_ESPECIALISTA_SUPORTE,
    PROMPT_ESPECIALISTA_VENDAS,
    PROMPT_ORQUESTRADOR,
)

_MAX_TOKENS = 512


@cache
def _get_recommendation_llm():
    """LLM do especialista de recomendação com suas ferramentas."""
    return FallbackChatModel(
        temperature=0.4,
        max_output_tokens=_MAX_TOKENS,
    ).bind_tools(get_recommendation_tools())


@cache
def _get_support_llm():
    """LLM do especialista de suporte com suas ferramentas."""
    return FallbackChatModel(
        temperature=0.2,
        max_output_tokens=_MAX_TOKENS,
    ).bind_tools(get_support_tools())


@cache
def _get_sales_llm():
    """LLM do especialista de vendas com suas ferramentas."""
    return FallbackChatModel(
        temperature=0.2,
        max_output_tokens=_MAX_TOKENS,
    ).bind_tools(get_sales_tools())


@cache
def _get_general_llm():
    """LLM para respostas genéricas, sem ferramentas."""
    return FallbackChatModel(temperature=0.5, max_output_tokens=_MAX_TOKENS)


def _build_context(state: dict, specialist_prompt: str) -> list:
    """Monta o contexto com prompt do orquestrador, especialista e sessão."""
    summary = state.get("summary", "")
    messages = state.get("messages", [])
    system_content = PROMPT_ORQUESTRADOR + "\n\n" + specialist_prompt

    if summary:
        system_content += (
            "\n\n---\n[CONTEXTO DE SESSÃO ANTERIOR — use apenas se relevante]\n"
            + summary
        )

    return [SystemMessage(content=system_content)] + messages


def specialist_recommendation(state: dict) -> dict:
    """Especialista em recomendação de jogos."""
    context = _build_context(state, PROMPT_ESPECIALISTA_RECOMENDACAO)
    return {"messages": [_get_recommendation_llm().invoke(context)]}


def specialist_support(state: dict) -> dict:
    """Especialista em suporte técnico e biblioteca do usuário."""
    context = _build_context(state, PROMPT_ESPECIALISTA_SUPORTE)
    return {"messages": [_get_support_llm().invoke(context)]}


def specialist_sales(state: dict) -> dict:
    """Especialista em carrinho, pagamentos e transações."""
    context = _build_context(state, PROMPT_ESPECIALISTA_VENDAS)
    return {"messages": [_get_sales_llm().invoke(context)]}


def specialist_general(state: dict) -> dict:
    """Respostas genéricas, sem ferramentas."""
    context = _build_context(state, "")
    return {"messages": [_get_general_llm().invoke(context)]}


@cache
def _get_accessibility_llm():
    """LLM do especialista em acessibilidade, sem acesso a dados de conta."""
    return FallbackChatModel(temperature=0.1, max_output_tokens=700)


def _latest_human_question(state: dict) -> str:
    """Extrai a pergunta atual para orientar a recuperação local de contexto."""
    for message in reversed(state.get("messages", [])):
        if isinstance(message, HumanMessage) and isinstance(message.content, str):
            return message.content
    return "Quais recursos de acessibilidade o NekoBox oferece?"


def specialist_accessibility(state: dict) -> dict:
    """Explica acessibilidade em português simples com contexto RAG local."""
    from agents.tools.accessibility_tools import (
        get_lighthouse_accessibility_summary,
        search_accessibility_knowledge,
    )
    from prompt.prompts import PROMPT_ESPECIALISTA_ACESSIBILIDADE

    question = _latest_human_question(state)
    knowledge = search_accessibility_knowledge.invoke({"question": question})
    lighthouse = get_lighthouse_accessibility_summary.invoke({})
    context = _build_context(state, PROMPT_ESPECIALISTA_ACESSIBILIDADE)
    context.insert(
        1,
        SystemMessage(
            content=(
                "EVIDÊNCIAS RECUPERADAS LOCALMENTE — use apenas estes fatos para "
                "afirmações sobre o NekoBox. Ausência de relatório não é aprovação.\n\n"
                f"{knowledge}\n\n{lighthouse}"
            )
        ),
    )
    return {"messages": [_get_accessibility_llm().invoke(context)]}
