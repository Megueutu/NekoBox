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

  it("should preserve library ownership metadata", () => {
    const game = normalizeGame({
      id: 7,
      title: "Quest",
      playtime_minutes: 135,
      acquired_at: "2026-07-20T17:17:49",
    });

    expect(game.playtime_minutes).toBe(135);
    expect(game.acquired_at).toBe("2026-07-20T17:17:49");
  });
});
