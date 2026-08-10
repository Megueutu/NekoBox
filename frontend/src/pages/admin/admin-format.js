export const money = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});
export const compactDate = new Intl.DateTimeFormat("pt-BR", {
  dateStyle: "short",
});

export function formatDate(value, formatter = compactDate) {
  if (!value) return "—";
  const normalized = /^\d{4}-\d{2}-\d{2}$/.test(value) ? `${value}T00:00:00` : value;
  return formatter.format(new Date(normalized));
}
