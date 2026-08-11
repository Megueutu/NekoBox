import { navigate } from "../../app/router/navigate";
import { FormField } from "../../components/ui/FormField";
import { Icon, icons } from "../../components/ui/Icon";
import {
  AuthService,
  PASSWORD_PATTERN,
  USERNAME_PATTERN,
} from "../../services/auth.service";

let activeTab = "login";

const viewContent = {
  login: {
    title: "Boas-vindas de volta!",
    description: "Entre para continuar sua jornada no NekoBox.",
    icon: icons.logIn,
  },
  register: {
    title: "Comece sua jornada!",
    description: "Monte sua biblioteca e descubra seu próximo jogo favorito.",
    icon: icons.user,
  },
};

export function renderAuthCard(view = activeTab, { headingTag = "h1" } = {}) {
  const resolvedView = viewContent[view] ? view : "login";
  const currentView = viewContent[resolvedView];
  const loginForm = `
    <form id="login-form" class="auth-form">
      ${FormField({ id: "input-email", label: "E-mail", type: "email", placeholder: "seu@email.com" })}
      ${FormField({ id: "input-password", label: "Senha", type: "password", placeholder: "••••••••" })}
      <button id="btn-login-email" type="submit" class="button-primary auth-submit">
        Entrar
      </button>
      <p id="login-error" class="auth-feedback auth-feedback--error hidden" role="alert"></p>
    </form>
  `;

  const registerForm = `
    <form id="register-form" class="auth-form">
      ${FormField({ id: "input-reg-username", label: "Nome de usuário", type: "text", placeholder: "jogador123", autocomplete: "username", pattern: USERNAME_PATTERN.source, minLength: 3, maxLength: 50, helpText: "De 3 a 50 letras, números ou _, sem espaços." })}
      ${FormField({ id: "input-reg-email", label: "E-mail", type: "email", placeholder: "seu@email.com" })}
      ${FormField({ id: "input-reg-password", label: "Senha", type: "password", placeholder: "Crie uma senha segura", autocomplete: "new-password", pattern: PASSWORD_PATTERN.source, minLength: 8, helpText: "Mínimo de 8 caracteres, incluindo maiúscula, minúscula, número e um símbolo: @ $ ! % * ? &." })}
      ${FormField({ id: "input-reg-confirm", label: "Confirmar Senha", type: "password", placeholder: "Repita a senha", autocomplete: "new-password" })}
      <button id="btn-register" type="submit" class="button-primary auth-submit">
        Criar Conta
      </button>
      <p id="register-error" class="auth-feedback auth-feedback--error hidden" role="alert"></p>
    </form>
  `;

  const tabContent = {
    login: loginForm,
    register: registerForm,
  };

  return `
    <section class="auth-card auth-card--${resolvedView}" aria-labelledby="auth-title">
      <img class="brand-minimalist" src="/brand-minimalist.svg">
      <header class="auth-card__header">
        <${headingTag} id="auth-title">${currentView.title}</${headingTag}>
        <span>${currentView.description}</span>
      </header>

      <div class="auth-tabs" role="tablist" aria-label="Acesso à conta">
        <button id="tab-login"
                type="button" role="tab" aria-selected="${resolvedView === "login"}" aria-controls="form-content" tabindex="${resolvedView === "login" ? "0" : "-1"}">
          Login
        </button>
        <button id="tab-register"
                type="button" role="tab" aria-selected="${resolvedView === "register"}" aria-controls="form-content" tabindex="${resolvedView === "register" ? "0" : "-1"}">
          Cadastro
        </button>
      </div>
      <div id="form-content" role="tabpanel" aria-labelledby="tab-${resolvedView}">
        ${tabContent[resolvedView]}
      </div>
    </section>
  `;
}

export function renderAuthPage(view = activeTab) {
  return `
    <div class="auth-shell app-shell app-shell--auth">
      <main class="auth-stage">
        <a href="/" data-link class="auth-brand" aria-label="NekoBox — Início">
          <img src="/cat.svg" class="auth-brand__mark" alt="" aria-hidden="true" />
          <img src="/logo.svg" class="auth-brand__logo" alt="NekoBox" />
        </a>
        ${renderAuthCard(view)}
        <p class="auth-legal">Ao continuar, você concorda com os <a style="text-decoration: none;" href="/termos-de-uso" data-link>Termos de Uso</a> e a <a style="text-decoration: none;" href="/privacidade" data-link>Política de Privacidade</a>.</p>
      </main>
    </div>
  `;
}

export default function LoginPage() {
  return renderAuthPage();
}

