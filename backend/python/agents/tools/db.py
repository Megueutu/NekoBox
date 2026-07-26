"""
Database Connection Pool
------------------------
Centraliza conexão com PostgreSQL usando psycopg2 com connection pooling.
A DATABASE_URL é lida do .env (configurado via python-dotenv).

Usa ThreadedConnectionPool para reutilizar conexões entre requests,
reduzindo overhead de conexão (especialmente com FastAPI + threads).

Inclui fallback gracioso: se o banco estiver fora, retorna mensagem
amigável em vez de exceção, permitindo que o agente continue operando.

Uso:
    from agents.tools.db import get_connection, db_available

    # Verificar disponibilidade
    if not db_available():
        return "Serviço temporariamente indisponível"

    # Usar conexão do pool
    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute("SELECT ...")
            rows = cur.fetchall()
"""

import logging
import os
from contextlib import contextmanager

import psycopg2
from psycopg2 import pool
from dotenv import load_dotenv

load_dotenv()

logger = logging.getLogger(__name__)

_DATABASE_URL: str = os.getenv("DATABASE_URL", "")

# ---------------------------------------------------------------------------
# Connection Pool (singleton)
# ---------------------------------------------------------------------------

_connection_pool: pool.ThreadedConnectionPool | None = None

# Mensagem padrão de fallback quando o banco está indisponível
DB_UNAVAILABLE_MSG = (
    "⚠️ Estou com dificuldade para acessar os dados no momento. "
    "Tente novamente em alguns instantes. Se o problema persistir, "
    "entre em contato com o suporte."
)


def _init_pool() -> pool.ThreadedConnectionPool | None:
    """
    Inicializa o connection pool. Retorna None se não conseguir conectar.
    minconn=2: mantém 2 conexões abertas (suficiente para baixo tráfego)
    maxconn=10: escala até 10 conexões simultâneas
    """
    global _connection_pool

    if not _DATABASE_URL:
        logger.warning("DATABASE_URL não configurada. Banco indisponível.")
        return None

    try:
        _connection_pool = pool.ThreadedConnectionPool(
            minconn=2,
            maxconn=10,
            dsn=_DATABASE_URL,
        )
        logger.info("Connection pool PostgreSQL inicializado com sucesso.")
        return _connection_pool
    except psycopg2.OperationalError as e:
        logger.error(f"Falha ao conectar ao banco: {e}")
        _connection_pool = None
        return None


def _get_pool() -> pool.ThreadedConnectionPool | None:
    """Retorna o pool existente ou tenta inicializar."""
    global _connection_pool
    if _connection_pool is None or _connection_pool.closed:
        return _init_pool()
    return _connection_pool


# ---------------------------------------------------------------------------
# Public API
# ---------------------------------------------------------------------------

def db_available() -> bool:
    """
    Verifica se o banco de dados está disponível.
    Útil para checks rápidos antes de executar queries.
    """
    p = _get_pool()
    if p is None:
        return False

    try:
        conn = p.getconn()
        conn.cursor().execute("SELECT 1")
        p.putconn(conn)
        return True
    except Exception:
        return False


@contextmanager
def get_connection():
    """
    Context manager que fornece uma conexão do pool.
    Faz commit automático ao sair sem erro; rollback em caso de exceção.
    Devolve a conexão ao pool ao finalizar (não fecha).

    Raises:
        ConnectionError: Se o banco estiver indisponível.
    """
    p = _get_pool()
    if p is None:
        raise ConnectionError(DB_UNAVAILABLE_MSG)

    conn = None
    try:
        conn = p.getconn()
        yield conn
        conn.commit()
    except psycopg2.OperationalError as e:
        # Banco caiu durante a operação
        logger.error(f"Erro operacional no banco: {e}")
        if conn:
            conn.rollback()
        raise ConnectionError(DB_UNAVAILABLE_MSG) from e
    except Exception:
        if conn:
            conn.rollback()
        raise
    finally:
        if conn:
            p.putconn(conn)


def close_pool():
    """Fecha todas as conexões do pool. Usar no shutdown da aplicação."""
    global _connection_pool
    if _connection_pool and not _connection_pool.closed:
        _connection_pool.closeall()
        logger.info("Connection pool fechado.")
    _connection_pool = None
