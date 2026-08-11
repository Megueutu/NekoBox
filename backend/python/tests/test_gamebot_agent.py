from __future__ import annotations

import os
from types import SimpleNamespace
from unittest import TestCase
from unittest.mock import Mock, patch

from langchain_core.messages import AIMessage, HumanMessage

from agents import gamebot_agent
from agents.conversation_store import ConversationLoadResult, ConversationMessage
from agents.nodes import router
from agents.tools.platform_tools import escalate_to_support


class FakeGraph:
    def __init__(self, *, response="Resposta final", intent="geral", blocked=False, error=None):
        self.response = response
        self.intent = intent
        self.blocked = blocked
        self.error = error
        self.initial_state = None
        self.config = None

    def invoke(self, initial_state, config):
        self.initial_state = initial_state
        self.config = config
        if self.error:
            raise self.error
        return {
            "messages": [*initial_state["messages"], AIMessage(content=self.response)],
            "intent": self.intent,
            "blocked": self.blocked,
        }


class RouterTests(TestCase):
    def test_router_accepts_the_accessibility_intent_without_confidence(self):
        llm = Mock()
        llm.invoke.return_value = SimpleNamespace(content='{"intencao":"acessibilidade"}')

        with patch.object(router, "_get_router_llm", return_value=llm):
            result = router.route_intent({"messages": [HumanMessage(content="Como o site ajuda quem usa teclado?")]})

        self.assertEqual(result, {"intent": "acessibilidade"})

    def test_router_falls_back_to_general_for_invalid_response(self):
        llm = Mock()
        llm.invoke.return_value = SimpleNamespace(content='{"intencao":"desconhecida"}')

        with patch.object(router, "_get_router_llm", return_value=llm):
            result = router.route_intent({"messages": [HumanMessage(content="Explique esse assunto em detalhes")]} )

        self.assertEqual(result, {"intent": "geral"})


class GamebotAgentTests(TestCase):
    def test_returns_structured_result_and_persists_only_final_turn(self):
        graph = FakeGraph(intent="acessibilidade")
        history = ConversationLoadResult(
            messages=(ConversationMessage("user", "Mensagem anterior"),),
            available=True,
        )

        with patch.dict(os.environ, {"GOOGLE_API_KEY": "test-key"}, clear=False), \
             patch.object(gamebot_agent, "graph", graph), \
             patch.object(gamebot_agent, "load_recent_messages", return_value=history), \
             patch.object(gamebot_agent, "save_turn", return_value=True) as save_turn, \
             patch.object(gamebot_agent, "_accessibility_sources", return_value=("Base de acessibilidade do NekoBox",)):
            result = gamebot_agent.chat_with_metadata("Nova pergunta", session_id="session-3", usuario_id=7)

        self.assertEqual(result.response, "Resposta final")
        self.assertEqual(result.intent, "acessibilidade")
        self.assertEqual(result.sources, ("Base de acessibilidade do NekoBox",))
        self.assertEqual(result.availability.model, "available")
        self.assertEqual(result.availability.database, "available")
        self.assertEqual(graph.config, {"configurable": {"usuario_id": 7}})
        self.assertEqual([message.content for message in graph.initial_state["messages"]], ["Mensagem anterior", "Nova pergunta"])
        save_turn.assert_called_once_with("session-3", "Nova pergunta", "Resposta final")

    def test_conversation_memory_unavailability_does_not_become_a_model_outage(self):
        graph = FakeGraph(intent="geral")
        history = ConversationLoadResult(messages=(), available=False)

        with patch.dict(os.environ, {"GOOGLE_API_KEY": "test-key"}, clear=False), \
             patch.object(gamebot_agent, "graph", graph), \
             patch.object(gamebot_agent, "load_recent_messages", return_value=history), \
             patch.object(gamebot_agent, "save_turn", return_value=False):
            result = gamebot_agent.chat_with_metadata("Olá", session_id="session-offline")

        self.assertEqual(result.response, "Resposta final")
        self.assertEqual(result.availability.model, "available")
        self.assertEqual(result.availability.database, "unavailable")

    def test_timeout_from_model_is_exposed_as_model_unavailable(self):
        graph = FakeGraph(error=TimeoutError("provider timeout"))
        history = ConversationLoadResult(messages=(), available=True)

        with patch.dict(os.environ, {"GOOGLE_API_KEY": "test-key"}, clear=False), \
             patch.object(gamebot_agent, "graph", graph), \
             patch.object(gamebot_agent, "load_recent_messages", return_value=history):
            with self.assertRaises(gamebot_agent.ModelUnavailableError):
                gamebot_agent.chat_with_metadata("Olá", session_id="session-timeout")

    def test_support_handoff_is_honest_about_its_limitations(self):
        message = escalate_to_support.invoke({"reason": "Cobrança duplicada"})

        self.assertIn("Não consigo abrir um chamado", message)
        self.assertIn("canal oficial de suporte", message)
        self.assertNotIn("Protocolo gerado", message)
        self.assertNotIn("30 minutos", message)
