import { CloudOff, createElement } from "lucide";

const MISSING_MEDIA_SVG = createElement(CloudOff, {
  xmlns: "http://www.w3.org/2000/svg",
  width: 800,
  height: 600,
  viewBox: "-12 -9 48 42",
  preserveAspectRatio: "xMidYMid meet",
  color: "#8d829d",
  style: "background-color:#151419",
  "data-lucide": "cloud-off",
  "stroke-width": 1.5,
  focusable: "false",
  "aria-hidden": "true",
}).outerHTML;

export const MISSING_MEDIA_URL = `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(MISSING_MEDIA_SVG)}`;

export function setupMediaFallbacks(root = document) {
  const handleImageError = (event) => {
    const image = event.target;
    if (!(image instanceof HTMLImageElement) || image.src === MISSING_MEDIA_URL) return;

    image.src = MISSING_MEDIA_URL;
    image.removeAttribute("srcset");
  };

  root.addEventListener("error", handleImageError, true);
  return () => root.removeEventListener("error", handleImageError, true);
}
