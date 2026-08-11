"""Configurações compartilhadas dos agentes.

Carrega o arquivo .env da raiz do repositório em execução local. Em Docker,
as variáveis injetadas pelo ambiente têm prioridade e o arquivo não é exigido.
"""

from pathlib import Path

from dotenv import load_dotenv

PYTHON_ROOT = Path(__file__).resolve().parent.parent
PROJECT_ROOT = PYTHON_ROOT.parent.parent
ENV_FILE = PROJECT_ROOT / ".env"


def load_project_environment() -> bool:
    """Carrega variáveis locais sem sobrescrever variáveis já injetadas."""
    return load_dotenv(dotenv_path=ENV_FILE, override=False)


load_project_environment()
