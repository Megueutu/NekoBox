"""Classificador de intenção do GameBot."""

import json
from functools import cache

from langchain_core.messages import HumanMessage, SystemMessage

from agents.llm import FallbackChatModel
from prompt.prompts import PROMPT_ROUTER


@cache
def _get_router_llm():
    """Modelo leve com fallback Gemini → Groq para classificar a intenção."""
    return FallbackChatModel(temperature=0, max_output_tokens=60)


def route_intent(state: dict) -> dict:
    """Classifica a intenção e falha para ``geral`` se o JSON for inválido."""
    messages = state.get("messages", [])
    last_human = next(
        (message for message in reversed(messages) if isinstance(message, HumanMessage)),
        None,
    )
    if last_human is None:
        return {"intent": "geral"}

    text = last_human.content if isinstance(last_human.content, str) else ""
    if len(text.split()) <= 3 and any(
        greet in text.lower()
        for greet in ("oi", "olá", "ola", "hey", "eae", "fala", "salve", "bom dia", "boa tarde", "boa noite")
    ):
        return {"intent": "geral"}

    try:
        response = _get_router_llm().invoke([
            SystemMessage(content=PROMPT_ROUTER),
            HumanMessage(content=text),
        ])
        result = json.loads(response.content)
        intent = result.get("intencao", "geral")
        if intent in {"recomendacao", "suporte", "vendas", "acessibilidade", "geral"}:
            return {"intent": intent}
    except (json.JSONDecodeError, Exception):
        pass

    return {"intent": "geral"}


def get_specialist_route(state: dict) -> str:
    """Devolve o nó especialista correspondente à intenção classificada."""
    return {
        "recomendacao": "specialist_recommendation",
        "suporte": "specialist_support",
        "vendas": "specialist_sales",
        "acessibilidade": "specialist_accessibility",
        "geral": "specialist_general",
    }.get(state.get("intent", "geral"), "specialist_general")
