import { routes } from "./routes";
import { matchRoute } from "./matchRoute";
import { navigate } from "./navigate";
import { setupKeyboardNavigation } from "../accessibility/keyboard";
import { Store } from "../../store/store";
import { Icon, icons } from "../../components/ui/Icon";

export function renderLoadError() {
  return `
    <main class="error-page" aria-labelledby="error-page-title">
      <div class="error-page__ambient" aria-hidden="true">
        <span></span>
        <span></span>
        <i></i>
      </div>
      <section class="error-page__card">
        <div class="error-page__icon" aria-hidden="true">
          ${Icon(icons.reset, { className: "w-8 h-8", strokeWidth: 1.8 })}
        </div>
        <p class="error-page__eyebrow">Falha de conexão</p>
        <h1 id="error-page-title">Não foi possível carregar esta página</h1>
        <p class="error-page__description">
          Algo interrompeu o carregamento. Verifique sua conexão e tente novamente.
        </p>
        <button id="btn-retry-page" type="button" class="button-primary error-page__retry">
          ${Icon(icons.reset, { className: "w-4 h-4", strokeWidth: 2.2 })}
          Tentar novamente
        </button>
        <p class="error-page__hint">Sua sessão e seus dados permanecem preservados.</p>
      </section>
    </main>
  `;
}

class RouterManager {
  async renderizar({ focusTarget = null } = {}) {
    const pathname = window.location.pathname;
    const appContainer = document.getElementById("app");
    if (!appContainer) return;

    for (const route of routes) {
      // Redireciona rotas que possuem alias (ex: "/" → "/hub")
      if (route.redirect && pathname === route.path) {
        navigate(route.redirect);
        return;
      }

      const params = matchRoute(pathname, route.path);
      if (params === null) continue;

      // Route Guard: rota privada sem token → salva destino e manda pro login
      const tokenAtivo = localStorage.getItem("access_token");
      if (route.private && !tokenAtivo) {
        localStorage.setItem("redirect_target", pathname);
        navigate("/login");
        return;
      }
      if (route.admin && Store.getState().user?.role !== "ADMIN") {
        navigate("/hub");
        return;
      }

      try {
        const module = await route.page();

        // Estado de carregamento: evita tela em branco enquanto a página busca seus dados (ex.: HubPage, GamePage)
        appContainer.innerHTML = `
          <div class="min-h-screen flex items-center justify-center bg-[var(--color-bg)]">
            <div class="flex flex-col items-center gap-4">
              <div class="w-10 h-10 border-4 border-[var(--color-border)] border-t-[var(--color-brand-500)] rounded-full animate-spin"></div>
              <p class="text-muted text-sm">Carregando...</p>
            </div>
          </div>
        `;

        // Renderiza o HTML bruto da página no container raiz
        const htmlGerado = await module.default(params);
        appContainer.innerHTML = htmlGerado;

        // Ativa os listeners específicos da página após inserção no DOM
        if (module.afterRender) {
          await module.afterRender(params);
        }

        if (focusTarget) {
          document.querySelector(focusTarget)?.focus();
        }
        return;
      } catch (error) {
        console.error("Erro crítico de carregamento da View SPA:", error);
        if (error.status === 401) {
          localStorage.setItem("redirect_target", pathname);
          navigate("/login");
          return;
        }
        appContainer.innerHTML = renderLoadError();
        const retryButton = document.getElementById("btn-retry-page");
        retryButton?.addEventListener("click", () => {
          retryButton.disabled = true;
          retryButton.classList.add("error-page__retry--loading");
          retryButton.innerHTML = `
            ${Icon(icons.reset, { className: "w-4 h-4", strokeWidth: 2.2 })}
            Tentando novamente...
          `;
          this.renderizar({ focusTarget: "#main-content" });
        });
        retryButton?.focus();
        return;
      }
    }

    // 404
    appContainer.innerHTML = `
      <div class="p-12 text-center flex flex-col items-center justify-center min-h-[65vh]">
        <h1 class="font-display text-7xl font-bold mb-4 text-gradient-brand">404</h1>
        <p class="text-xl font-bold mb-2 text-[var(--color-ink)]">CATALOG ERROR</p>
        <p class="text-muted mb-8 max-w-md">O título buscado não foi indexado ou foi movido do catálogo de lançamentos.</p>
        <button data-link href="/hub" class="button-primary px-6 py-3 cursor-pointer">
          Retornar ao Hub
        </button>
      </div>
    `;
  }

  inicializar() {
    window.addEventListener("popstate", () =>
      this.renderizar({ focusTarget: "#main-content" })
    );
    window.addEventListener("rerender", (event) =>
      this.renderizar({ focusTarget: event.detail?.focusTarget })
    );

    setupKeyboardNavigation();

    // Interceptador global de cliques SPA — previne recarregamentos
    document.addEventListener("click", (e) => {
      const linkElement = e.target.closest("[data-link]");
      if (!linkElement) return;

      e.preventDefault();
      const targetURL = linkElement.getAttribute("href");
      if (targetURL) {
        navigate(targetURL);
      }
    });

    this.renderizar();
  }
}

export const Router = new RouterManager();
