import { afterEach, describe, expect, it, vi } from "vitest";
import { bindCatalogSearch, filterCatalogGames } from "../pages/hub/HubPage";
import { GameCard } from "../components/ui/GameCard";

const games = [
  {
    id: "1",
    slug: "hades",
    title: "Hades",
    short_description: "Escape do submundo",
    price: 59.9,
    categories: ["Roguelike"],
    tags: ["Ação"],
    media: [],
    reviews: [],
  },
  {
    id: "2",
    slug: "outer-wilds",
    title: "Outer Wilds",
    short_description: "Explore um sistema solar",
    price: 79.9,
    categories: ["Aventura"],
    tags: ["Espaço"],
    media: [],
    reviews: [],
  },
];

afterEach(() => {
  document.body.innerHTML = "";
  vi.restoreAllMocks();
});

describe("Hub catalog search", () => {
  it("should filter by title, description, tag and category", () => {
    expect(filterCatalogGames(games, "hades")).toHaveLength(1);
    expect(filterCatalogGames(games, "submundo")[0].title).toBe("Hades");
    expect(filterCatalogGames(games, "espaço")[0].title).toBe("Outer Wilds");
    expect(filterCatalogGames(games, "", "Aventura")[0].title).toBe("Outer Wilds");
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

  it("should render poster cards as image-only links", () => {
    const container = document.createElement("div");

    container.innerHTML = GameCard(games[0], { variant: "poster" });

    expect(container.querySelector(".catalog-poster img")?.src)
      .toContain("nekobox-poster-hades/640/640");
    expect(container.querySelector(".catalog-poster img")?.alt).toBe("Pôster de Hades");
    expect(container.querySelector(".game-card__body")).toBeNull();
  });

  it("should render catalog cards with vertical covers", () => {
    const container = document.createElement("div");

    container.innerHTML = GameCard(games[0], { variant: "catalog" });

    expect(container.querySelector(".game-card__media img")?.alt).toBe("Capa de Hades");
    expect(container.querySelector(".game-card__body")?.textContent).toContain("Hades");
    expect(container.querySelector(".catalog-poster")).toBeNull();
  });
});
