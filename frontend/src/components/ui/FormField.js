/**
 * Campo de formulário padrão (label + input) usado nos formulários de
 * autenticação. Centraliza as classes do input para evitar divergências
 * de estilo entre os formulários de login, cadastro e recuperação de senha.
 */
export function FormField({ id, label, type = "text", placeholder = "", value = "" }) {
  return `
    <div>
      <label for="${id}" class="block text-sm font-medium text-muted mb-1.5">${label}</label>
      <input id="${id}" name="${id}" type="${type}" autocomplete="${type === "password" ? "current-password" : type}" placeholder="${placeholder}" value="${value}" required
             class="w-full px-3 py-2.5 bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-[var(--radius-control)] text-sm text-[var(--color-ink)] placeholder:text-[var(--color-muted-2)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-500)] focus:border-transparent"/>
    </div>
  `;
}
