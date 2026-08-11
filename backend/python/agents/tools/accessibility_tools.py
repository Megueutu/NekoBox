"""Recuperação local de conhecimento sobre acessibilidade do NekoBox.

As ferramentas leem apenas a base versionada e resumos de relatórios Lighthouse.
Elas não executam auditorias no navegador e não tratam a ausência de evidência
como conformidade.
"""

import json
import os
import re
from pathlib import Path
from statistics import median
from urllib.parse import urlsplit

from langchain_core.tools import tool

from agents.config import PROJECT_ROOT, PYTHON_ROOT, load_project_environment

load_project_environment()

_KNOWLEDGE_FILE = PYTHON_ROOT / "knowledge" / "accessibility-site.md"
_MAX_REPORT_SIZE = 1_000_000
_MAX_RAG_CHARS = 3_500
_STOP_WORDS = {
    "a", "as", "ao", "aos", "com", "da", "das", "de", "do", "dos", "e",
    "em", "é", "esse", "esta", "isso", "na", "nas", "no", "nos", "o", "os",
    "ou", "para", "por", "que", "se", "site", "um", "uma", "sobre",
}


def _display_path(path: Path) -> str:
    """Mostra um caminho relativo quando possível, sem expor dados do ambiente."""
    for root in (PROJECT_ROOT, PYTHON_ROOT):
        try:
            return path.relative_to(root).as_posix()
        except ValueError:
            continue
    return path.name


def _read_text(path: Path) -> str:
    """Lê arquivos textuais pequenos e devolve vazio para conteúdo indisponível."""
    try:
        if not path.is_file() or path.stat().st_size > _MAX_REPORT_SIZE:
            return ""
        return path.read_text(encoding="utf-8", errors="replace").strip()
    except OSError:
        return ""


def _tokenize(value: str) -> set[str]:
    return {
        token
        for token in re.findall(r"[a-zà-ÿ0-9]{3,}", value.lower())
        if token not in _STOP_WORDS
    }


def _chunk_markdown(source: str, content: str) -> list[dict[str, str]]:
    """Divide a base em blocos curtos para recuperação lexical local."""
    chunks: list[dict[str, str]] = []
    heading = "Visão geral"
    buffer: list[str] = []

    def flush() -> None:
        text = "\n".join(buffer).strip()
        if text:
            chunks.append({"source": source, "content": f"{heading}\n{text}"})

    for line in content.splitlines():
        if line.startswith("## ") or line.startswith("### "):
            flush()
            heading = line.lstrip("# ").strip()
            buffer = []
        else:
            buffer.append(line)
    flush()
    return chunks


def _lighthouse_directories() -> list[Path]:
    """Localiza diretórios de relatórios sem depender de caminhos do host."""
    candidates = [PYTHON_ROOT / "knowledge" / "lighthouse"]
    configured = os.getenv("ACCESSIBILITY_LIGHTHOUSE_DIR", "").strip()
    if configured:
        configured_path = Path(configured).expanduser()
        candidates.append(
            configured_path if configured_path.is_absolute() else PROJECT_ROOT / configured_path
        )
    candidates.extend([
        PROJECT_ROOT / ".docs" / "lighthouse",
        PROJECT_ROOT / ".docs",
    ])

    unique: list[Path] = []
    for candidate in candidates:
        if candidate not in unique:
            unique.append(candidate)
    return unique


def _lighthouse_files() -> list[Path]:
    """Retorna apenas relatórios JSON do Lighthouse, em ordem estável."""
    files: list[Path] = []
    seen: set[Path] = set()
    for directory in _lighthouse_directories():
        if not directory.is_dir():
            continue
        try:
            matches = directory.rglob("*.json")
            for report in matches:
                if report.is_file() and report not in seen:
                    files.append(report)
                    seen.add(report)
        except OSError:
            continue
    return sorted(files, key=lambda file: (file.stat().st_mtime, file.name))


def _load_lighthouse_record(path: Path) -> dict[str, object] | None:
    """Extrai somente metadados de acessibilidade de um relatório Lighthouse."""
    content = _read_text(path)
    if not content:
        return None
    try:
        payload = json.loads(content)
        raw_score = payload.get("categories", {}).get("accessibility", {}).get("score")
        if raw_score is None:
            return None
        score = float(raw_score)
        if 0 <= score <= 1:
            score *= 100
        if not 0 <= score <= 100:
            return None
        return {
            "source": _display_path(path),
            "url": payload.get("finalUrl") or payload.get("requestedUrl") or path.stem,
            "score": round(score, 1),
            "timestamp": payload.get("fetchTime") or "",
        }
    except (json.JSONDecodeError, TypeError, ValueError):
        return None


