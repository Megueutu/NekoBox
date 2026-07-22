import { routes } from "./routes";
import { matchRoute } from "./matchRoute";
import { navigate } from "./navigate";
import { setupKeyboardNavigation } from "../accessibility/keyboard";

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
        appContainer.innerHTML = `
          <div class="p-12 text-center flex flex-col items-center justify-center min-h-[65vh]">
            <h1 class="font-display text-3xl font-bold mb-2 text-red-400">Erro ao Carregar</h1>
            <p class="text-muted mb-6">Houve um problema ao carregar esta página.</p>
            <button data-link href="/hub" class="button-primary px-6 py-3 cursor-pointer">
              Retornar ao Hub
            </button>
          </div>
        `;
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
