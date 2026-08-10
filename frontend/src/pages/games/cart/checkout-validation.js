export function validateCheckout(values) {
  const normalized = {
    paymentMethod: String(values.paymentMethod || ""),
  };
  const errors = {};

  if (normalized.paymentMethod !== "balance") {
    errors.paymentMethod = "Selecione uma forma de pagamento válida.";
  }

  return {
    values: normalized,
    errors,
    isValid: Object.keys(errors).length === 0,
  };
}
