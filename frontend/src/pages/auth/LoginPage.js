import { AuthService } from "../../services/auth/auth.service";
import { navigate } from "../../app/router/navigate";
import { FormField } from "../../components/ui/FormField";
import { Icon, icons } from "../../components/ui/Icon";

let activeTab = "login";

export default function LoginPage() {
  const loginForm = `
    <div class="flex flex-col gap-5">
      ${FormField({ id: "input-email", label: "E-mail", type: "email", placeholder: "seu@email.com" })}
      ${FormField({ id: "input-password", label: "Senha", type: "password", placeholder: "••••••••" })}
      <div class="text-right">
        <button id="btn-forgot-tab" class="text-xs text-[var(--color-muted-2)] hover:text-[var(--color-accent-400)] transition-colors">
          Esqueci minha senha
        </button>
      </div>
      <button id="btn-login-email"
              class="button-primary w-full py-2.5 text-sm">
        Entrar
      </button>
      <div class="relative flex items-center gap-3 my-1">
        <div class="flex-1 h-px bg-[var(--color-border)]"></div>
        <span class="text-xs text-[var(--color-muted-2)]">ou</span>
        <div class="flex-1 h-px bg-[var(--color-border)]"></div>
      </div>
      <button id="btn-google-login"
              class="button-secondary w-full py-2.5 text-sm gap-2">
        <svg class="w-4 h-4" viewBox="0 0 24 24">
          <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
          <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
          <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
          <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
        </svg>
        Entrar com Google
      </button>
      <p id="login-error" class="text-red-400 text-xs text-center hidden"></p>
    </div>
  `;

  const registerForm = `
    <div class="flex flex-col gap-4">
      ${FormField({ id: "input-reg-username", label: "Nome de usuário", type: "text", placeholder: "jogador123" })}
      ${FormField({ id: "input-reg-email", label: "E-mail", type: "email", placeholder: "seu@email.com" })}
      ${FormField({ id: "input-reg-password", label: "Senha", type: "password", placeholder: "Mínimo 6 caracteres" })}
      ${FormField({ id: "input-reg-confirm", label: "Confirmar Senha", type: "password", placeholder: "Repita a senha" })}
      <button id="btn-register"
              class="button-primary w-full py-2.5 text-sm">
        Criar Conta
      </button>
      <p id="register-error" class="text-red-400 text-xs text-center hidden"></p>
    </div>
  `;

  const forgotForm = `
    <div class="flex flex-col gap-4">
      <p class="text-sm text-muted">
        Digite seu e-mail e enviaremos um link para você redefinir sua senha.
      </p>
      ${FormField({ id: "input-forgot-email", label: "E-mail cadastrado", type: "email", placeholder: "seu@email.com" })}
      <button id="btn-send-reset"
              class="button-primary w-full py-2.5 text-sm">
        Enviar Link de Redefinição
      </button>
      <button id="btn-back-login" class="text-xs text-[var(--color-muted-2)] hover:text-[var(--color-accent-400)] transition-colors text-center">
        ${Icon(icons.arrowLeft, { className: "inline-block w-3.5 h-3.5 mr-1" })} Voltar para o Login
      </button>
      <p id="forgot-msg" class="text-[var(--color-accent-400)] text-xs text-center hidden"></p>
    </div>
  `;

  const tabContent = {
    login: loginForm,
    register: registerForm,
    forgot: forgotForm,
  };

  const tabLabel = {
    login: "Entrar",
    register: "Criar Conta",
    forgot: "Recuperar Senha",
  };

  return `
    <div class="auth-shell">

      <!-- Coluna Esquerda: Banner Institucional -->
      <div class="auth-promo">
        <div class="absolute top-0 left-0 h-1 w-full bg-[var(--color-brand-600)]"></div>
        <div class="relative">
          <p class="font-display font-bold text-3xl mb-2 text-gradient-brand">NEXUSPLAY</p>
          <p class="text-zinc-300 text-lg font-light leading-relaxed">
            Seu marketplace de<br>jogos digitais.
          </p>
        </div>
        <div class="relative space-y-3">
          <div class="flex items-center gap-3">
            <div class="w-8 h-8 bg-[var(--color-surface-3)] rounded-lg flex items-center justify-center">
              ${Icon(icons.check, { className: "w-4 h-4 text-[var(--color-accent-400)]" })}
            </div>
            <p class="text-zinc-300 text-sm">Acesse centenas de títulos digitais</p>
          </div>
          <div class="flex items-center gap-3">
            <div class="w-8 h-8 bg-[var(--color-surface-3)] rounded-lg flex items-center justify-center">
              ${Icon(icons.check, { className: "w-4 h-4 text-[var(--color-accent-400)]" })}
            </div>
            <p class="text-zinc-300 text-sm">Salve favoritos e gerencie sua biblioteca</p>
          </div>
          <div class="flex items-center gap-3">
            <div class="w-8 h-8 bg-[var(--color-surface-3)] rounded-lg flex items-center justify-center">
              ${Icon(icons.check, { className: "w-4 h-4 text-[var(--color-accent-400)]" })}
            </div>
            <p class="text-zinc-300 text-sm">Compras seguras com checkout simplificado</p>
          </div>
        </div>
      </div>

      <!-- Coluna Direita: Formulário -->
      <div class="auth-panel">
        <div class="auth-card">

          <!-- Título dinâmico da aba -->
          <h1 class="font-display text-2xl font-bold mb-1">${tabLabel[activeTab]}</h1>
          <p class="text-muted text-sm mb-6">
            ${activeTab === "login" ? "Bem-vindo de volta." : activeTab === "register" ? "Crie sua conta gratuitamente." : "Recupere o acesso à sua conta."}
          </p>

          <!-- Seletores de Aba (Login / Cadastro) -->
          ${
            activeTab !== "forgot"
              ? `
            <div class="flex gap-1 mb-6 bg-[var(--color-surface-2)] rounded-lg p-1" role="tablist" aria-label="Acesso à conta">
              <button id="tab-login"
                      type="button" role="tab" aria-selected="${activeTab === "login"}" aria-controls="form-content" tabindex="${activeTab === "login" ? "0" : "-1"}"
                      class="flex-1 py-2 text-sm font-semibold rounded-md transition-all
                             ${activeTab === "login" ? "bg-[var(--color-surface-3)] text-white" : "text-muted hover:text-[var(--color-ink)]"}">
                Login
              </button>
              <button id="tab-register"
                      type="button" role="tab" aria-selected="${activeTab === "register"}" aria-controls="form-content" tabindex="${activeTab === "register" ? "0" : "-1"}"
                      class="flex-1 py-2 text-sm font-semibold rounded-md transition-all
                             ${activeTab === "register" ? "bg-[var(--color-surface-3)] text-white" : "text-muted hover:text-[var(--color-ink)]"}">
                Cadastro
              </button>
            </div>
          `
              : ""
          }

          <!-- Conteúdo do Formulário Ativo -->
          <div id="form-content" role="tabpanel" ${activeTab !== "forgot" ? `aria-labelledby="tab-${activeTab}"` : ""}>
            ${tabContent[activeTab]}
          </div>

        </div>
      </div>

    </div>
  `;
}

