import { Icon } from "./icon.js";

const SOCIAL = {
  google : "./assets/icons/social/google.svg",
  github : "./assets/icons/social/github.svg",
  facebook : "./assets/icons/social/facebook.svg",
}

const TEMPLATES = {
  default : `<button data-button><span data-label></span></button>`,
  wicon : `<button data-button><div data-icon></div><span data-label></span></button>`,
  auth : `<button data-button><img data-auth></button>`,
}

/**
 * Creates a Button component.
 * @param {String} label - Button label text
 * @param {String} [variant = "default"] - Button variant (default, wicon, auth)
 * @param {String} [icon = null] - Icon name for wicon variant
 * @param {String} [social = null] - Social provider for auth variant (google, github, facebook)
 * @returns {HTMLButtonElement} Returns a <button> configurated.
 */
export function Button(label, variant = "default", icon = null, social = null) {
  if (!label) throw new TypeError("Must tell label param.");
  if (!TEMPLATES[variant]) throw new TypeError(`Invalid variant: ${variant}`);
  if (variant === "wicon" && !icon) throw new TypeError("Must tell icon param for this variant.");
  if (variant === "auth" && !social) throw new TypeError("Must tell social param for this variant.");
  if (variant === "auth" && !SOCIAL[social]) throw new TypeError(`Invalid social provider: ${social}`);

  const wrapper = document.createElement("div");
  wrapper.innerHTML = TEMPLATES[variant];

  const element = wrapper.querySelector("[data-button]");

  if (variant === "default" || variant === "wicon") {
    const labelSlot = element.querySelector("[data-label]");
    labelSlot.textContent = label;
  }

  if (variant === "wicon") { 
    const iconSlot = element.querySelector("[data-icon]");
    iconSlot.appendChild(Icon(icon));
  }

  if (variant === "auth") {
    const img = element.querySelector("[data-auth]");
    img.src = getSocialIcon(social);
    img.alt = social;
  }

  return element;
}

/**
 * Returns the SVG path for a social provider.
 * @param {String} social - Social provider name
 * @returns {String} Returns the SVG path.
 */
function getSocialIcon(social) {
  return SOCIAL[social.toLowerCase()];
}