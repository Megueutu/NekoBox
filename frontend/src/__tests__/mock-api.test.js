import { afterEach, describe, expect, it } from "vitest";
import { mockApiRequest } from "../mocks/api.mock";
import { mockGames } from "../mocks/games.mock";

afterEach(() => localStorage.clear());

describe("local mock API", () => {
  it("should authenticate the seeded administrator", async () => {
    const session = await mockApiRequest("/api/auth/login", {
      method: "POST",
      body: { email: "admin@admin.com", senha: "Batata123" },
    });

    expect(session.user.role).toBe("ADMIN");
  });

  it("should serve the admin dashboard for an authenticated administrator", async () => {
    localStorage.setItem("access_token", "mock-token-1");

    const dashboard = await mockApiRequest("/api/admin/dashboard");

    expect(dashboard.usuarios).toBe(2);
    expect(dashboard.evolucao).toHaveLength(7);
    expect(dashboard.mais_vendidos[0]).toMatchObject({ titulo: "Cyberpunk 2077", vendas: 3 });
    expect(dashboard.vendas_recentes).not.toHaveLength(0);
  });

  it("should reject administrative access for the seeded user", async () => {
    localStorage.setItem("access_token", "mock-token-2");

    await expect(mockApiRequest("/api/admin/dashboard")).rejects.toMatchObject({ status: 403 });
  });

  it("should use the curated media and include the missing catalog titles", () => {
    const cyberpunk = mockGames.find((game) => game.slug === "cyberpunk-2077");

    expect(cyberpunk.media[0].url).toContain("bxSj4jO0KBqUgAbH3zuNjCje");
    expect(cyberpunk.media.find((media) => media.type === "poster")?.url)
      .toBe("https://picsum.photos/seed/nekobox-poster-cyberpunk-2077/640/640");
    expect(mockGames.some((game) => game.slug === "hollow-knight-silksong")).toBe(true);
  });

  it("should include every curated title and use one placeholder for unavailable covers", () => {
    const slugs = [
      "hollow-knight-silksong",
      "assassins-creed-black-flag-remake",
      "grand-theft-auto-vi",
      "elden-ring-nightreign",
      "eldest-souls",
      "hades-2",
      "call-of-duty-black-ops-7",
      "dragon-ball-sparking-zero",
      "halo-campaign-evolved",
    ];
    const covers = ["eldest-souls", "hades-2", "hades", "celeste", "dark-souls-saga", "stardew-valley"]
      .map((slug) => mockGames.find((game) => game.slug === slug).media.find((item) => item.type === "cover").url);

    expect(slugs.every((slug) => mockGames.some((game) => game.slug === slug))).toBe(true);
    expect(new Set(covers).size).toBe(1);
  });

  it("should migrate a persisted mock catalog to the current seed media", async () => {
    localStorage.setItem("nekobox_mock_api_state", JSON.stringify({
      users: [], carts: {}, wishlists: {}, libraries: {}, giftCards: [],
      games: [{ id: "legacy-cyberpunk", slug: "cyberpunk-2077", media: [] }],
    }));

    const catalog = await mockApiRequest("/api/games?size=100");

    expect(catalog.content.find((game) => game.slug === "cyberpunk-2077").media).toHaveLength(7);
  });

  it("should acquire a free game directly and reject it as a gift", async () => {
    localStorage.setItem("access_token", "mock-token-2");
    const freeGame = mockGames.find((game) => game.slug === "marvel-rivals");

    const license = await mockApiRequest(`/api/biblioteca/licencas-gratuitas/${freeGame.id}`, {
      method: "POST",
    });

    expect(license.id).toBe(freeGame.id);
    await expect(mockApiRequest("/api/carrinho/itens", {
      method: "POST",
      body: { produto_id: freeGame.id, para_presente: true },
    })).rejects.toMatchObject({ status: 422 });
  });

  it("should allow library owners to publish one review per game", async () => {
    localStorage.setItem("access_token", "mock-token-2");
    const game = mockGames.find((item) => item.slug === "marvel-rivals");

    await expect(mockApiRequest(`/api/produtos/${game.id}/avaliacoes`, {
      method: "POST",
      body: { nota: 5, recomenda: true, textoAvaliacao: "Muito divertido." },
    })).rejects.toMatchObject({ status: 422 });

    await mockApiRequest(`/api/biblioteca/licencas-gratuitas/${game.id}`, { method: "POST" });
    const review = await mockApiRequest(`/api/produtos/${game.id}/avaliacoes`, {
      method: "POST",
      body: { nota: 5, recomenda: true, textoAvaliacao: "Muito divertido." },
    });

    expect(review).toMatchObject({ username: "user", rating: 5, recommended: true });
    await expect(mockApiRequest(`/api/produtos/${game.id}/avaliacoes`, {
      method: "POST",
      body: { nota: 4, recomenda: true },
    })).rejects.toMatchObject({ status: 409 });
  });
});
