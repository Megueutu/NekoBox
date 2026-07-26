import { Icon, icons } from "./Icon";

export function FormField({
  id,
  label,
  type = "text",
  placeholder = "",
  value = "",
  autocomplete,
}) {
  const isPassword = type === "password";
  const fieldIcon = type === "email" ? icons.mail : isPassword ? icons.lock : icons.user;
  const resolvedAutocomplete = autocomplete ?? (isPassword ? "current-password" : type);

  return `
    <div class="auth-field">
      <label for="${id}" class="auth-field__label">${label}</label>
      <div class="auth-field__control">
        <span class="auth-field__icon">${Icon(fieldIcon, { className: "w-4 h-4" })}</span>
        <input id="${id}" name="${id}" type="${type}" autocomplete="${resolvedAutocomplete}" placeholder="${placeholder}" value="${value}" required
               class="auth-field__input${isPassword ? " auth-field__input--password" : ""}"/>
        ${
          isPassword
            ? `<button class="auth-field__toggle" type="button" data-password-toggle="${id}" aria-label="Mostrar senha" aria-pressed="false">
                ${Icon(icons.eye, { className: "w-4 h-4" })}
              </button>`
            : ""
        }
      </div>
    </div>
  `;
}
