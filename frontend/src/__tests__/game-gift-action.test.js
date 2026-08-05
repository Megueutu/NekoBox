import { afterEach, describe, expect, it, vi } from "vitest";
import GamePage from "../pages/game/GamePage";
import { GamesService } from "../services/games/games.service";
import { Store } from "../store/store";

vi.mock("../services/games/games.service", () => ({
  GamesService: {
    getBySlug: vi.fn(),
  },
}));

const initialState = Store.getState();
const game = {
  id: "8",
  title: "Celeste",
  slug: "celeste",
  price: 39.9,
  release_date: "2018-01-25",
  categories: ["Plataforma"],
  tags: [],
  media: [],
  system_requirements: [],
  languages: [],
  updates: [],
  reviews: [],
  publisher: { name: "Extremely OK Games" },
};

afterEach(() => {
  vi.restoreAllMocks();
  Store.setState(initialState);
  document.body.innerHTML = "";
});

describe("Game gift action", () => {
  it("should place the gift action immediately after the cart action", async () => {
    GamesService.getBySlug.mockResolvedValue(game);
    Store.setState({ ...initialState, cart: [], wishlist: [], library: [] });

    document.body.innerHTML = await GamePage({ slug: "celeste" });

    const actionGroup = document.querySelector(".purchase-card .space-y-2");
    expect(actionGroup.children[0].id).toBe("btn-add-cart");
    expect(actionGroup.children[1].querySelector("#btn-gift-game")?.textContent).toContain("Presentear este jogo");
  });

  it("should offer direct license acquisition and disable gifting for free games", async () => {
    GamesService.getBySlug.mockResolvedValue({ ...game, price: 0 });
    Store.setState({ ...initialState, cart: [], wishlist: [], library: [] });

    document.body.innerHTML = await GamePage({ slug: "celeste" });

    expect(document.getElementById("btn-acquire-free-license")?.textContent).toContain("Adquirir licença gratuitamente");
    expect(document.getElementById("btn-gift-game")).toBeNull();
    expect(document.querySelector(".purchase-gift-action button")?.disabled).toBe(true);
  });

  it("should reserve the two-column layout for primary content and make secondary details full width", async () => {
    GamesService.getBySlug.mockResolvedValue({
      ...game,
      system_requirements: [{ type: "minimum", os: "Windows 11" }],
      languages: [{ name: "Português", interface: true, subtitles: true, audio: false }],
      updates: [{ version: "1.0", title: "Lançamento", content: "Primeira versão", created_at: "2026-08-01" }],
      reviews: [{ username: "Neko", recommended: true, review_text: "Excelente.", created_at: "2026-08-01", votes: 3 }],
    });
    Store.setState({ ...initialState, cart: [], wishlist: [], library: [] });

    document.body.innerHTML = await GamePage({ slug: "celeste" });

    expect(document.querySelector(".game-primary .game-layout")).not.toBeNull();
    expect(document.querySelector(".game-primary .game-content .game-languages")).toBeNull();
    expect(document.querySelector(".game-details-fullwidth .game-languages")).not.toBeNull();
    expect(document.querySelector(".game-detail-rail--updates")).not.toBeNull();
    expect(document.querySelector(".game-detail-rail--reviews")).not.toBeNull();
  });

  it("should show the review form only for signed-in owners without a previous review", async () => {
    GamesService.getBySlug.mockResolvedValue(game);
    Store.setState({ ...initialState, user: { username: "neko" }, cart: [], wishlist: [], library: [game] });

    document.body.innerHTML = await GamePage({ slug: "celeste" });

    expect(document.querySelector("[data-review-form]")).not.toBeNull();
    expect(document.querySelector('[data-review-form] select[name="rating"]')).not.toBeNull();
    expect(document.querySelector('[data-review-form] input[name="recommended"]')).not.toBeNull();
  });
});
