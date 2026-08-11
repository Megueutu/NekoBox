"""
Platform Tools — GameBot
------------------------
Ferramentas expostas ao agente LangGraph. Cada ferramenta consulta o banco
de dados PostgreSQL real (via DATABASE_URL no .env) com connection pooling.

Inclui fallback gracioso: se o banco estiver fora, retorna mensagem
amigável ao invés de crashar.

O usuario_id é passado via RunnableConfig pelo orquestrador, permitindo
que tools que precisam de autenticação leiam o ID automaticamente.
"""

from langchain_core.runnables import RunnableConfig
from langchain_core.tools import tool

from agents.tools.db import DB_UNAVAILABLE_MSG, get_connection


# ---------------------------------------------------------------------------
# Helpers internos
# ---------------------------------------------------------------------------

def _sanitize_output(text: str, max_chars: int = 600) -> str:
    """Trunca saídas longas para reduzir tokens no contexto do agente."""
    if len(text) > max_chars:
        return text[:max_chars] + "… [truncado]"
    return text


def _format_price(value) -> str:
    """Formata valor numérico como preço em reais."""
    if value is None:
        return "Preço não informado"
    if float(value) == 0:
        return "Gratuito"
    return f"R$ {float(value):,.2f}".replace(",", "X").replace(".", ",").replace("X", ".")


def _build_search_pattern(value: str) -> str | None:
    """Normaliza texto e escapa curingas para buscas ILIKE literais."""
    term = " ".join(value.split())
    if not term:
        return None

    escaped = term.replace("\\", "\\\\").replace("%", "\\%").replace("_", "\\_")
    return f"%{escaped}%"


def _get_usuario_id(config: RunnableConfig) -> int | None:
    """Extrai usuario_id do configurable injetado pelo orquestrador."""
    return config.get("configurable", {}).get("usuario_id")


# ---------------------------------------------------------------------------
# Ferramentas
# ---------------------------------------------------------------------------

@tool
def search_games(query: str) -> str:
    """
    Busca jogos publicados na plataforma pelo nome, descrição ou categoria.
    Use quando o usuário pedir recomendações ou quiser saber se um jogo existe.
    Retorna lista resumida com nome, categoria, preço e avaliação média.
    Parâmetro query: nome, gênero ou termo de busca (ex: 'RPG', 'Elden Ring').
    """
    search_term = _build_search_pattern(query)
    if search_term is None:
        return "Informe o nome, categoria ou outro termo para buscar jogos."

    try:
        with get_connection() as conn:
            with conn.cursor() as cur:
                cur.execute("""
                    SELECT DISTINCT p.id, p.titulo, p.preco, p.descricao_curta,
                           COALESCE(AVG(a.nota), 0) as media_nota,
                           STRING_AGG(DISTINCT c.nome, ', ') as categorias
                    FROM produtos p
                    LEFT JOIN avaliacoes a ON a.produto_id = p.id
                    LEFT JOIN produtos_categorias pc ON pc.produto_id = p.id
                    LEFT JOIN categorias c ON c.id = pc.categoria_id
                    WHERE p.status = 'published'
                      AND (
                          p.titulo ILIKE %s ESCAPE '\\'
                          OR p.descricao_curta ILIKE %s ESCAPE '\\'
                          OR p.descricao_longa ILIKE %s ESCAPE '\\'
                          OR c.nome ILIKE %s ESCAPE '\\'
                      )
                    GROUP BY p.id, p.titulo, p.preco, p.descricao_curta
                    ORDER BY media_nota DESC, p.titulo ASC
                    LIMIT 5
                """, (search_term, search_term, search_term, search_term))

                rows = cur.fetchall()
    except ConnectionError:
        return DB_UNAVAILABLE_MSG

    if not rows:
        return "Nenhum jogo encontrado para essa busca. Tente outros termos."

    results = []
    for row in rows:
        _id, titulo, preco, desc_curta, media, categorias = row
        nota_str = f"{float(media):.1f}/5" if media else "Sem avaliações"
        cat_str = categorias if categorias else "Sem categoria"
        results.append(
            f"• **{titulo}** | {cat_str} | {_format_price(preco)} | ⭐ {nota_str}"
        )

    result = "Jogos encontrados:\n" + "\n".join(results)
    return _sanitize_output(result)


