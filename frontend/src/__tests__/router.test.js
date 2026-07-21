import { describe, it, expect } from "vitest";
import { matchRoute } from "../app/router/matchRoute";
import { routes } from "../app/router/routes";

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
  it("should expose visual preferences without requiring authentication", () => {
    const settingsRoute = routes.find((route) => route.path === "/configuracoes");

    expect(settingsRoute.private).toBe(false);
  });
});
