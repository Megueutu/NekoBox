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
from urllib.parse import quote

import psycopg2
from psycopg2 import pool

from agents.config import load_project_environment

load_project_environment()

logger = logging.getLogger(__name__)


def _jdbc_to_postgres_url(jdbc_url: str) -> str:
    """Converte a URL JDBC opcional do .env em uma DSN aceita pelo psycopg2."""
    if not jdbc_url.startswith("jdbc:postgresql://"):
        return ""

    database_url = jdbc_url.removeprefix("jdbc:")
    username = os.getenv("BD_ADMIN", "").strip()
    password = os.getenv("BD_SENHA", "")
    if not username:
        return database_url

    credentials = quote(username, safe="")
    if password:
        credentials += f":{quote(password, safe='')}"
    scheme, location = database_url.split("://", maxsplit=1)
    return f"{scheme}://{credentials}@{location}"


def _database_url_from_environment() -> str:
    """Obtém a conexão sem expor ou registrar credenciais."""
    direct_url = os.getenv("DATABASE_URL", "").strip()
    if direct_url:
        return direct_url

    jdbc_url = _jdbc_to_postgres_url(os.getenv("BD_URL", "").strip())
    if jdbc_url:
        return jdbc_url

    database = os.getenv("POSTGRES_DB", "").strip()
    username = os.getenv("POSTGRES_USER", "").strip()
    password = os.getenv("POSTGRES_PASSWORD", "")
    host = os.getenv("POSTGRES_HOST", "localhost").strip()
    port = os.getenv("POSTGRES_PORT", "5433").strip()
    if not all((database, username, password, host, port)):
        return ""

    return (
        "postgresql://"
        f"{quote(username, safe='')}:{quote(password, safe='')}@"
        f"{host}:{port}/{database}"
    )


_DATABASE_URL = _database_url_from_environment()

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

    conn = None
    try:
        conn = p.getconn()
        with conn.cursor() as cursor:
            cursor.execute("SELECT 1")
        return True
    except Exception:
        return False
    finally:
        if conn is not None:
            try:
                p.putconn(conn)
            except Exception:
                logger.warning("Não foi possível devolver conexão do health check ao pool.")


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
