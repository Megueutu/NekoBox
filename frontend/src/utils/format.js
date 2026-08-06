export function formatPrice(price) {
  if (Number(price) === 0) return "Gratuito";
  return Number(price).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export function isFreeGame(game) {
  return Number(game?.price) === 0;
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
