"""Guardrails de entrada e saída do GameBot."""

import json
import re
from functools import cache

from langchain_core.messages import AIMessage, HumanMessage, SystemMessage

from agents.llm import FallbackChatModel
from prompt.prompts import (
    PROMPT_GUARDRAIL_INPUT,
    RESPOSTA_BLOQUEIO,
)

_INJECTION_PATTERNS: list[re.Pattern] = [
    re.compile(r"ignore\s+(as\s+)?(instruc|regra|prompt)", re.IGNORECASE),
    re.compile(r"(você agora é|you are now|act as|aja como)\s+\w+", re.IGNORECASE),
    re.compile(r"modo\s+desenvolvedor|developer\s+mode", re.IGNORECASE),
    re.compile(r"sem\s+restrições|without\s+restrictions", re.IGNORECASE),
    re.compile(r"(mostre|revele|reveal|show)\s+(o\s+)?(prompt|sistema|system)", re.IGNORECASE),
    re.compile(r"(diga|tell|repita)\s+.*(instrução|instruction|regra|rule)", re.IGNORECASE),
    re.compile(r"(jailbreak|bypass|hack)\s+", re.IGNORECASE),
    re.compile(r"finja\s+ser|pretend\s+(to\s+)?be", re.IGNORECASE),
]

_OFFENSIVE_PATTERNS: list[re.Pattern] = [
    re.compile(r"\b(porra|caralho|foda-se|filho da puta|vai se fuder)\b", re.IGNORECASE),
    re.compile(r"\b(fuck\s*you|kill\s*yourself|kys)\b", re.IGNORECASE),
]


@cache
def _get_guardrail_llm():
    """Classificador de segurança com fallback Gemini → Groq."""
    return FallbackChatModel(temperature=0, max_output_tokens=100)


def input_guard(state: dict) -> dict:
    """Bloqueia ataques evidentes e usa LLM apenas para entradas longas ambíguas."""
    messages = state.get("messages", [])
    last_human = next(
        (message for message in reversed(messages) if isinstance(message, HumanMessage)),
        None,
    )
    if last_human is None:
        return {"blocked": False}

    text = last_human.content if isinstance(last_human.content, str) else ""
    if any(pattern.search(text) for pattern in (*_INJECTION_PATTERNS, *_OFFENSIVE_PATTERNS)):
        return {"messages": [AIMessage(content=RESPOSTA_BLOQUEIO)], "blocked": True}

    if len(text) > 200:
        try:
            response = _get_guardrail_llm().invoke([
                SystemMessage(content=PROMPT_GUARDRAIL_INPUT),
                HumanMessage(content=text),
            ])
            if json.loads(response.content).get("classificacao") == "BLOQUEADA":
                return {"messages": [AIMessage(content=RESPOSTA_BLOQUEIO)], "blocked": True}
        except (json.JSONDecodeError, Exception):
            pass

    return {"blocked": False}


def _strip_visible_markdown(text: str) -> str:
    """Remove marcadores de Markdown para manter a resposta em texto simples."""
    return text.replace("**", "").replace("__", "").replace("`", "").replace("*", "")


def output_guard(state: dict) -> dict:
    """Bloqueia vazamentos e garante texto simples antes de entregar a resposta."""
    last_ai = next(
        (
            message
            for message in reversed(state.get("messages", []))
            if isinstance(message, AIMessage) and not message.tool_calls
        ),
        None,
    )
    if last_ai is None:
        return {}

    response_text = last_ai.content if isinstance(last_ai.content, str) else ""
    leak_patterns = [
        re.compile(r"(system\s*prompt|instrução\s*interna|meu\s*prompt)", re.IGNORECASE),
        re.compile(r"(GOOGLE_API_KEY|GROQ_API_KEY|DATABASE_URL|senha|password)\s*[:=]", re.IGNORECASE),
    ]
    if any(pattern.search(response_text) for pattern in leak_patterns):
        from langchain_core.messages import RemoveMessage

        to_remove = [RemoveMessage(id=last_ai.id)] if hasattr(last_ai, "id") else []
        return {"messages": to_remove + [AIMessage(content=RESPOSTA_BLOQUEIO)]}

    plain_text = _strip_visible_markdown(response_text)
    if plain_text != response_text:
        from langchain_core.messages import RemoveMessage

        to_remove = [RemoveMessage(id=last_ai.id)] if hasattr(last_ai, "id") else []
        return {"messages": to_remove + [AIMessage(content=plain_text)]}

    return {}
