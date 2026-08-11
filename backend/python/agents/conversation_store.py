"""Memória persistente pública do GameBot em MongoDB.

Cada sessão é um documento MongoDB com no máximo 20 mensagens públicas. Somente a
pergunta e a resposta final são armazenadas; prompts, ferramentas, dados internos
e resumos do agente não são persistidos. A configuração vem do ambiente e nunca é
registrada em log.
"""

from __future__ import annotations

import logging
import os
from contextlib import contextmanager
from dataclasses import dataclass
from datetime import datetime, timedelta, timezone
from threading import RLock
from typing import Any

from agents.config import load_project_environment

load_project_environment()

try:
    from pymongo import MongoClient
    from pymongo.errors import PyMongoError
except ImportError:  # Mantém o agente disponível até a dependência ser instalada.
    MongoClient = None

    class PyMongoError(Exception):
        """Fallback interno quando PyMongo ainda não está instalado."""


logger = logging.getLogger(__name__)

MAX_STORED_MESSAGES = 20
DEFAULT_HISTORY_LIMIT = MAX_STORED_MESSAGES - 2
SESSION_TTL = timedelta(days=30)


@dataclass(frozen=True)
class ConversationMessage:
    """Mensagem pública recuperada para compor o contexto do agente."""

    role: str
    content: str


@dataclass(frozen=True)
class ConversationLoadResult:
    """Resultado de leitura que torna a indisponibilidade da memória explícita."""

    messages: tuple[ConversationMessage, ...]
    available: bool


@dataclass
class _SessionLock:
    lock: RLock
    users: int = 0


class ConversationStoreUnavailable(RuntimeError):
    """Indica que a memória MongoDB não está disponível para este turno."""


_session_locks: dict[str, _SessionLock] = {}
_session_locks_guard = RLock()
_mongo_client: Any | None = None
_mongo_uri: str | None = None
_mongo_client_lock = RLock()


def _get_session_lock(session_id: str) -> _SessionLock:
    """Obtém um lock local e rastreia seu uso para descartá-lo ao final do turno."""
    with _session_locks_guard:
        entry = _session_locks.get(session_id)
        if entry is None:
            entry = _SessionLock(lock=RLock())
            _session_locks[session_id] = entry
        entry.users += 1
        return entry


@contextmanager
def conversation_session_lock(session_id: str):
    """Serializa leitura, resposta e gravação de uma sessão neste processo."""
    entry = _get_session_lock(session_id)
    try:
        with entry.lock:
            yield
    finally:
        with _session_locks_guard:
            entry.users -= 1
            if entry.users == 0 and _session_locks.get(session_id) is entry:
                _session_locks.pop(session_id, None)


def _mongo_settings() -> tuple[str, str, str, int]:
    """Lê a configuração sem expor URI, credenciais ou nomes de hosts."""
    uri = os.getenv("MONGODB_URI", "").strip()
    database = os.getenv("MONGODB_DATABASE", "nekobox").strip() or "nekobox"
    collection = (
        os.getenv("MONGODB_CONVERSATIONS_COLLECTION", "chat_mensagens").strip()
        or "chat_mensagens"
    )
    try:
        timeout_ms = int(os.getenv("MONGODB_SERVER_SELECTION_TIMEOUT_MS", "3000"))
    except ValueError:
        timeout_ms = 3000
    return uri, database, collection, max(100, min(timeout_ms, 30_000))


def _utcnow() -> datetime:
    return datetime.now(timezone.utc)


def _get_mongo_client():
    """Obtém um cliente síncrono compartilhado e valida a conexão inicial."""
    global _mongo_client, _mongo_uri

    uri, _, _, timeout_ms = _mongo_settings()
    if not uri:
        raise ConversationStoreUnavailable("MONGODB_URI não configurada")
    if MongoClient is None:
        raise ConversationStoreUnavailable("PyMongo não instalado")

    with _mongo_client_lock:
        if _mongo_client is not None and _mongo_uri == uri:
            return _mongo_client

        if _mongo_client is not None:
            _mongo_client.close()
            _mongo_client = None
            _mongo_uri = None

        client = None
        try:
            client = MongoClient(
                uri,
                serverSelectionTimeoutMS=timeout_ms,
                connectTimeoutMS=timeout_ms,
            )
            client.admin.command("ping")
        except PyMongoError as error:
            if client is not None:
                client.close()
            raise ConversationStoreUnavailable("MongoDB indisponível") from error

        _mongo_client = client
        _mongo_uri = uri
        return client


def _get_collection():
    """Retorna a collection configurada para o histórico público do GameBot."""
    _, database, collection, _ = _mongo_settings()
    return _get_mongo_client()[database][collection]


