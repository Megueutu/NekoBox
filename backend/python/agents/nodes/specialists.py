"""
Specialist Nodes — GameBot
===========================
Cada especialista é um nó do grafo que:
1. Recebe o estado com mensagens do usuário + contexto de sessão
2. Usa seu prompt especializado + ferramentas específicas
3. Retorna a resposta ao usuário

Especialistas:
  - specialist_recommendation: Recomendação e catálogo de jogos
  - specialist_support: Suporte técnico e resolução de problemas
  - specialist_sales: Carrinho, pagamentos e transações
  - specialist_general: Saudações e perguntas genéricas (sem tools)
"""

from functools import cache

from langchain_core.messages import AIMessage, HumanMessage, SystemMessage
from langchain_google_genai import ChatGoogleGenerativeAI

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

# ---------------------------------------------------------------------------
# Config — modelos fixos no código (sem .env)
# ---------------------------------------------------------------------------

_MODEL = "gemini-2.0-flash"
_MAX_TOKENS = 512


# ---------------------------------------------------------------------------
# LLMs por especialista (lazy singletons com tools bindados)
# ---------------------------------------------------------------------------

@cache
def _get_recommendation_llm():
    """LLM do especialista de recomendação com suas ferramentas."""
    return ChatGoogleGenerativeAI(
        model=_MODEL,
        temperature=0.4,
        max_output_tokens=_MAX_TOKENS,
    ).bind_tools(get_recommendation_tools())


@cache
def _get_support_llm():
    """LLM do especialista de suporte com suas ferramentas."""
    return ChatGoogleGenerativeAI(
        model=_MODEL,
        temperature=0.2,
        max_output_tokens=_MAX_TOKENS,
    ).bind_tools(get_support_tools())


@cache
def _get_sales_llm():
    """LLM do especialista de vendas com suas ferramentas."""
    return ChatGoogleGenerativeAI(
        model=_MODEL,
        temperature=0.2,
        max_output_tokens=_MAX_TOKENS,
    ).bind_tools(get_sales_tools())


@cache
def _get_general_llm():
    """LLM para respostas genéricas (sem tools)."""
    return ChatGoogleGenerativeAI(
        model=_MODEL,
        temperature=0.5,
        max_output_tokens=_MAX_TOKENS,
    )


# ---------------------------------------------------------------------------
# Helper — constrói contexto com resumo de sessão
# ---------------------------------------------------------------------------

def _build_context(state: dict, specialist_prompt: str) -> list:
    """
    Monta a lista de mensagens para o LLM:
    [SystemMessage(orquestrador + especialista + resumo), ...mensagens_recentes]
    """
    summary = state.get("summary", "")
    messages = state.get("messages", [])

    # Combina prompt do orquestrador + especialista
    system_content = PROMPT_ORQUESTRADOR + "\n\n" + specialist_prompt

    if summary:
        system_content += (
            "\n\n---\n[CONTEXTO DE SESSÃO ANTERIOR — use apenas se relevante]\n"
            + summary
        )

    return [SystemMessage(content=system_content)] + messages


# ---------------------------------------------------------------------------
# Specialist Nodes
# ---------------------------------------------------------------------------

def specialist_recommendation(state: dict) -> dict:
    """
    Especialista em recomendação de jogos.
    Usa ferramentas: search_games, get_game_info, get_game_reviews.
    """
    context = _build_context(state, PROMPT_ESPECIALISTA_RECOMENDACAO)
    response = _get_recommendation_llm().invoke(context)
    return {"messages": [response]}


def specialist_support(state: dict) -> dict:
    """
    Especialista em suporte técnico.
    Usa ferramentas: get_game_info, check_user_library, escalate_to_support.
    """
    context = _build_context(state, PROMPT_ESPECIALISTA_SUPORTE)
    response = _get_support_llm().invoke(context)
    return {"messages": [response]}


def specialist_sales(state: dict) -> dict:
    """
    Especialista em vendas/carrinho/pagamentos.
    Usa ferramentas: get_game_info, get_cart_info, check_payment_status, escalate_to_support.
    """
    context = _build_context(state, PROMPT_ESPECIALISTA_VENDAS)
    response = _get_sales_llm().invoke(context)
    return {"messages": [response]}


def specialist_general(state: dict) -> dict:
    """
    Respostas genéricas: saudações, agradecimentos, perguntas sobre a plataforma.
    Não usa ferramentas — respostas rápidas e baratas.
    """
    context = _build_context(state, "")
    response = _get_general_llm().invoke(context)
    return {"messages": [response]}
