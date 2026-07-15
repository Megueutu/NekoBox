import { routes } from "./routes";
import { matchRoute } from "./matchRoute";
import { navigate } from "./navigate";

class RouterManager {
  async renderizar() {
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

        // Renderiza o HTML bruto da página no container raiz
        const htmlGerado = await module.default(params);
        appContainer.innerHTML = htmlGerado;

        // Ativa os listeners específicos da página após inserção no DOM
        if (module.afterRender) {
          await module.afterRender(params);
        }
        return;
      } catch (error) {
        console.error("Erro crítico de carregamento da View SPA:", error);
        appContainer.innerHTML = `
          <div class="p-12 text-center flex flex-col items-center justify-center min-h-[65vh]">
            <h1 class="font-display text-3xl font-bold mb-2 text-red-400">Erro ao Carregar</h1>
            <p class="text-[var(--color-muted)] mb-6">Houve um problema ao carregar esta página.</p>
            <button data-link href="/hub" class="px-6 py-3 bg-gradient-to-r from-[var(--color-brand-500)] to-[var(--color-brand-700)] text-white font-bold rounded-lg cursor-pointer hover:brightness-110 transition-all glow-brand">
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
        <p class="text-[var(--color-muted)] mb-8 max-w-md">O título buscado não foi indexado ou foi movido do catálogo de lançamentos.</p>
        <button data-link href="/hub" class="px-6 py-3 bg-gradient-to-r from-[var(--color-brand-500)] to-[var(--color-brand-700)] text-white font-bold rounded-lg cursor-pointer hover:brightness-110 transition-all glow-brand">
          Retornar ao Hub
        </button>
      </div>
    `;
  }

  inicializar() {
    window.addEventListener("popstate", () => this.renderizar());
    window.addEventListener("rerender", () => this.renderizar());

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