@tool
def get_game_info(game_name: str) -> str:
    """
    Retorna detalhes de um jogo publicado: preço, descrição, categorias e avaliação.
    Use quando o usuário perguntar sobre preço, descrição ou detalhes de um jogo.
    Parâmetro game_name: nome exato ou parcial do jogo.
    """
    search_term = _build_search_pattern(game_name)
    if search_term is None:
        return "Informe o nome do jogo que deseja consultar."

    normalized_name = " ".join(game_name.split())
    try:
        with get_connection() as conn:
            with conn.cursor() as cur:
                cur.execute("""
                    SELECT p.id, p.titulo, p.preco, p.descricao_curta, p.descricao_longa,
                           COALESCE(AVG(a.nota), 0) as media_nota,
                           COUNT(a.id) as total_avaliacoes,
                           STRING_AGG(DISTINCT c.nome, ', ') as categorias
                    FROM produtos p
                    LEFT JOIN avaliacoes a ON a.produto_id = p.id
                    LEFT JOIN produtos_categorias pc ON pc.produto_id = p.id
                    LEFT JOIN categorias c ON c.id = pc.categoria_id
                    WHERE p.status = 'published'
                      AND p.titulo ILIKE %s ESCAPE '\\'
                    GROUP BY p.id, p.titulo, p.preco, p.descricao_curta, p.descricao_longa
                    ORDER BY CASE WHEN LOWER(p.titulo) = LOWER(%s) THEN 0 ELSE 1 END,
                             p.titulo ASC
                    LIMIT 1
                """, (search_term, normalized_name))

                row = cur.fetchone()
    except ConnectionError:
        return DB_UNAVAILABLE_MSG

    if not row:
        return f"Jogo '{normalized_name}' não encontrado na plataforma."

    _id, titulo, preco, desc_curta, desc_longa, media, total_av, categorias = row
    nota_str = f"{float(media):.1f}/5 ({total_av} avaliações)" if media else "Sem avaliações"
    cat_str = categorias if categorias else "Sem categoria"
    descricao = desc_curta or desc_longa or "Sem descrição disponível"

    info = (
        f"**{titulo}**\n"
        f"Categorias: {cat_str}\n"
        f"Preço: {_format_price(preco)}\n"
        f"Avaliação: ⭐ {nota_str}\n"
        f"Descrição: {descricao}"
    )
    return _sanitize_output(info)


@tool
def get_game_reviews(game_name: str) -> str:
    """
    Retorna as avaliações recentes de um jogo publicado.
    Use quando o usuário quiser saber opiniões de outros jogadores sobre um jogo.
    Parâmetro game_name: nome do jogo.
    """
    search_term = _build_search_pattern(game_name)
    if search_term is None:
        return "Informe o nome do jogo cujas avaliações deseja consultar."

    normalized_name = " ".join(game_name.split())
    try:
        with get_connection() as conn:
            with conn.cursor() as cur:
                cur.execute("""
                    SELECT u.nome_usuario, a.nota, a.recomenda, a.texto_avaliacao
                    FROM avaliacoes a
                    JOIN produtos p ON p.id = a.produto_id
                    JOIN usuarios u ON u.id = a.usuario_id
                    WHERE p.status = 'published'
                      AND p.titulo ILIKE %s ESCAPE '\\'
                    ORDER BY a.criado_em DESC
                    LIMIT 5
                """, (search_term,))

                rows = cur.fetchall()
    except ConnectionError:
        return DB_UNAVAILABLE_MSG

    if not rows:
        return f"Nenhuma avaliação encontrada para '{normalized_name}'."

    reviews = []
    for nome, nota, recomenda, texto in rows:
        rec_emoji = "👍" if recomenda else "👎"
        texto_review = texto[:80] + "..." if texto and len(texto) > 80 else (texto or "Sem comentário")
        reviews.append(f"• {rec_emoji} **{nome}** ({nota}/5): {texto_review}")

    result = "Avaliações recentes:\n" + "\n".join(reviews)
    return _sanitize_output(result)


@tool
def check_user_library(game_name: str, config: RunnableConfig) -> str:
    """
    Verifica se um jogo está na biblioteca do usuário.
    Use quando o usuário perguntar se já possui um jogo ou quiser ver tempo jogado.
    Parâmetro game_name: nome do jogo a verificar.
    """
    usuario_id = _get_usuario_id(config)
    if not usuario_id:
        return "Não foi possível identificar sua conta. Faça login para consultar sua biblioteca."

    try:
        with get_connection() as conn:
            with conn.cursor() as cur:
                search_term = f"%{game_name}%"
                cur.execute("""
                    SELECT p.titulo, b.tempo_jogo_minutos, b.adicionado_em
                    FROM biblioteca_usuarios b
                    JOIN produtos p ON p.id = b.produto_id
                    WHERE b.usuario_id = %s AND p.titulo ILIKE %s
                """, (usuario_id, search_term))

                row = cur.fetchone()
    except ConnectionError:
        return DB_UNAVAILABLE_MSG

    if not row:
        return f"O jogo '{game_name}' não está na sua biblioteca."

    titulo, minutos, data = row
    horas = minutos // 60
    mins = minutos % 60
    tempo_str = f"{horas}h {mins}min" if horas > 0 else f"{mins} minutos"

    return (
        f"✅ **{titulo}** está na sua biblioteca!\n"
        f"Tempo jogado: {tempo_str}\n"
        f"Adicionado em: {data.strftime('%d/%m/%Y')}"
    )


