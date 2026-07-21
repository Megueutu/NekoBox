const GROUP_KEYS = {
  ArrowRight: 1,
  ArrowDown: 1,
  ArrowLeft: -1,
  ArrowUp: -1,
};

function moveWithinGroup(current, items, key) {
  if (key === "Home") return items[0];
  if (key === "End") return items.at(-1);

  const direction = GROUP_KEYS[key];
  if (!direction) return null;

  const currentIndex = items.indexOf(current);
  return items[(currentIndex + direction + items.length) % items.length];
}

export function setupKeyboardNavigation(root = document) {
  const handleClick = (event) => {
    const skipLink = event.target.closest('.skip-link[href^="#"]');
    if (!skipLink) return;

    const target = root.querySelector(skipLink.getAttribute("href"));
    if (!target) return;

    event.preventDefault();
    target.focus();
  };

  const handleKeyDown = (event) => {
    const openMenu = event.target.closest("details[open]");
    if (event.key === "Escape" && openMenu) {
      event.preventDefault();
      openMenu.removeAttribute("open");
      openMenu.querySelector("summary")?.focus();
      return;
    }

    const group = event.target.closest('[role="tablist"], [role="radiogroup"]');
    if (!group) return;

    const itemRole = group.getAttribute("role") === "tablist" ? "tab" : "radio";
    const items = [...group.querySelectorAll(`[role="${itemRole}"]:not([disabled])`)];
    const nextItem = moveWithinGroup(event.target, items, event.key);
    if (!nextItem) return;

    event.preventDefault();
    nextItem.focus();
    nextItem.click();
  };

  root.addEventListener("click", handleClick);
  root.addEventListener("keydown", handleKeyDown);
  return () => {
    root.removeEventListener("click", handleClick);
    root.removeEventListener("keydown", handleKeyDown);
  };
}
