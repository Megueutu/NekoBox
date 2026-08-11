from __future__ import annotations

from datetime import datetime, timedelta, timezone
from unittest import TestCase
from unittest.mock import patch

from agents import conversation_store


class FakeCollection:
    def __init__(self, sessions=()):
        self.sessions = {session["_id"]: session for session in sessions}
        self.created_indexes = []
        self.find_one_calls = []
        self.update_calls = []

    def create_index(self, fields, **options):
        self.created_indexes.append((fields, options))

    def find_one(self, query, projection=None):
        self.find_one_calls.append((query, projection))
        session = self.sessions.get(query["_id"])
        if not session or session["expires_at"] <= query["expires_at"]["$gt"]:
            return None
        return session

    def update_one(self, query, update, upsert):
        self.update_calls.append((query, update, upsert))
        session = self.sessions.setdefault(query["_id"], {"_id": query["_id"]})
        values = update[0]["$set"]
        now = values["updated_at"]
        new_messages = values["messages"]["$slice"][0]["$concatArrays"][1]
        active_messages = session.get("messages", []) if session.get("expires_at", now) > now else []
        session["messages"] = [*active_messages, *new_messages][-conversation_store.MAX_STORED_MESSAGES:]
        session["expires_at"] = values["expires_at"]
        session["updated_at"] = now
        session.setdefault("created_at", now)


class ConversationStoreTests(TestCase):
    def test_initialization_creates_ttl_index(self):
        collection = FakeCollection()

        with patch.object(conversation_store, "_get_collection", return_value=collection):
            initialized = conversation_store.initialize_conversation_store()

        self.assertTrue(initialized)
        self.assertEqual(collection.created_indexes[0][0], [("expires_at", 1)])
        self.assertEqual(collection.created_indexes[0][1]["expireAfterSeconds"], 0)

    def test_loads_complete_recent_turns_without_expired_session(self):
        now = datetime(2026, 8, 10, tzinfo=timezone.utc)
        messages = [
            {"role": role, "content": f"{role}-{turn}", "created_at": now}
            for turn in range(1, 11)
            for role in ("user", "assistant")
        ]
        collection = FakeCollection(
            sessions=[
                {
                    "_id": "session-1",
                    "messages": messages,
                    "expires_at": now + timedelta(days=1),
                }
            ]
        )

        with patch.object(conversation_store, "_utcnow", return_value=now), \
             patch.object(conversation_store, "_get_collection", return_value=collection):
            result = conversation_store.load_recent_messages("session-1", limit=999)

        self.assertTrue(result.available)
        self.assertEqual(len(result.messages), 18)
        self.assertEqual(result.messages[0], conversation_store.ConversationMessage("user", "user-2"))
        self.assertEqual(result.messages[-1], conversation_store.ConversationMessage("assistant", "assistant-10"))
        query, _ = collection.find_one_calls[0]
        self.assertEqual(query["expires_at"]["$gt"], now)

    def test_save_turn_atomically_stores_only_public_messages_and_caps_history(self):
        now = datetime(2026, 8, 10, tzinfo=timezone.utc)
        old_messages = [
            {"role": role, "content": f"{role}-{turn}", "created_at": now}
            for turn in range(1, 11)
            for role in ("user", "assistant")
        ]
        collection = FakeCollection(
            sessions=[
                {
                    "_id": "session-2",
                    "messages": old_messages,
                    "expires_at": now + timedelta(days=1),
                }
            ]
        )

        with patch.object(conversation_store, "_utcnow", return_value=now), \
             patch.object(conversation_store, "_get_collection", return_value=collection):
            saved = conversation_store.save_turn("session-2", "Olá", "Oi! Como posso ajudar?")

        self.assertTrue(saved)
        self.assertEqual(len(collection.update_calls), 1)
        _, pipeline, upsert = collection.update_calls[0]
        self.assertTrue(upsert)
        self.assertEqual(pipeline[0]["$set"]["messages"]["$slice"][1], -20)
        self.assertEqual([message["role"] for message in collection.sessions["session-2"]["messages"][-2:]], ["user", "assistant"])
        self.assertEqual(len(collection.sessions["session-2"]["messages"]), 20)
        self.assertEqual(collection.sessions["session-2"]["expires_at"], now + timedelta(days=30))

    def test_save_turn_restarts_an_expired_session_before_ttl_collection(self):
        now = datetime(2026, 8, 10, tzinfo=timezone.utc)
        collection = FakeCollection(
            sessions=[
                {
                    "_id": "session-expired",
                    "messages": [
                        {"role": "user", "content": "Histórico antigo", "created_at": now - timedelta(days=31)},
                        {"role": "assistant", "content": "Resposta antiga", "created_at": now - timedelta(days=31)},
                    ],
                    "expires_at": now - timedelta(seconds=1),
                }
            ]
        )

        with patch.object(conversation_store, "_utcnow", return_value=now), \
             patch.object(conversation_store, "_get_collection", return_value=collection):
            saved = conversation_store.save_turn("session-expired", "Nova pergunta", "Nova resposta")
            result = conversation_store.load_recent_messages("session-expired")

        self.assertTrue(saved)
        self.assertEqual(
            result.messages,
            (
                conversation_store.ConversationMessage("user", "Nova pergunta"),
                conversation_store.ConversationMessage("assistant", "Nova resposta"),
            ),
        )

    def test_mongo_unavailability_degrades_without_history(self):
        with patch.object(
            conversation_store,
            "_get_collection",
            side_effect=conversation_store.ConversationStoreUnavailable("offline"),
        ):
            result = conversation_store.load_recent_messages("session-offline")
            saved = conversation_store.save_turn("session-offline", "Pergunta", "Resposta")

        self.assertFalse(result.available)
        self.assertEqual(result.messages, ())
        self.assertFalse(saved)