def initialize_conversation_store() -> bool:
    """Valida MongoDB e cria de forma idempotente o índice TTL da sessão."""
    try:
        _get_collection().create_index(
            [("expires_at", 1)],
            expireAfterSeconds=0,
            name="expires_at_ttl",
        )
        return True
    except (ConversationStoreUnavailable, PyMongoError):
        logger.warning("Memória de conversas MongoDB indisponível na inicialização.")
        return False


def conversation_store_available() -> bool:
    """Verifica a disponibilidade do MongoDB sem vazar dados de configuração."""
    try:
        client = _get_mongo_client()
        client.admin.command("ping")
        return True
    except (ConversationStoreUnavailable, PyMongoError):
        return False


def close_conversation_store() -> None:
    """Fecha o cliente MongoDB compartilhado no encerramento da aplicação."""
    global _mongo_client, _mongo_uri

    with _mongo_client_lock:
        if _mongo_client is not None:
            _mongo_client.close()
        _mongo_client = None
        _mongo_uri = None


def load_recent_messages(
    session_id: str,
    limit: int = DEFAULT_HISTORY_LIMIT,
) -> ConversationLoadResult:
    """Carrega até 18 mensagens para manter pares completos antes do novo input."""
    bounded_limit = max(0, min(limit, DEFAULT_HISTORY_LIMIT))
    if bounded_limit == 0:
        return ConversationLoadResult(messages=(), available=True)

    try:
        now = _utcnow()
        with conversation_session_lock(session_id):
            session = _get_collection().find_one(
                {"_id": session_id, "expires_at": {"$gt": now}},
                {"messages": 1},
            )

        stored_messages = session.get("messages", []) if session else []
        messages = tuple(
            ConversationMessage(role=item["role"], content=item["content"])
            for item in stored_messages[-bounded_limit:]
            if item.get("role") in {"user", "assistant"}
            and isinstance(item.get("content"), str)
        )
        return ConversationLoadResult(messages=messages, available=True)
    except (ConversationStoreUnavailable, PyMongoError):
        logger.warning("Histórico MongoDB indisponível; o turno seguirá sem memória.")
        return ConversationLoadResult(messages=(), available=False)


def save_turn(session_id: str, user_content: str, assistant_content: str) -> bool:
    """Persiste um turno público no MongoDB, com retenção e minimização de dados."""
    if not user_content.strip() or not assistant_content.strip():
        logger.warning("Turno sem conteúdo público não foi persistido.")
        return False

    def redact_for_storage(content: str) -> str:
        """Remove identificadores diretos comuns antes de armazenar a conversa."""
        import re

        redacted = re.sub(
            r"\b[A-Za-z0-9.!#$%&'*+/=?^_`{|}~-]+@[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?(?:\.[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?)+\b",
            "[e-mail removido]",
            content,
        )
        redacted = re.sub(
            r"\b\d{3}[.\s-]?\d{3}[.\s-]?\d{3}[-\s]?\d{2}\b",
            "[CPF removido]",
            redacted,
        )
        redacted = re.sub(
            r"\b\d{1,2}[.\s]?\d{3}[.\s]?\d{3}[-\s]?[0-9Xx]\b",
            "[RG removido]",
            redacted,
        )
        redacted = re.sub(
            r"(?<!\d)(?:\+?55[\s-]?)?(?:\(?\d{2}\)?[\s-]?)?(?:9?\d{4})[\s-]?\d{4}(?!\d)",
            "[telefone removido]",
            redacted,
        )
        redacted = re.sub(
            r"(?<!\d)(?:\d[ -]?){12,18}\d(?!\d)",
            "[cartão removido]",
            redacted,
        )
        return redacted[:4_000]

    try:
        now = _utcnow()
        documents = (
            {"role": "user", "content": redact_for_storage(user_content), "created_at": now},
            {"role": "assistant", "content": redact_for_storage(assistant_content), "created_at": now},
        )
        update_pipeline = [
            {
                "$set": {
                    "messages": {
                        "$slice": [
                            {
                                "$concatArrays": [
                                    {
                                        "$cond": [
                                            {
                                                "$gt": [
                                                    {"$ifNull": ["$expires_at", now]},
                                                    now,
                                                ]
                                            },
                                            {"$ifNull": ["$messages", []]},
                                            [],
                                        ]
                                    },
                                    documents,
                                ]
                            },
                            -MAX_STORED_MESSAGES,
                        ]
                    },
                    "expires_at": now + SESSION_TTL,
                    "updated_at": now,
                    "created_at": {"$ifNull": ["$created_at", now]},
                }
            }
        ]
        with conversation_session_lock(session_id):
            _get_collection().update_one(
                {"_id": session_id},
                update_pipeline,
                upsert=True,
            )
        return True
    except (ConversationStoreUnavailable, PyMongoError):
        logger.warning("Não foi possível persistir o histórico MongoDB deste turno.")
        return False
