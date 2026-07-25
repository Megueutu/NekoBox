import { describe, expect, it, vi } from "vitest";
import bannerGameNames from "../data/banner-games.json";
import {
  getBannerCandidates,
  getGameBannerRotation,
  getRandomBannerUrl,
  getRandomGameBanner,
} from "../utils/random-banner";

const game = (title, url, type = "banner") => ({
  title,
  media: url ? [{ type, url }] : [],
});

describe("Random game banner", () => {
  it("should keep only configured games with an available banner", () => {
    const games = [
      game("Cyberpunk 2077", "https://example.com/cyberpunk.jpg"),
      game("Unlisted game", "https://example.com/unlisted.jpg"),
      game("Hades", "https://example.com/hades-cover.jpg", "cover"),
    ];

    const candidates = getBannerCandidates(games);

    expect(candidates).toEqual([games[0]]);
  });

  it("should select a banner using the injected random source", () => {
    const games = [
      game("Cyberpunk 2077", "https://example.com/cyberpunk.jpg"),
      game("Hades", "https://example.com/hades.jpg"),
    ];

    const result = getRandomGameBanner(games, {
      random: vi.fn(() => 0.75),
    });

    expect(result).toEqual({
      game: games[1],
      url: "https://example.com/hades.jpg",
    });
  });

  it("should return null when no configured banner is available", () => {
    const result = getRandomGameBanner([
      game("Unlisted game", "https://example.com/unlisted.jpg"),
    ]);

    expect(result).toBeNull();
  });

  it("should return the selected banner URL directly", () => {
    const result = getRandomBannerUrl(
      [game("Hades", "https://example.com/hades.jpg")],
      { random: () => 0 }
    );

    expect(result).toBe("https://example.com/hades.jpg");
  });

  it("should create a unique rotation limited to five games", () => {
    const games = bannerGameNames.map((title, index) =>
      game(title, `https://example.com/banner-${index}.jpg`)
    );

    const result = getGameBannerRotation(games, {
      random: () => 0,
      limit: 5,
    });

    expect(result).toHaveLength(5);
    expect(new Set(result.map(({ game: item }) => item.title)).size).toBe(5);
  });

  it("should expose a non-empty list of configured game names", () => {
    expect(bannerGameNames.length).toBeGreaterThan(0);
  });
});
