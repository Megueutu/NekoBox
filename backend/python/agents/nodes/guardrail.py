"""
Guardrail Node — GameBot
========================
Implementa proteção de entrada (input_guard) e saída (output_guard).

Input Guard:
  1. Regex rápido — bloqueia ataques óbvios SEM consumir tokens do LLM.
  2. LLM classifier — para mensagens ambíguas, usa modelo barato para classificar.

Output Guard:
  Valida que a resposta do agente não vaza informações sensíveis.
"""

import json
import re
from functools import cache

from langchain_core.messages import AIMessage, HumanMessage, SystemMessage
from langchain_google_genai import ChatGoogleGenerativeAI

from prompt.prompts import (
    PROMPT_GUARDRAIL_INPUT,
    PROMPT_GUARDRAIL_OUTPUT,
    RESPOSTA_BLOQUEIO,
)

# ---------------------------------------------------------------------------
# Padrões regex para bloqueio rápido (sem LLM)
# ---------------------------------------------------------------------------

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


# ---------------------------------------------------------------------------
# LLM para classificação (lazy singleton)
# ---------------------------------------------------------------------------

@cache
def _get_guardrail_llm():
    """Modelo leve usado exclusivamente para classificação de segurança."""
    return ChatGoogleGenerativeAI(
        model="gemini-2.0-flash",
        temperature=0,
        max_output_tokens=100,
    )


# ---------------------------------------------------------------------------
# Input Guard
# ---------------------------------------------------------------------------

def input_guard(state: dict) -> dict:
    """
    Analisa a mensagem do usuário em duas camadas:
    1. Regex rápido (custo zero de tokens)
    2. LLM classifier (só se regex não bloquear e mensagem for suspeita)

    Retorna:
      - {"messages": [AIMessage(bloqueio)], "blocked": True} se bloqueado
      - {"blocked": False} se seguro
    """
    messages = state.get("messages", [])

    # Pega última mensagem humana
    last_human = next(
        (m for m in reversed(messages) if isinstance(m, HumanMessage)),
        None,
    )
    if last_human is None:
        return {"blocked": False}

    text = last_human.content if isinstance(last_human.content, str) else ""

    # --- Camada 1: Regex rápido ---
    for pattern in _INJECTION_PATTERNS:
        if pattern.search(text):
            return {
                "messages": [AIMessage(content=RESPOSTA_BLOQUEIO)],
                "blocked": True,
            }

    for pattern in _OFFENSIVE_PATTERNS:
        if pattern.search(text):
            return {
                "messages": [AIMessage(content=RESPOSTA_BLOQUEIO)],
                "blocked": True,
            }

    # --- Camada 2: LLM classifier (para mensagens longas/ambíguas) ---
    # Só aciona para mensagens com mais de 200 chars (otimização de custo)
    if len(text) > 200:
        try:
            response = _get_guardrail_llm().invoke([
                SystemMessage(content=PROMPT_GUARDRAIL_INPUT),
                HumanMessage(content=text),
            ])
            result = json.loads(response.content)
            if result.get("classificacao") == "BLOQUEADA":
                return {
                    "messages": [AIMessage(content=RESPOSTA_BLOQUEIO)],
                    "blocked": True,
                }
        except (json.JSONDecodeError, Exception):
            # Em caso de erro no parsing, deixa passar (fail-open para UX)
            pass

    return {"blocked": False}


# ---------------------------------------------------------------------------
# Output Guard
# ---------------------------------------------------------------------------

def output_guard(state: dict) -> dict:
    """
    Valida a resposta do agente antes de entregar ao usuário.
    Se a resposta violar as regras, substitui pela resposta de bloqueio.

    Retorna:
      - {} se a resposta está ok
      - {"messages": [AIMessage(bloqueio)]} se precisa ser substituída
    """
    messages = state.get("messages", [])

    # Pega última mensagem AI
    last_ai = next(
        (m for m in reversed(messages) if isinstance(m, AIMessage) and not m.tool_calls),
        None,
    )
    if last_ai is None:
        return {}

    response_text = last_ai.content if isinstance(last_ai.content, str) else ""

    # Check rápido por vazamentos óbvios
    leak_patterns = [
        re.compile(r"(system\s*prompt|instrução\s*interna|meu\s*prompt)", re.IGNORECASE),
        re.compile(r"(GOOGLE_API_KEY|DATABASE_URL|senha|password)\s*[:=]", re.IGNORECASE),
    ]

    for pattern in leak_patterns:
        if pattern.search(response_text):
            # Remove a mensagem problemática e substitui
            from langchain_core.messages import RemoveMessage
            to_remove = [RemoveMessage(id=last_ai.id)] if hasattr(last_ai, "id") else []
            return {
                "messages": to_remove + [AIMessage(content=RESPOSTA_BLOQUEIO)],
            }

    return {}
