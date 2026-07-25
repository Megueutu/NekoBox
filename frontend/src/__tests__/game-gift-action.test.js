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
});
