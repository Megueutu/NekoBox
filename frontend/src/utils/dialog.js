export function openDialog(dialog, trigger) {
  if (typeof dialog.showModal === "function") dialog.showModal();
  else dialog.setAttribute("open", "");
  dialog.addEventListener("close", () => trigger?.focus(), { once: true });
}

export function closeDialog(dialog, trigger) {
  if (typeof dialog.close === "function") {
    dialog.close();
  } else {
    dialog.removeAttribute("open");
    trigger?.focus();
  }
}
