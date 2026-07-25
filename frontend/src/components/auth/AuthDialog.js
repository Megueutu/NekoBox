import { Icon, icons } from "../ui/Icon";

export function renderAuthDialog() {
  return `
    <dialog id="auth-dialog" class="auth-dialog" aria-labelledby="auth-title">
      <button type="button" class="auth-dialog__close" data-auth-close aria-label="Fechar acesso à conta">
        ${Icon(icons.x, { className: "w-5 h-5" })}
      </button>
      <div class="auth-dialog__body"></div>
      <p class="auth-legal">Ao continuar, você concorda com os <a href="/termos-de-uso" data-link>Termos de Uso</a> e a <a href="/privacidade" data-link>Política de Privacidade</a>.</p>
    </dialog>
  `;
}

export function setupAuthDialog(root = document) {
  let activeTrigger = null;

  const closeDialog = (dialog) => {
    if (typeof dialog.close === "function") {
      dialog.close();
    } else {
      dialog.removeAttribute("open");
      activeTrigger?.focus();
    }
  };

  const handleClick = async (event) => {
    const trigger = event.target.closest("[data-login-trigger]");
    if (trigger) {
      const dialog = root.querySelector("#auth-dialog");
      if (!dialog) return;
      event.preventDefault();
      activeTrigger = trigger;

      const { bindAuthInteractions, renderAuthCard } = await import("../../pages/auth/LoginPage");
      dialog.querySelector(".auth-dialog__body").innerHTML = renderAuthCard("login", { headingTag: "h2" });
      bindAuthInteractions(dialog, { dialog: true });
      dialog.addEventListener("close", () => activeTrigger?.focus(), { once: true });
      if (typeof dialog.showModal === "function") {
        dialog.showModal();
      } else {
        dialog.setAttribute("open", "");
      }
      dialog.querySelector("#input-email")?.focus();
      return;
    }

    const closeButton = event.target.closest("[data-auth-close]");
    if (closeButton) {
      closeDialog(closeButton.closest("#auth-dialog"));
      return;
    }

    if (event.target.matches?.("#auth-dialog")) {
      closeDialog(event.target);
    }
  };

  root.addEventListener("click", handleClick);
  return () => root.removeEventListener("click", handleClick);
}
