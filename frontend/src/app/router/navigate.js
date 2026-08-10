export function navigate(url, { focusTarget = "#main-content" } = {}) {
  window.history.pushState({}, "", url);
  window.scrollTo(0, 0);
  window.dispatchEvent(new CustomEvent("rerender", { detail: { focusTarget } }));
}