export async function afterRender() {
  const redirecionarAposLogin = () => {
    const target = localStorage.getItem("redirect_target");
    if (target) {
      localStorage.removeItem("redirect_target");
      navigate(target);
    } else {
      navigate("/hub");
    }
  };

  document.getElementById("tab-login")?.addEventListener("click", () => {
    activeTab = "login";
    navigate("/login", { focusTarget: "#tab-login" });
  });
  document.getElementById("tab-register")?.addEventListener("click", () => {
    activeTab = "register";
    navigate("/login", { focusTarget: "#tab-register" });
  });
  document.getElementById("btn-forgot-tab")?.addEventListener("click", () => {
    activeTab = "forgot";
    navigate("/login");
  });
  document.getElementById("btn-back-login")?.addEventListener("click", () => {
    activeTab = "login";
    navigate("/login", { focusTarget: "#btn-forgot-tab" });
  });

  document.getElementById("btn-google-login")?.addEventListener("click", async () => {
    const btn = document.getElementById("btn-google-login");
    btn.textContent = "Autenticando...";
    btn.disabled = true;
    try {
      await AuthService.loginComGoogle();
      redirecionarAposLogin();
    } catch {
      const err = document.getElementById("login-error");
      if (err) {
        err.textContent = "Falha ao autenticar com Google. Tente novamente.";
        err.classList.remove("hidden");
      }
      btn.disabled = false;
      btn.textContent = "Entrar com Google";
    }
  });

  document.getElementById("btn-login-email")?.addEventListener("click", async () => {
    const email = document.getElementById("input-email")?.value;
    const password = document.getElementById("input-password")?.value;
    const errEl = document.getElementById("login-error");
    if (errEl) errEl.classList.add("hidden");
    try {
      await AuthService.loginComEmail(email, password);
      redirecionarAposLogin();
    } catch (err) {
      if (errEl) {
        errEl.textContent = err.message;
        errEl.classList.remove("hidden");
      }
    }
  });

  document.getElementById("btn-register")?.addEventListener("click", async () => {
    const username = document.getElementById("input-reg-username")?.value;
    const email = document.getElementById("input-reg-email")?.value;
    const password = document.getElementById("input-reg-password")?.value;
    const confirm = document.getElementById("input-reg-confirm")?.value;
    const errEl = document.getElementById("register-error");
    if (errEl) errEl.classList.add("hidden");

    if (password !== confirm) {
      if (errEl) {
        errEl.textContent = "As senhas não coincidem.";
        errEl.classList.remove("hidden");
      }
      return;
    }
    try {
      await AuthService.registrar(username, email, password);
      redirecionarAposLogin();
    } catch (err) {
      if (errEl) {
        errEl.textContent = err.message;
        errEl.classList.remove("hidden");
      }
    }
  });

  document.getElementById("btn-send-reset")?.addEventListener("click", async () => {
    const email = document.getElementById("input-forgot-email")?.value;
    const msgEl = document.getElementById("forgot-msg");
    if (!email) return;
    await AuthService.enviarRedefinicaoSenha(email);
    if (msgEl) {
      msgEl.textContent = `Link enviado para ${email}. Verifique sua caixa de entrada.`;
      msgEl.classList.remove("hidden");
    }
  });
}
