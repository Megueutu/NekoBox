import { COLOR } from "../constants/color";

const template = `<img data-icon>`;

/**
 * Creates an Icon component.
 * @param {String} icon - Icon name
 * @param {String} [label = null] - Tag alt informations
 * @param {String} [color = COLOR["WHITE"]] - Color of the SVG
 * @returns {HTMLImageElement} Returns an <img> configurated.
 */
export function Icon(icon, label = null, color = COLOR["WHITE"]) {
  if (!icon) throw new TypeError("Must tell icon param.");

  const wrapper = document.createElement("div");
  wrapper.innerHTML = template;

  const element = wrapper.querySelector("[data-icon]");
  element.src = `./assets/icons/${icon.toLowerCase()}.svg`;
  
  if (label !== null) element.alt = label;

  return element;
}