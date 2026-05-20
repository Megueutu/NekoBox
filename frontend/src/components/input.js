import { Icon } from "./icon.js";

const template = `
  <div class="input-wrapper">
    <div data-icon></div>
    <input data-input type="text">
  </div>
`;

/**
 * Creates an Input component.
 * @param {String} icon - Icon name
 * @param {String} placeholder - Input placeholder text
 * @returns {HTMLDivElement} Returns a <div> with icon and input.
 */
export function Input(icon, placeholder) {
  if (!icon) throw new TypeError("Must tell icon param.");
  if (!placeholder) throw new TypeError("Must tell placeholder param.");

  const wrapper = document.createElement("div");
  wrapper.innerHTML = template;

  const iconSlot = wrapper.querySelector("[data-icon]");
  const input = wrapper.querySelector("[data-input]");

  iconSlot.appendChild(Icon(icon));
  input.placeholder = placeholder;

  return wrapper.firstElementChild;
}