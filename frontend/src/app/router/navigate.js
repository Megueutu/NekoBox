export function navigate(url, { focusTarget = "#main-content" } = {}) {
  window.history.pushState({}, "", url);
  window.dispatchEvent(new CustomEvent("rerender", { detail: { focusTarget } }));
}