def _lighthouse_records() -> list[dict[str, object]]:
    return [record for path in _lighthouse_files() if (record := _load_lighthouse_record(path))]


def _page_kind(url: object) -> str:
    path = (urlsplit(str(url)).path or "/").rstrip("/") or "/"
    return "principal" if path in {"/", "/index.html"} else "interna"


def _summary_for_page(records: list[dict[str, object]], page_name: str) -> str:
    if len(records) < 3:
        return (
            f"{page_name.capitalize()}: encontrei {len(records)} relatório(s) válido(s). "
            "São necessárias 3 execuções para confirmar a mediana exigida."
        )

    latest = records[-3:]
    scores = [float(record["score"]) for record in latest]
    median_score = median(scores)
    status = "atende" if median_score >= 90 else "não atende"
    sources = ", ".join(str(record["source"]) for record in latest)
    formatted_scores = ", ".join(f"{score:.0f}" for score in scores)
    return (
        f"{page_name.capitalize()}: notas {formatted_scores}; mediana {median_score:.0f}. "
        f"Pela regra de 90 pontos, {status}. Fontes: {sources}."
    )


def _lighthouse_summary() -> str:
    records = _lighthouse_records()
    if not records:
        return (
            "Ainda não há relatórios Lighthouse JSON disponíveis para consulta. "
            "Isso não significa que o site falhou ou passou: a medição ainda precisa ser registrada."
        )

    home_records = [record for record in records if _page_kind(record["url"]) == "principal"]
    internal_records = [record for record in records if _page_kind(record["url"]) == "interna"]
    return "\n".join([
        "Resumo Lighthouse de acessibilidade:",
        _summary_for_page(home_records, "página principal"),
        _summary_for_page(internal_records, "página interna"),
        "A regra considera a mediana das 3 execuções de cada tipo de página.",
    ])


def get_accessibility_source_labels() -> list[str]:
    """Retorna apenas rótulos públicos das fontes usadas pelo especialista.

    Os rótulos são próprios para a interface e não revelam caminhos do projeto,
    nomes de arquivos, dados de usuários ou detalhes de execução.
    """
    labels: list[str] = []
    if _read_text(_KNOWLEDGE_FILE):
        labels.append("Base de acessibilidade do NekoBox")
    if _lighthouse_records():
        labels.append("Relatórios Lighthouse de acessibilidade")
    return labels


@tool
def search_accessibility_knowledge(question: str) -> str:
    """Recupera informações verificadas sobre recursos de acessibilidade do NekoBox.

    Use para explicar, sem jargão, como o site trata idioma, teclado, foco,
    formulários, movimento reduzido, responsividade e outros recursos. A saída
    informa a fonte e diferencia recurso implementado de item que ainda precisa
    de teste manual ou relatório Lighthouse.
    """
    content = _read_text(_KNOWLEDGE_FILE)
    if not content:
        return (
            "A base de conhecimento de acessibilidade não está disponível no momento. "
            "Não é possível afirmar quais recursos foram aplicados sem essa fonte."
        )

    chunks = _chunk_markdown(_display_path(_KNOWLEDGE_FILE), content)
    question_tokens = _tokenize(question)
    ranked = sorted(
        chunks,
        key=lambda chunk: len(question_tokens & _tokenize(chunk["content"])),
        reverse=True,
    )
    selected = ranked[:4]
    result = ["Base de conhecimento local do NekoBox:"]
    for chunk in selected:
        result.append(f"\nFonte: {chunk['source']}\n{chunk['content']}")

    report_summary = _lighthouse_summary()
    if "Lighthouse" in question or "nota" in question.lower() or "auditoria" in question.lower():
        result.append(f"\n{report_summary}")

    return "\n".join(result)[:_MAX_RAG_CHARS]


@tool
def get_lighthouse_accessibility_summary() -> str:
    """Mostra as notas Lighthouse de acessibilidade disponíveis e calcula a mediana.

    Use ao responder sobre pontuação, auditoria ou comprovação por Lighthouse.
    A ferramenta apenas interpreta relatórios JSON já salvos; ela não executa o
    Lighthouse, não inventa notas e não substitui testes manuais.
    """
    return _lighthouse_summary()
