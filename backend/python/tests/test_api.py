from __future__ import annotations

from unittest import IsolatedAsyncioTestCase
from unittest.mock import patch

from fastapi import HTTPException

import main
from agents.gamebot_agent import ChatAvailability, ChatResult, ModelUnavailableError


class ChatEndpointTests(IsolatedAsyncioTestCase):
    async def test_endpoint_returns_metadata_from_agent_result(self):
        result = ChatResult(
            response="Resposta acessível",
            session_id="session-api",
            intent="acessibilidade",
            blocked=False,
            sources=("Base de acessibilidade do NekoBox",),
            availability=ChatAvailability(model="available", database="unavailable"),
        )

        with patch("agents.gamebot_agent.chat_with_metadata", return_value=result) as chat_with_metadata:
            response = await main.chat_endpoint(
                main.ChatRequest(message="Como o site ajuda quem usa teclado?", session_id="session-api")
            )

        self.assertEqual(response.response, "Resposta acessível")
        self.assertEqual(response.intent, "acessibilidade")
        self.assertEqual(response.sources, ["Base de acessibilidade do NekoBox"])
        self.assertEqual(response.availability.database, "unavailable")
        chat_with_metadata.assert_called_once_with(
            user_input="Como o site ajuda quem usa teclado?",
            session_id="session-api",
            usuario_id=None,
        )

    async def test_endpoint_maps_model_outage_to_service_unavailable(self):
        with patch(
            "agents.gamebot_agent.chat_with_metadata",
            side_effect=ModelUnavailableError("provider offline"),
        ):
            with self.assertRaises(HTTPException) as context:
                await main.chat_endpoint(main.ChatRequest(message="Olá", session_id="session-api"))

        self.assertEqual(context.exception.status_code, 503)
        self.assertIn("modelo de IA", context.exception.detail)
