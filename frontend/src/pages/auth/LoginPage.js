import { AuthService } from "../../services/auth/auth.service";
import { navigate } from "../../app/router/navigate";
import { FormField } from "../../components/ui/FormField";
import { Icon, icons } from "../../components/ui/Icon";

let activeTab = "login";

const viewContent = {
  login: {
    eyebrow: "Sua biblioteca espera",
    title: "Boas-vindas de volta",
    description: "Entre para continuar sua jornada no NexusPlay.",
    icon: icons.logIn,
  },
  register: {
    eyebrow: "Comece a jogar",
    title: "Crie sua conta",
    description: "Monte sua biblioteca e descubra seu próximo jogo favorito.",
    icon: icons.user,
  },
  forgot: {
    eyebrow: "Recuperação de acesso",
    title: "Esqueceu sua senha?",
    description: "Informe o e-mail cadastrado para receber as instruções de recuperação.",
    icon: icons.mail,
  },
};

export function renderAuthCard(view = activeTab, { headingTag = "h1" } = {}) {
  const resolvedView = viewContent[view] ? view : "login";
  const currentView = viewContent[resolvedView];
  const loginForm = `
    <form id="login-form" class="auth-form">
      ${FormField({ id: "input-email", label: "E-mail", type: "email", placeholder: "seu@email.com" })}
      ${FormField({ id: "input-password", label: "Senha", type: "password", placeholder: "••••••••" })}
      <div class="auth-form__assist">
        <button id="btn-forgot-tab" type="button">
          Esqueci minha senha
        </button>
      </div>
      <button id="btn-login-email" type="submit" class="button-primary auth-submit">
        Entrar
      </button>
      <div class="auth-separator" aria-hidden="true">
        <span>ou continue com</span>
      </div>
      <button id="btn-google-login" type="button" class="button-secondary auth-submit">
        ${Icon(icons.logIn, { className: "w-4 h-4" })}
        Google
      </button>
      <p id="login-error" class="auth-feedback auth-feedback--error hidden" role="alert"></p>
    </form>
  `;

  const registerForm = `
    <form id="register-form" class="auth-form">
      ${FormField({ id: "input-reg-username", label: "Nome de usuário", type: "text", placeholder: "jogador123", autocomplete: "username" })}
      <p class="auth-form__hint">Use de 3 a 50 letras, números ou _ (sem espaços).</p>
      ${FormField({ id: "input-reg-email", label: "E-mail", type: "email", placeholder: "seu@email.com" })}
      ${FormField({ id: "input-reg-password", label: "Senha", type: "password", placeholder: "Crie uma senha segura", autocomplete: "new-password" })}
      ${FormField({ id: "input-reg-confirm", label: "Confirmar Senha", type: "password", placeholder: "Repita a senha", autocomplete: "new-password" })}
      <p class="auth-form__hint">Use 8 ou mais caracteres, com maiúscula, minúscula, número e um símbolo: @ $ ! % * ? &.</p>
      <button id="btn-register" type="submit" class="button-primary auth-submit">
        Criar Conta
      </button>
      <p id="register-error" class="auth-feedback auth-feedback--error hidden" role="alert"></p>
    </form>
  `;

  const forgotForm = `
    <form id="forgot-form" class="auth-form">
      ${FormField({ id: "input-forgot-email", label: "E-mail cadastrado", type: "email", placeholder: "seu@email.com" })}
      <button id="btn-send-reset" type="submit" class="button-primary auth-submit">
        Enviar instruções
      </button>
      <button id="btn-back-login" type="button" class="auth-back">
        ${Icon(icons.arrowLeft, { className: "w-4 h-4" })} Voltar para o login
      </button>
      <p id="forgot-msg" class="auth-feedback hidden" role="status"></p>
    </form>
  `;

  const tabContent = {
    login: loginForm,
    register: registerForm,
    forgot: forgotForm,
  };

  return `
    <section class="auth-card auth-card--${resolvedView}" aria-labelledby="auth-title">
      <div class="auth-card__icon" aria-hidden="true">
        ${Icon(currentView.icon, { className: "w-5 h-5" })}
      </div>
      <header class="auth-card__header">
        <p>${currentView.eyebrow}</p>
        <${headingTag} id="auth-title">${currentView.title}</${headingTag}>
        <span>${currentView.description}</span>
      </header>

      ${
        resolvedView !== "forgot"
          ? `
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
      `
          : ""
      }
      <div id="form-content" role="tabpanel" ${resolvedView !== "forgot" ? `aria-labelledby="tab-${resolvedView}"` : ""}>
        ${tabContent[resolvedView]}
      </div>
    </section>
  `;
}

