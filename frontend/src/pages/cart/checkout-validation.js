const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateCheckout(values) {
  const normalized = {
    name: String(values.name || "").trim(),
    email: String(values.email || "").trim(),
    paymentMethod: String(values.paymentMethod || ""),
    termsAccepted: Boolean(values.termsAccepted),
  };
  const errors = {};

  if (normalized.name.length < 3) {
    errors.name = "Informe um nome com pelo menos 3 caracteres.";
  } else if (normalized.name.length > 80) {
    errors.name = "O nome deve ter no máximo 80 caracteres.";
  }

  if (!EMAIL_PATTERN.test(normalized.email)) {
    errors.email = "Informe um e-mail válido.";
  }

  if (normalized.paymentMethod !== "balance") {
    errors.paymentMethod = "Selecione uma forma de pagamento válida.";
  }

  if (!normalized.termsAccepted) {
    errors.termsAccepted = "Confirme que esta é uma compra de demonstração.";
  }

  return {
    values: normalized,
    errors,
    isValid: Object.keys(errors).length === 0,
  };
}