export function resolvePostLoginTarget(user, redirectTarget) {
  if (user?.role === "ADMIN") return "/admin";
  return redirectTarget || "/hub";
}

function showFieldMessage(el, message) {
  if (!el) return;
  el.textContent = message;
  el.classList.remove("hidden");
}

function hideFieldMessage(el) {
  el?.classList.add("hidden");
}

export function bindAuthInteractions(root = document, { dialog = false } = {}) {
  const find = (selector) => root.querySelector(selector);
  const showView = (view, focusTarget) => {
    activeTab = view;
    if (!dialog) {
      navigate("/login", { focusTarget });
      return;
    }

    const dialogElement = root.closest?.("#auth-dialog") || root;
    const body = dialogElement.querySelector(".auth-dialog__body");
    if (!body) return;
    body.innerHTML = renderAuthCard(view, { headingTag: "h2" });
    bindAuthInteractions(dialogElement, { dialog: true });
    dialogElement.querySelector(focusTarget || "input, button")?.focus();
  };

  root.querySelectorAll(".field-tooltip").forEach((tooltip) => {
    tooltip.addEventListener("click", (event) => {
      event.stopPropagation();
      const wasOpen = tooltip.classList.contains("field-tooltip--open");
      document
        .querySelectorAll(".field-tooltip--open")
        .forEach((open) => open.classList.remove("field-tooltip--open"));
      if (!wasOpen) tooltip.classList.add("field-tooltip--open");
    });
  });
  if (!document.__fieldTooltipOutsideBound) {
    document.__fieldTooltipOutsideBound = true;
    document.addEventListener("click", () => {
      document
        .querySelectorAll(".field-tooltip--open")
        .forEach((open) => open.classList.remove("field-tooltip--open"));
    });
  }

  root.querySelectorAll("[data-password-toggle]").forEach((toggle) => {
    toggle.addEventListener("click", () => {
      const input = find(`#${toggle.dataset.passwordToggle}`);
      if (!input) return;

      const isVisible = input.type === "text";
      input.type = isVisible ? "password" : "text";
      toggle.setAttribute("aria-pressed", String(!isVisible));
      toggle.setAttribute(
        "aria-label",
        isVisible ? "Mostrar senha" : "Ocultar senha",
      );
      toggle.innerHTML = Icon(isVisible ? icons.eye : icons.eyeOff, {
        className: "w-4 h-4",
      });
      input.focus({ preventScroll: true });
    });
  });

  const redirecionarAposLogin = (usuario) => {
    const target = localStorage.getItem("redirect_target");
    localStorage.removeItem("redirect_target");
    navigate(resolvePostLoginTarget(usuario, target));
  };

  find("#tab-login")?.addEventListener("click", () =>
    showView("login", "#tab-login"),
  );
  find("#tab-register")?.addEventListener("click", () =>
    showView("register", "#tab-register"),
  );

  const registerForm = find("#register-form");
  const validatePasswordConfirmation = () => {
    const password = find("#input-reg-password");
    const confirmation = find("#input-reg-confirm");
    if (!password || !confirmation) return;
    confirmation.setCustomValidity(
      confirmation.value && password.value !== confirmation.value
        ? "As senhas não coincidem."
        : "",
    );
  };
  registerForm
    ?.querySelectorAll("#input-reg-password, #input-reg-confirm")
    .forEach((input) => {
      input.addEventListener("input", validatePasswordConfirmation);
    });

  find("#login-form")?.addEventListener("submit", async (event) => {
    event.preventDefault();
    const email = find("#input-email")?.value;
    const password = find("#input-password")?.value;
    const errEl = find("#login-error");
    hideFieldMessage(errEl);
    try {
      const usuario = await AuthService.loginComEmail(email, password);
      redirecionarAposLogin(usuario);
    } catch (err) {
      showFieldMessage(errEl, err.message);
    }
  });

  find("#register-form")?.addEventListener("submit", async (event) => {
    event.preventDefault();
    validatePasswordConfirmation();
    const username = find("#input-reg-username")?.value;
    const email = find("#input-reg-email")?.value;
    const password = find("#input-reg-password")?.value;
    const confirm = find("#input-reg-confirm")?.value;
    const errEl = find("#register-error");
    hideFieldMessage(errEl);

    if (password !== confirm) {
      showFieldMessage(errEl, "As senhas não coincidem.");
      return;
    }
    try {
      const usuario = await AuthService.registrar(username, email, password);
      redirecionarAposLogin(usuario);
    } catch (err) {
      showFieldMessage(errEl, err.message);
    }
  });
}

export async function afterRender() {
  bindAuthInteractions();
}
