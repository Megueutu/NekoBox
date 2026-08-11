"""
Router Node — GameBot
=====================
Classifica a intenção do usuário e decide para qual especialista rotear.

Usa Gemini Flash (leve e rápido) com prompt específico para classificação.
O resultado é armazenado no state["intent"] para o orquestrador decidir
qual nó especialista ativar.

Categorias:
  - recomendacao: busca/detalhes de jogos
  - suporte: problemas técnicos, conta, funcionalidades
  - vendas: carrinho, pagamentos, reembolsos
  - geral: saudações, perguntas genéricas
"""

import json
from functools import cache

from langchain_core.messages import HumanMessage, SystemMessage
from langchain_google_genai import ChatGoogleGenerativeAI

from prompt.prompts import PROMPT_ROUTER

# ---------------------------------------------------------------------------
# LLM (lazy singleton)
# ---------------------------------------------------------------------------

@cache
def _get_router_llm():
    """Modelo leve usado exclusivamente para classificação de intenção."""
    return ChatGoogleGenerativeAI(
        model="gemini-2.0-flash",
        temperature=0,
        max_output_tokens=60,
    )


# ---------------------------------------------------------------------------
# Router Node
# ---------------------------------------------------------------------------

def route_intent(state: dict) -> dict:
    """
    Classifica a intenção da mensagem do usuário.

    Retorna:
      {"intent": "recomendacao" | "suporte" | "vendas" | "acessibilidade" | "geral"}
    """
    messages = state.get("messages", [])

    # Pega última mensagem humana
    last_human = next(
        (m for m in reversed(messages) if isinstance(m, HumanMessage)),
        None,
    )
    if last_human is None:
        return {"intent": "geral"}

    text = last_human.content if isinstance(last_human.content, str) else ""

    # Mensagens muito curtas (saudações) → geral direto, sem gastar tokens
    if len(text.split()) <= 3 and any(
        greet in text.lower()
        for greet in ["oi", "olá", "ola", "hey", "eae", "fala", "salve", "bom dia", "boa tarde", "boa noite"]
    ):
        return {"intent": "geral"}

    try:
        response = _get_router_llm().invoke([
            SystemMessage(content=PROMPT_ROUTER),
            HumanMessage(content=text),
        ])

        result = json.loads(response.content)
        intent = result.get("intencao", "geral")
        valid_intents = {"recomendacao", "suporte", "vendas", "acessibilidade", "geral"}
        if intent not in valid_intents:
            return {"intent": "geral"}

        return {"intent": intent}

    except (json.JSONDecodeError, Exception):
        # Fallback seguro em caso de erro
        return {"intent": "geral"}


# ---------------------------------------------------------------------------
# Routing edge function (usado pelo grafo para decidir o próximo nó)
# ---------------------------------------------------------------------------

def get_specialist_route(state: dict) -> str:
    """
    Função de roteamento condicional para o grafo.
    Retorna o nome do nó especialista baseado no intent classificado.
    """
    intent = state.get("intent", "geral")

    route_map = {
        "recomendacao": "specialist_recommendation",
        "suporte": "specialist_support",
        "vendas": "specialist_sales",
        "acessibilidade": "specialist_accessibility",
        "geral": "specialist_general",
    }

    return route_map.get(intent, "specialist_general")