export function renderAuthPage(view = activeTab) {
  return `
    <div class="auth-shell app-shell app-shell--auth">
      <div class="app-ambient" aria-hidden="true">
        <span class="app-ambient__blob app-ambient__blob--one"></span>
        <span class="app-ambient__blob app-ambient__blob--two"></span>
        <span class="app-ambient__grid"></span>
      </div>
      <main class="auth-stage">
        <a href="/" data-link class="auth-brand" aria-label="NekoBox — Início">
          <span class="auth-brand__mark">${Icon(icons.gamepad, { className: "w-5 h-5" })}</span>
          <span>NEKO<strong>BOX</strong></span>
        </a>
        ${renderAuthCard(view)}
        <p class="auth-legal">Ao continuar, você concorda com os <a href="/termos-de-uso" data-link>Termos de Uso</a> e a <a href="/privacidade" data-link>Política de Privacidade</a>.</p>
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

  root.querySelectorAll("[data-password-toggle]").forEach((toggle) => {
    toggle.addEventListener("click", () => {
      const input = find(`#${toggle.dataset.passwordToggle}`);
      if (!input) return;

      const isVisible = input.type === "text";
      input.type = isVisible ? "password" : "text";
      toggle.setAttribute("aria-pressed", String(!isVisible));
      toggle.setAttribute("aria-label", isVisible ? "Mostrar senha" : "Ocultar senha");
      toggle.innerHTML = Icon(isVisible ? icons.eye : icons.eyeOff, { className: "w-4 h-4" });
      input.focus({ preventScroll: true });
    });
  });

  const redirecionarAposLogin = (usuario) => {
    const target = localStorage.getItem("redirect_target");
    localStorage.removeItem("redirect_target");
    navigate(resolvePostLoginTarget(usuario, target));
  };

  find("#tab-login")?.addEventListener("click", () => showView("login", "#tab-login"));
  find("#tab-register")?.addEventListener("click", () => showView("register", "#tab-register"));
  find("#btn-forgot-tab")?.addEventListener("click", () => showView("forgot", "#input-forgot-email"));
  find("#btn-back-login")?.addEventListener("click", () => showView("login", "#btn-forgot-tab"));

  find("#btn-google-login")?.addEventListener("click", async () => {
    const btn = find("#btn-google-login");
    const idleContent = btn.innerHTML;
    btn.textContent = "Autenticando...";
    btn.disabled = true;
    try {
      const usuario = await AuthService.loginComGoogle();
      redirecionarAposLogin(usuario);
    } catch {
      const err = find("#login-error");
      if (err) {
        err.textContent = "Falha ao autenticar com Google. Tente novamente.";
        err.classList.remove("hidden");
      }
      btn.disabled = false;
      btn.innerHTML = idleContent;
    }
  });

  find("#login-form")?.addEventListener("submit", async (event) => {
    event.preventDefault();
    const email = find("#input-email")?.value;
    const password = find("#input-password")?.value;
    const errEl = find("#login-error");
    if (errEl) errEl.classList.add("hidden");
    try {
      const usuario = await AuthService.loginComEmail(email, password);
      redirecionarAposLogin(usuario);
    } catch (err) {
      if (errEl) {
        errEl.textContent = err.message;
        errEl.classList.remove("hidden");
      }
    }
  });

  find("#register-form")?.addEventListener("submit", async (event) => {
    event.preventDefault();
    const username = find("#input-reg-username")?.value;
    const email = find("#input-reg-email")?.value;
    const password = find("#input-reg-password")?.value;
    const confirm = find("#input-reg-confirm")?.value;
    const errEl = find("#register-error");
    if (errEl) errEl.classList.add("hidden");

    if (password !== confirm) {
      if (errEl) {
        errEl.textContent = "As senhas não coincidem.";
        errEl.classList.remove("hidden");
      }
      return;
    }
    try {
      const usuario = await AuthService.registrar(username, email, password);
      redirecionarAposLogin(usuario);
    } catch (err) {
      if (errEl) {
        errEl.textContent = err.message;
        errEl.classList.remove("hidden");
      }
    }
  });

  find("#forgot-form")?.addEventListener("submit", async (event) => {
    event.preventDefault();
    const email = find("#input-forgot-email")?.value;
    const msgEl = find("#forgot-msg");
    if (!email) return;
    try {
      await AuthService.enviarRedefinicaoSenha(email);
    } catch (error) {
      if (msgEl) {
        msgEl.textContent = error.message;
        msgEl.classList.remove("hidden");
      }
    }
  });
}

export async function afterRender() {
  bindAuthInteractions();
}
