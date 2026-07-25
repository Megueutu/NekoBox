import { describe, it, expect } from "vitest";
import { matchRoute } from "../app/router/matchRoute";
import { routes } from "../app/router/routes";
import { shouldRedirectAdmin } from "../app/router/router";

describe("Suíte de Testes de Engenharia: Roteamento SPA Vanilla", () => {
  it("Deve validar o casamento exato de caminhos estáticos sem parâmetros", () => {
    const params = matchRoute("/hub", "/hub");
    expect(params).not.toBeNull();
    expect(Object.keys(params).length).toBe(0);
  });

  it("Deve extrair com precisão parâmetros dinâmicos de slugs de jogos", () => {
    const params = matchRoute("/game/cyberpunk-2077", "/game/:slug");
    expect(params).not.toBeNull();
    expect(params.slug).toBe("cyberpunk-2077");
  });

  it("Deve rejeitar o casamento e retornar null se o comprimento dos segmentos de URL for divergente", () => {
    const params = matchRoute("/game/the-witcher-3/reviews/details", "/game/:slug");
    expect(params).toBeNull();
  });

  it("Deve extrair múltiplos parâmetros dinâmicos de uma mesma rota", () => {
    const params = matchRoute("/category/rpg/page/2", "/category/:cat/page/:num");
    expect(params).not.toBeNull();
    expect(params.cat).toBe("rpg");
    expect(params.num).toBe("2");
  });

  it("Deve retornar null para rotas completamente diferentes", () => {
    const params = matchRoute("/profile", "/game/:slug");
    expect(params).toBeNull();
  });

  it("Deve retornar objeto vazio para rota raiz correspondente", () => {
    const params = matchRoute("/", "/");
    expect(params).not.toBeNull();
    expect(Object.keys(params).length).toBe(0);
  });
});

describe("Landing page route", () => {
  it("should render the storefront at the root path instead of redirecting", () => {
    const rootRoute = routes.find((route) => route.path === "/");

    expect(rootRoute.redirect).toBeUndefined();
  });
});

describe("Accessibility page route", () => {
  it("should expose the accessibility statement as a public route", () => {
    const accessibilityRoute = routes.find((route) => route.path === "/acessibilidade");

    expect(accessibilityRoute.private).toBe(false);
  });
});

describe("Settings page route", () => {
  it("should keep visual preferences inside the authenticated account area", () => {
    const settingsRoute = routes.find((route) => route.path === "/configuracoes");

    expect(settingsRoute.private).toBe(true);
  });
});

describe("Admin route isolation", () => {
  it.each(["/", "/hub", "/profile", "/configuracoes", "/game/example", "/unknown"])(
    "should redirect an authenticated admin from %s",
    (pathname) => {
      expect(shouldRedirectAdmin(pathname, "active-token", "ADMIN")).toBe(true);
    }
  );

  it("should keep an authenticated admin inside the admin dashboard", () => {
    expect(shouldRedirectAdmin("/admin", "active-token", "ADMIN")).toBe(false);
  });

  it("should not restrict regular users or logged-out visitors", () => {
    expect(shouldRedirectAdmin("/profile", "active-token", "USER")).toBe(false);
    expect(shouldRedirectAdmin("/", null, "ADMIN")).toBe(false);
  });
});
