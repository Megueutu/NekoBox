import { Icon, icons } from "./Icon";

export function fieldTooltip(label, helpText) {
  if (!helpText) return "";
  return `<button class="field-tooltip" type="button" aria-label="${label}: ${helpText}" data-tooltip="${helpText}">${Icon(icons.help, { className: "w-3.5 h-3.5" })}</button>`;
}
