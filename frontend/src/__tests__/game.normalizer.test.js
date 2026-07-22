import { describe, expect, it } from "vitest";
import { normalizeGame } from "../services/games/game.normalizer";

describe("Game API normalization", () => {
  it("should normalize identifiers, numeric prices and optional collections", () => {
    const game = normalizeGame({ id: 7, owner_id: 2, title: "Quest", price: "49.90" });

    expect(game).toMatchObject({
      id: "7",
      owner_id: "2",
      title: "Quest",
      price: 49.9,
      categories: [],
      media: [],
      reviews: [],
    });
  });

  it("should escape API text before interpolating it into HTML views", () => {
    const game = normalizeGame({
      id: 1,
      title: '<img src=x onerror="alert(1)">',
      reviews: [{ username: "attacker", review_text: "<script>steal()</script>" }],
    });

    expect(game.title).toBe("&lt;img src=x onerror=&quot;alert(1)&quot;&gt;");
    expect(game.reviews[0].review_text).toBe("&lt;script&gt;steal()&lt;/script&gt;");
  });
});
