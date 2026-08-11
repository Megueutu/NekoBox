"""Camada de modelos do GameBot com fallback Gemini → Groq.

As credenciais e nomes dos modelos são lidos exclusivamente das variáveis de
ambiente já carregadas pela aplicação. Nenhum valor sensível é registrado.
"""

from __future__ import annotations

import logging
import os
from dataclasses import dataclass, replace
from typing import Any, Iterable

from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_groq import ChatGroq

logger = logging.getLogger(__name__)

_DEFAULT_GEMINI_MODEL = "gemini-2.0-flash"
_DEFAULT_GROQ_MODEL = "llama-3.3-70b-versatile"


class ModelProviderUnavailable(RuntimeError):
    """Indica que nenhum provedor configurado conseguiu atender o turno."""


def _environment_value(name: str, default: str = "") -> str:
    return os.getenv(name, default).strip()


def models_configured() -> bool:
    """Informa se pelo menos um provedor de modelo possui credencial configurada."""
    return bool(_environment_value("GOOGLE_API_KEY") or _environment_value("GROQ_API_KEY"))


def _available_providers() -> tuple[str, ...]:
    """Define Gemini como primário e Groq como fallback quando ambos existem."""
    providers: list[str] = []
    if _environment_value("GOOGLE_API_KEY"):
        providers.append("gemini")
    if _environment_value("GROQ_API_KEY"):
        providers.append("groq")
    return tuple(providers)


def _build_model(provider: str, *, temperature: float, max_output_tokens: int):
    """Cria o adaptador LangChain com parâmetros compatíveis com cada provedor."""
    if provider == "gemini":
        return ChatGoogleGenerativeAI(
            model=_environment_value("GEMINI_MODEL", _DEFAULT_GEMINI_MODEL),
            temperature=temperature,
            max_output_tokens=max_output_tokens,
        )
    if provider == "groq":
        return ChatGroq(
            model=_environment_value("GROQ_MODEL", _DEFAULT_GROQ_MODEL),
            temperature=temperature,
            max_tokens=max_output_tokens,
        )
    raise ValueError(f"Provedor de modelo não suportado: {provider}")


def _status_code(error: BaseException) -> int | None:
    """Extrai um código HTTP sem depender de uma classe de exceção específica."""
    for attribute in ("status_code", "status"):
        value = getattr(error, attribute, None)
        if callable(value):
            try:
                value = value()
            except TypeError:
                value = None
        if isinstance(value, int):
            return value

    code = getattr(error, "code", None)
    if callable(code):
        try:
            code = code()
        except TypeError:
            code = None
    if isinstance(code, int):
        return code
    return None


def _is_provider_unavailable(error: BaseException) -> bool:
    """Reconhece apenas indisponibilidades transitórias elegíveis ao fallback."""
    visited: set[int] = set()
    current: BaseException | None = error

    for _ in range(6):
        if current is None or id(current) in visited:
            break
        visited.add(id(current))

        if isinstance(current, TimeoutError):
            return True

        status = _status_code(current)
        if status == 429 or 500 <= (status or 0) <= 599:
            return True

        module = type(current).__module__
        class_name = type(current).__name__.lower()
        message = str(current).lower()
        if module.startswith("httpx") and any(
            marker in class_name for marker in ("timeout", "connect", "network")
        ):
            return True
        if any(
            marker in message
            for marker in (
                "resource_exhausted",
                "rate limit",
                "too many requests",
                "quota",
                "timeout",
                "temporarily unavailable",
                "service unavailable",
            )
        ):
            return True

        current = current.__cause__ or current.__context__

    return False


def invoke_with_fallback(
    messages: Any,
    *,
    temperature: float,
    max_output_tokens: int,
    tools: Iterable[Any] = (),
) -> Any:
    """Invoca Gemini e tenta Groq somente para falhas transitórias elegíveis."""
    providers = _available_providers()
    if not providers:
        raise ModelProviderUnavailable("Nenhum provedor de modelo está configurado.")

    bound_tools = tuple(tools)
    last_error: Exception | None = None
    for provider in providers:
        try:
            model = _build_model(
                provider,
                temperature=temperature,
                max_output_tokens=max_output_tokens,
            )
            if bound_tools:
                model = model.bind_tools(bound_tools)
            return model.invoke(messages)
        except Exception as error:
            if not _is_provider_unavailable(error):
                raise
            last_error = error
            logger.warning(
                "Provedor de IA indisponível; tentando o próximo fallback. provider=%s error_type=%s",
                provider,
                type(error).__name__,
            )

    raise ModelProviderUnavailable("Todos os provedores configurados estão indisponíveis.") from last_error


@dataclass(frozen=True)
class FallbackChatModel:
    """Adaptador mínimo compatível com ``bind_tools(...).invoke(...)`` do LangChain."""

    temperature: float
    max_output_tokens: int
    tools: tuple[Any, ...] = ()

    def bind_tools(self, tools: Iterable[Any]) -> "FallbackChatModel":
        return replace(self, tools=tuple(tools))

    def invoke(self, messages: Any) -> Any:
        return invoke_with_fallback(
            messages,
            temperature=self.temperature,
            max_output_tokens=self.max_output_tokens,
            tools=self.tools,
        )
