import { afterEach, describe, expect, it, vi } from "vitest";
import { bindCatalogSearch, bindCategoryFilters, bindHubNavigationScroll, filterCatalogGames } from "../pages/games/HubPage";
import { GameCard } from "../components/ui/GameCard";

const games = [
  {
    id: "1",
    slug: "hades",
    title: "Hades",
    price: 59.9,
    categories: ["Roguelike"],
    tags: ["Ação"],
    media: [],
  },
  {
    id: "2",
    slug: "outer-wilds",
    title: "Outer Wilds",
    price: 79.9,
    categories: ["Aventura"],
    tags: ["Espaço"],
    media: [],
  },
];

afterEach(() => {
  document.body.innerHTML = "";
  window.history.replaceState({}, "", "/");
  Object.defineProperty(window, "scrollY", { configurable: true, value: 0, writable: true });
  vi.restoreAllMocks();
});

describe("Hub catalog search", () => {
  it("should filter by title, tag and category", () => {
    expect(filterCatalogGames(games, "hades")).toHaveLength(1);
    expect(filterCatalogGames(games, "ação")[0].title).toBe("Hades");
    expect(filterCatalogGames(games, "espaço")[0].title).toBe("Outer Wilds");
    expect(filterCatalogGames(games, "", "Aventura")[0].title).toBe("Outer Wilds");
  });

  it("should match games in any of the selected categories", () => {
    const matches = filterCatalogGames(games, "", ["Aventura", "Roguelike"]);

    expect(matches.map((game) => game.title).sort()).toEqual(["Hades", "Outer Wilds"]);
    expect(filterCatalogGames(games, "", ["Todos"])).toHaveLength(2);
  });

  it("should update only catalog results while preserving search focus", () => {
    document.body.innerHTML = `
      <input id="search-input" />
      <p id="catalog-results-count"></p>
      <h3 id="catalog-results-heading"></h3>
      <div id="catalog-grid"></div>
      <div id="catalog-no-results" hidden></div>
    `;
    const dispatchEvent = vi.spyOn(window, "dispatchEvent");
    bindCatalogSearch(games);

    const search = document.getElementById("search-input");
    search.focus();
    search.value = "h";
    search.dispatchEvent(new Event("input", { bubbles: true }));

    expect(document.activeElement).toBe(search);
    expect(document.getElementById("catalog-results-count").textContent).toBe("1 título");
    expect(document.querySelector("#catalog-grid img")?.alt).toBe("Pôster de Hades");
    expect(document.querySelectorAll("#catalog-grid img")).toHaveLength(1);
    expect(dispatchEvent).not.toHaveBeenCalled();
  });

  it("should allow selecting multiple category filters without navigating", () => {
    document.body.innerHTML = `
      <input id="search-input" />
      <div id="catalog-results-count"></div>
      <h3 id="catalog-results-heading"></h3>
      <div id="catalog-grid"></div>
      <div id="catalog-no-results" hidden></div>
      <button data-category="Todos" aria-pressed="true" data-active="true">Todos</button>
      <button data-category="Aventura" aria-pressed="false" data-active="false">Aventura</button>
      <button data-category="Roguelike" aria-pressed="false" data-active="false">Roguelike</button>
    `;
    // O estado do termo de busca é módulo-compartilhado entre testes; garante que nenhum
    // termo de uma execução anterior interfira no filtro de categorias avaliado aqui.
    bindCatalogSearch(games);
    document.getElementById("search-input").dispatchEvent(new Event("input", { bubbles: true }));

    const dispatchEvent = vi.spyOn(window, "dispatchEvent");
    bindCategoryFilters(games);

    document.querySelector('[data-category="Aventura"]').click();
    document.querySelector('[data-category="Roguelike"]').click();

    expect(document.querySelector('[data-category="Aventura"]').getAttribute("aria-pressed")).toBe("true");
    expect(document.querySelector('[data-category="Roguelike"]').getAttribute("aria-pressed")).toBe("true");
    expect(document.querySelector('[data-category="Todos"]').getAttribute("aria-pressed")).toBe("false");
    expect(document.querySelectorAll("#catalog-grid img")).toHaveLength(2);
    expect(dispatchEvent).not.toHaveBeenCalled();

    document.querySelector('[data-category="Todos"]').click();
    expect(document.querySelector('[data-category="Todos"]').getAttribute("aria-pressed")).toBe("true");
    expect(document.querySelector('[data-category="Aventura"]').getAttribute("aria-pressed")).toBe("false");
  });

  it("should make the Hub navigation opaque after scrolling", () => {
    document.body.innerHTML = '<nav class="site-nav site-nav--hub"></nav>';
    Object.defineProperty(window, "scrollY", { configurable: true, value: 0, writable: true });

    bindHubNavigationScroll();
    expect(document.querySelector(".site-nav")?.classList.contains("site-nav--scrolled")).toBe(false);

    window.scrollY = 24;
    window.dispatchEvent(new Event("scroll"));

    expect(document.querySelector(".site-nav")?.classList.contains("site-nav--scrolled")).toBe(true);
    window.dispatchEvent(new Event("rerender"));
  });

  it("should render poster cards as image-only links", () => {
    const container = document.createElement("div");

    container.innerHTML = GameCard(games[0], { variant: "poster" });

    expect(container.querySelector(".catalog-poster img")?.src)
      .toContain("nekobox-poster-hades/640/640");
    expect(container.querySelector(".catalog-poster img")?.alt).toBe("Pôster de Hades");
    expect(container.querySelector(".game-card__overlay")).toBeNull();
  });

  it("should render catalog cards with vertical covers", () => {
    const container = document.createElement("div");

    container.innerHTML = GameCard(games[0], { variant: "catalog" });

    expect(container.querySelector(".game-card__media img")?.alt).toBe("Capa de Hades");
    expect(container.querySelector(".game-card__overlay")?.textContent).toContain("Hades");
    expect(container.querySelector(".catalog-poster")).toBeNull();
  });
});
