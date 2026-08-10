import { routes } from "./routes";
import { matchRoute } from "./match-route";
import { navigate } from "./navigate";
import { setupKeyboardNavigation } from "../keyboard";
import { Store } from "../../store/store";
import { Icon, icons } from "../../components/ui/Icon";
import { renderErrorPage } from "../../pages/error/ErrorPage";

export function shouldRedirectAdmin(pathname, token, role) {
  return Boolean(token) && role === "ADMIN" && pathname !== "/admin";
}

class RouterManager {
  async atualizarPagina(callback) {
    const prefersReducedMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

    if (!document.startViewTransition || prefersReducedMotion) {
      await callback();
      return;
    }

    const transition = document.startViewTransition(callback);
    transition.ready.catch(() => {});
    transition.finished.catch(() => {});
    await transition.updateCallbackDone;
  }

  async renderizar({ focusTarget = null } = {}) {
    const pathname = window.location.pathname;
    const appContainer = document.getElementById("app");
    if (!appContainer) return;
    const tokenAtivo = localStorage.getItem("access_token");
    const userRole = Store.getState().user?.role;

    if (shouldRedirectAdmin(pathname, tokenAtivo, userRole)) {
      navigate("/admin");
      return;
    }

    for (const route of routes) {
      // Redireciona rotas que possuem alias (ex: "/" → "/hub")
      if (route.redirect && pathname === route.path) {
        navigate(route.redirect);
        return;
      }

      const params = matchRoute(pathname, route.path);
      if (params === null) continue;

      // Route Guard: rota privada sem token → salva destino e manda pro login
      if (route.private && !tokenAtivo) {
        localStorage.setItem("redirect_target", pathname);
        navigate("/login");
        return;
      }
      if (route.admin && userRole !== "ADMIN") {
        navigate("/hub");
        return;
      }

      try {
        const module = await route.page();

        await this.atualizarPagina(async () => {
          // Estado de carregamento: evita tela em branco enquanto a página busca seus dados (ex.: HubPage, GamePage)
          appContainer.innerHTML = `
            <div class="min-h-screen flex items-center justify-center bg-[var(--color-bg)]">
              <div class="flex flex-col items-center gap-4">
                <div class="w-10 h-10 border-4 border-[var(--color-border)] border-t-[var(--color-brand-500)] rounded-full animate-spin"></div>
                <p class="type-body text-muted">Carregando...</p>
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
        });

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
        appContainer.innerHTML = renderErrorPage("load-error");
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
    appContainer.innerHTML = renderErrorPage("not-found");
  }

  inicializar() {
    window.addEventListener("popstate", () =>
      this.renderizar({ focusTarget: "#main-content" })
    );
    window.addEventListener("rerender", (event) =>
      this.renderizar({ focusTarget: event.detail?.focusTarget })
    );

    setupKeyboardNavigation();
    
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
