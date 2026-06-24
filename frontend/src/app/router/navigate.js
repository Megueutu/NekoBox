export function navigate(url) {
  window.history.pushState({}, "", url);
  window.dispatchEvent(new CustomEvent("rerender"));
}
