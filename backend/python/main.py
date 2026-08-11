"""API FastAPI do GameBot."""

import asyncio
import logging
import os
from contextlib import asynccontextmanager
from typing import Literal
from uuid import uuid4

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from agents.config import load_project_environment

load_project_environment()

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)s | %(name)s | %(message)s",
)
logger = logging.getLogger("gamebot")


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Inicializa PostgreSQL e a memória MongoDB sem bloquear o event loop."""
    from agents.conversation_store import (
        close_conversation_store,
        initialize_conversation_store,
    )
    from agents.tools.db import _get_pool, close_pool

    logger.info("Inicializando GameBot API...")
    pool = await asyncio.to_thread(_get_pool)
    if pool:
        logger.info("Connection pool PostgreSQL pronto para as ferramentas do marketplace.")
    else:
        logger.warning("PostgreSQL indisponível. Ferramentas de dados retornarão fallback.")

    if await asyncio.to_thread(initialize_conversation_store):
        logger.info("Memória MongoDB do chat pronta.")
    else:
        logger.warning("MongoDB indisponível. O chat seguirá sem memória persistente.")

    if not os.getenv("GOOGLE_API_KEY"):
        logger.warning("GOOGLE_API_KEY não configurada. O modelo não poderá responder.")

    try:
        yield
    finally:
        await asyncio.to_thread(close_conversation_store)
        close_pool()
        logger.info("GameBot API encerrada.")


app = FastAPI(
    title="GameBot API",
    description="API do assistente virtual GameBot — plataforma de jogos digitais",
    version="1.1.0",
    lifespan=lifespan,
)

allowed_origins = [
    origin.strip()
    for origin in os.getenv(
        "APP_CORS_ALLOWED_ORIGINS",
        "http://localhost:5173,http://127.0.0.1:5173",
    ).split(",")
    if origin.strip()
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class ChatRequest(BaseModel):
    """Payload de entrada para uma mensagem de chat."""

    message: str = Field(..., min_length=1, max_length=2000, description="Mensagem do usuário")
    session_id: str | None = Field(
        default=None,
        min_length=1,
        max_length=128,
        pattern=r"^[A-Za-z0-9][A-Za-z0-9_-]*$",
        description="ID opaco da sessão; a API gera um se ele não for informado",
    )
    usuario_id: int | None = Field(
        default=None,
        description="ID de usuário disponível para as ferramentas autenticadas",
    )


class AvailabilityResponse(BaseModel):
    """Disponibilidade pública dos serviços usados no turno."""

    model: Literal["available", "not_used"]
    database: Literal["available", "unavailable"]
    support_handoff: Literal["manual"]


class ChatResponse(BaseModel):
    """Resposta textual do agente e metadados seguros para a interface."""

    response: str
    session_id: str
    intent: str
    blocked: bool
    sources: list[str] = Field(default_factory=list)
    availability: AvailabilityResponse


class HealthResponse(BaseModel):
    status: str
    database: str
    conversation_memory: str
    llm_configured: bool


@app.get("/", tags=["Info"])
async def root():
    return {
        "name": "GameBot API",
        "version": "1.1.0",
        "description": "Assistente virtual para plataforma de jogos digitais",
        "docs": "/docs",
    }


@app.get("/health", response_model=HealthResponse, tags=["Health"])
async def health_check():
    """Distingue PostgreSQL das ferramentas e MongoDB da memória do chat."""
    from agents.conversation_store import conversation_store_available
    from agents.tools.db import db_available

    db_ok, memory_ok = await asyncio.gather(
        asyncio.to_thread(db_available),
        asyncio.to_thread(conversation_store_available),
    )
    llm_ok = bool(os.getenv("GOOGLE_API_KEY"))
    return HealthResponse(
        status="healthy" if db_ok and memory_ok and llm_ok else "degraded",
        database="connected" if db_ok else "unavailable",
        conversation_memory="connected" if memory_ok else "unavailable",
        llm_configured=llm_ok,
    )


@app.post("/chat", response_model=ChatResponse, tags=["Chat"])
async def chat_endpoint(request: ChatRequest):
    """Processa o agente síncrono em uma thread, sem bloquear o FastAPI."""
    from agents.gamebot_agent import ModelUnavailableError, chat_with_metadata

    session_id = request.session_id or uuid4().hex
    try:
        result = await asyncio.to_thread(
            chat_with_metadata,
            user_input=request.message,
            session_id=session_id,
            usuario_id=request.usuario_id,
        )
        return ChatResponse(
            response=result.response,
            session_id=result.session_id,
            intent=result.intent,
            blocked=result.blocked,
            sources=list(result.sources),
            availability=AvailabilityResponse(
                model=result.availability.model,
                database=result.availability.database,
                support_handoff=result.availability.support_handoff,
            ),
        )
    except ModelUnavailableError:
        logger.warning("Modelo indisponível para a solicitação de chat.")
        raise HTTPException(
            status_code=503,
            detail="O assistente está temporariamente indisponível porque o modelo de IA não pode responder. Tente novamente em instantes.",
        )
    except Exception as error:
        logger.error("Erro no processamento do chat: %s", error, exc_info=True)
        raise HTTPException(
            status_code=500,
            detail="Ocorreu um erro interno. Tente novamente em instantes.",
        )