@tool
def get_cart_info(config: RunnableConfig) -> str:
    """
    Mostra os itens no carrinho do usuário com preços.
    Use quando o usuário perguntar sobre seu carrinho ou quiser ver o que vai comprar.
    """
    usuario_id = _get_usuario_id(config)
    if not usuario_id:
        return "Não foi possível identificar sua conta. Faça login para ver seu carrinho."

    try:
        with get_connection() as conn:
            with conn.cursor() as cur:
                cur.execute("""
                    SELECT p.titulo, p.preco
                    FROM carrinho_itens ci
                    JOIN carrinho c ON c.id = ci.carrinho_id
                    JOIN produtos p ON p.id = ci.produto_id
                    WHERE c.usuario_id = %s
                    ORDER BY ci.criado_em DESC
                """, (usuario_id,))

                rows = cur.fetchall()
    except ConnectionError:
        return DB_UNAVAILABLE_MSG

    if not rows:
        return "Seu carrinho está vazio. Que tal explorar alguns jogos?"

    items = []
    total = 0.0
    for titulo, preco in rows:
        preco_float = float(preco) if preco else 0
        total += preco_float
        items.append(f"• {titulo} — {_format_price(preco)}")

    result = (
        f"🛒 **Seu carrinho** ({len(rows)} {'item' if len(rows) == 1 else 'itens'}):\n"
        + "\n".join(items)
        + f"\n\n**Total: {_format_price(total)}**"
    )
    return _sanitize_output(result)


@tool
def check_payment_status(config: RunnableConfig) -> str:
    """
    Verifica o status dos pagamentos recentes do usuário.
    Use quando o usuário perguntar sobre status de compra, pagamentos pendentes
    ou problemas com transações.
    """
    usuario_id = _get_usuario_id(config)
    if not usuario_id:
        return "Não foi possível identificar sua conta. Faça login para ver suas transações."

    try:
        with get_connection() as conn:
            with conn.cursor() as cur:
                cur.execute("""
                    SELECT p.titulo, pg.valor_pago, pg.status
                    FROM pagamento pg
                    JOIN produtos p ON p.id = pg.produto_id
                    WHERE pg.usuario_id = %s
                    ORDER BY pg.id DESC
                    LIMIT 5
                """, (usuario_id,))

                rows = cur.fetchall()
    except ConnectionError:
        return DB_UNAVAILABLE_MSG

    if not rows:
        return "Nenhuma transação encontrada na sua conta."

    status_emoji = {
        "pendente": "⏳",
        "aprovado": "✅",
        "recusado": "❌",
        "reembolsado": "🔄",
    }

    items = []
    for titulo, valor, status in rows:
        emoji = status_emoji.get(status, "❓")
        items.append(f"• {emoji} {titulo} — {_format_price(valor)} ({status})")

    result = "Suas transações recentes:\n" + "\n".join(items)
    return _sanitize_output(result)


@tool
def escalate_to_support(reason: str) -> str:
    """
    Orienta o usuário a procurar o suporte humano pelo canal oficial.
    Use SOMENTE quando: (1) o problema técnico for complexo demais para resolver
    via chat, (2) envolver transações financeiras, reembolsos ou cobranças,
    ou (3) o usuário solicitar explicitamente falar com um humano.
    Esta ferramenta não cria tickets, protocolos nem envia mensagens ao suporte.
    Parâmetro reason: motivo resumido para o usuário informar ao suporte (máx. 100 chars).
    """
    reason_trimmed = reason.strip()[:100] or "Problema informado no atendimento pelo chat"
    return (
        "Não consigo abrir um chamado nem gerar um protocolo por este chat.\n"
        f"Resumo para informar ao suporte: {reason_trimmed}\n"
        "Para falar com uma pessoa, use o canal oficial de suporte da NekoBox "
        "disponível na plataforma."
    )


# ---------------------------------------------------------------------------
# Factory — agrupado por especialista
# ---------------------------------------------------------------------------

def get_recommendation_tools() -> list:
    """Ferramentas do especialista de recomendação/catálogo."""
    return [search_games, get_game_info, get_game_reviews]


def get_support_tools() -> list:
    """Ferramentas do especialista de suporte técnico."""
    return [get_game_info, check_user_library, escalate_to_support]


def get_sales_tools() -> list:
    """Ferramentas do especialista de vendas/carrinho."""
    return [get_game_info, get_cart_info, check_payment_status, escalate_to_support]


def get_all_tools() -> list:
    """Todas as ferramentas disponíveis (para o orquestrador)."""
    return [
        search_games,
        get_game_info,
        get_game_reviews,
        check_user_library,
        get_cart_info,
        check_payment_status,
        escalate_to_support,
    ]
