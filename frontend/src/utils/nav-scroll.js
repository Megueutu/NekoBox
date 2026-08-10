export function bindNavigationScroll(navSelector) {
  const navigation = document.querySelector(navSelector);
  if (!navigation) return;

  const controller = new AbortController();
  const updateNavigationState = () => {
    navigation.classList.toggle("site-nav--scrolled", window.scrollY > 0);
  };

  updateNavigationState();
  window.addEventListener("scroll", updateNavigationState, { passive: true, signal: controller.signal });
  window.addEventListener("rerender", () => controller.abort(), { once: true, signal: controller.signal });
  window.addEventListener("popstate", () => controller.abort(), { once: true, signal: controller.signal });
}
