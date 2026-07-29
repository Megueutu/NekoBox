"""
GameBot API — FastAPI
=====================
Servidor REST para o chatbot GameBot com arquitetura multi-agente.

Endpoints:
  POST /chat           — Envia mensagem e recebe resposta do agente
  GET  /health         — Health check (verifica banco + API key)
  GET  /               — Info básica da API

Execução:
  uvicorn main:app --reload --port 8000
"""

import logging
import os
from contextlib import asynccontextmanager
from pathlib import Path

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

load_dotenv(Path(__file__).resolve().parents[2] / ".env")

# Logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)s | %(name)s | %(message)s",
)
logger = logging.getLogger("gamebot")


# ---------------------------------------------------------------------------
# Lifespan — startup/shutdown hooks
# ---------------------------------------------------------------------------

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Gerencia ciclo de vida da aplicação: pool de banco."""
    from agents.tools.db import _get_pool, close_pool

    logger.info("Inicializando GameBot API...")

    # Inicializa pool de conexões
    pool = _get_pool()
    if pool:
        logger.info("Connection pool PostgreSQL pronto.")
    else:
        logger.warning("Banco de dados indisponível. Tools de dados retornarão fallback.")

    # Verifica API key
    if not os.getenv("GOOGLE_API_KEY"):
        logger.warning("GOOGLE_API_KEY não configurada. LLM não funcionará.")

    yield

    # Shutdown — fecha pool
    close_pool()
    logger.info("GameBot API encerrada.")


# ---------------------------------------------------------------------------
# App
# ---------------------------------------------------------------------------

app = FastAPI(
    title="GameBot API",
    description="API do assistente virtual GameBot — plataforma de jogos digitais",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS — ajuste as origins conforme seu frontend
allowed_origins = [
    origin.strip()
    for origin in os.getenv("APP_CORS_ALLOWED_ORIGINS", "http://localhost:5173,http://127.0.0.1:5173").split(",")
    if origin.strip()
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ---------------------------------------------------------------------------
# Schemas
# ---------------------------------------------------------------------------

class ChatRequest(BaseModel):
    """Payload de entrada para o endpoint de chat."""
    message: str = Field(..., min_length=1, max_length=2000, description="Mensagem do usuário")
    session_id: str = Field(default="default", description="ID da sessão para manter contexto")
    usuario_id: int | None = Field(default=None, description="ID do usuário autenticado (opcional)")


class ChatResponse(BaseModel):
    """Payload de resposta do chat."""
    response: str = Field(..., description="Resposta do GameBot")
    session_id: str = Field(..., description="ID da sessão utilizada")


class HealthResponse(BaseModel):
    """Payload do health check."""
    status: str
    database: str
    llm_configured: bool


# ---------------------------------------------------------------------------
# Endpoints
# ---------------------------------------------------------------------------

@app.get("/", tags=["Info"])
async def root():
    """Informações básicas da API."""
    return {
        "name": "GameBot API",
        "version": "1.0.0",
        "description": "Assistente virtual para plataforma de jogos digitais",
        "docs": "/docs",
    }


@app.get("/health", response_model=HealthResponse, tags=["Health"])
async def health_check():
    """
    Verifica a saúde da aplicação:
    - Conectividade com banco de dados
    - Configuração da API key do LLM
    """
    from agents.tools.db import db_available

    db_ok = db_available()
    llm_ok = bool(os.getenv("GOOGLE_API_KEY"))

    status = "healthy" if (db_ok and llm_ok) else "degraded"

    return HealthResponse(
        status=status,
        database="connected" if db_ok else "unavailable",
        llm_configured=llm_ok,
    )


@app.post("/chat", response_model=ChatResponse, tags=["Chat"])
async def chat_endpoint(request: ChatRequest):
    """
    Envia uma mensagem ao GameBot e recebe a resposta.

    O fluxo interno é:
    Input Guard → Router → Especialista → Tools → Output Guard → Resposta

    Se o usuario_id for fornecido, tools de carrinho, biblioteca e pagamentos
    funcionarão com dados do usuário autenticado.
    """
    from agents.gamebot_agent import chat

    try:
        response = chat(
            user_input=request.message,
            session_id=request.session_id,
            usuario_id=request.usuario_id,
        )

        return ChatResponse(
            response=response,
            session_id=request.session_id,
        )

    except Exception as e:
        logger.error(f"Erro no processamento do chat: {e}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail="Ocorreu um erro interno. Tente novamente em instantes.",
        )
