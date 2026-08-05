import { Icon, icons } from "./Icon";

export function FormField({
  id,
  label,
  type = "text",
  placeholder = "",
  value = "",
  autocomplete,
  helpText = "",
  pattern,
  minLength,
  maxLength,
}) {
  const isPassword = type === "password";
  const fieldIcon = type === "email" ? icons.mail : isPassword ? icons.lock : icons.user;
  const resolvedAutocomplete = autocomplete ?? (isPassword ? "current-password" : type);
  const help = helpText
    ? `<button class="field-tooltip" type="button" aria-label="${label}: ${helpText}" data-tooltip="${helpText}">${Icon(icons.help, { className: "w-3.5 h-3.5" })}</button>`
    : "";

  return `
    <div class="auth-field">
      <div class="auth-field__heading"><label for="${id}" class="auth-field__label"><span>${label}</span><span class="field-required" aria-hidden="true">*</span></label>${help}</div>
      <div class="auth-field__control">
        <span class="auth-field__icon">${Icon(fieldIcon, { className: "w-4 h-4" })}</span>
        <input id="${id}" name="${id}" type="${type}" autocomplete="${resolvedAutocomplete}" placeholder="${placeholder}" value="${value}" ${pattern ? `pattern="${pattern}"` : ""} ${minLength ? `minlength="${minLength}"` : ""} ${maxLength ? `maxlength="${maxLength}"` : ""} required
               class="ui-control auth-field__input${isPassword ? " auth-field__input--password" : ""}"/>
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
