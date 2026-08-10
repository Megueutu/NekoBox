export function navigate(url, { focusTarget = "#main-content" } = {}) {
  window.history.pushState({}, "", url);
  window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  window.dispatchEvent(new CustomEvent("rerender", { detail: { focusTarget } }));
}
