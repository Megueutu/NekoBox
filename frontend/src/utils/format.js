export function formatPrice(price) {
  return price.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString("pt-BR", {
    day: "2-digit", month: "long", year: "numeric",
  });
}

export function formatPlaytime(minutes = 0) {
  const safeMinutes = Math.max(0, Number(minutes) || 0);
  if (safeMinutes < 60) return `${safeMinutes} min`;

  const hours = Math.floor(safeMinutes / 60);
  const remainingMinutes = safeMinutes % 60;
  return remainingMinutes > 0 ? `${hours} h ${remainingMinutes} min` : `${hours} h`;
}

/**
 * Calcula o percentual de avaliações positivas a partir das reviews reais do jogo.
 * Retorna null quando não há reviews (evita exibir selo com dado inexistente).
 */
export function getRecommendationRate(reviews) {
  if (!reviews?.length) return null;
  const positivas = reviews.filter((r) => r.recommended).length;
  return Math.round((positivas / reviews.length) * 100);
}
