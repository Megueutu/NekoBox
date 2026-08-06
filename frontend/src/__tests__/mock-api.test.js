import { afterEach, describe, expect, it } from "vitest";
import { mockApiRequest } from "../mocks/api.mock";
import { mockGames } from "../mocks/games.mock";
import { seedPosterBySlug } from "../mocks/seed-catalog.mock";

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
      .toBe(seedPosterBySlug["cyberpunk-2077"]);
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
      "call-of-duty-modern-warfare-4",
      "dragon-ball-sparking-zero",
      "halo-campaign-evolved",
    ];
    const covers = ["eldest-souls", "hades-2", "hades", "celeste", "dark-souls-3", "stardew-valley"]
      .map((slug) => mockGames.find((game) => game.slug === slug).media.find((item) => item.type === "cover").url);

    expect(slugs.every((slug) => mockGames.some((game) => game.slug === slug))).toBe(true);
    expect(new Set(covers).size).toBe(1);
  });

  it("should use the supplied Cloudinary posters for every mapped game", () => {
    const posters = Object.fromEntries(
      Object.keys(seedPosterBySlug).map((slug) => [
        slug,
        mockGames.find((game) => game.slug === slug)?.media.find((media) => media.type === "poster")?.url,
      ])
    );

    expect(posters).toEqual(seedPosterBySlug);
  });

  it("should migrate a persisted mock catalog to the current seed media", async () => {
    localStorage.setItem("nekobox_mock_api_state", JSON.stringify({
      users: [], carts: {}, wishlists: {}, libraries: {},
      games: [{ id: "legacy-cyberpunk", slug: "cyberpunk-2077", media: [], reviews: [{ id: "legacy-review" }] }],
    }));

    const catalog = await mockApiRequest("/api/games?size=100");

    const cyberpunk = catalog.content.find((game) => game.slug === "cyberpunk-2077");
    expect(cyberpunk.media).toHaveLength(7);
    expect(cyberpunk).not.toHaveProperty("reviews");
  });

  it("should replace renamed seeded games in persisted catalog data", async () => {
    localStorage.setItem("nekobox_mock_api_state", JSON.stringify({
      seedVersion: 6, users: [], carts: {}, wishlists: {}, libraries: {},
      games: [
        { id: "catalog-cod-bo7", slug: "call-of-duty-black-ops-7", media: [] },
        { id: "catalog-dark-souls", slug: "dark-souls-saga", media: [] },
      ],
    }));

    const catalog = await mockApiRequest("/api/games?size=100");

    expect(catalog.content.map((game) => game.slug)).toEqual(
      expect.arrayContaining(["call-of-duty-modern-warfare-4", "dark-souls-3"])
    );
    expect(catalog.content.map((game) => game.slug)).not.toEqual(
      expect.arrayContaining(["call-of-duty-black-ops-7", "dark-souls-saga"])
    );
  });

  it("should acquire a free game directly", async () => {
    localStorage.setItem("access_token", "mock-token-2");
    const freeGame = mockGames.find((game) => game.slug === "marvel-rivals");

    const license = await mockApiRequest(`/api/biblioteca/licencas-gratuitas/${freeGame.id}`, {
      method: "POST",
    });

    expect(license.id).toBe(freeGame.id);
  });

  it("should add any positive top-up amount to the authenticated balance", async () => {
    localStorage.setItem("access_token", "mock-token-2");

    const wallet = await mockApiRequest("/api/carteira/recargas", {
      method: "POST",
      body: { valor: 37.45 },
    });

    expect(wallet).toEqual({ valor_adicionado: 37.45, saldo: 1037.45 });
  });

  it("should let an authenticated user manage their own games", async () => {
    localStorage.setItem("access_token", "mock-token-2");

    const created = await mockApiRequest("/api/produtos", {
      method: "POST",
      body: { titulo: "Meu jogo", preco: 10, status: "draft", tags: ["Indie"] },
    });
    const mine = await mockApiRequest("/api/produtos/meus");

    expect(mine).toContainEqual(expect.objectContaining({ id: created.id, titulo: "Meu jogo" }));
  });

  it("should not expose game reviews in the catalog or mock API", async () => {
    localStorage.setItem("access_token", "mock-token-1");
    const game = mockGames.find((item) => item.slug === "marvel-rivals");

    expect(mockGames.every((item) => !("reviews" in item))).toBe(true);
    await expect(mockApiRequest(`/api/produtos/${game.id}/avaliacoes`, {
      method: "POST",
      body: { nota: 5, recomenda: true, textoAvaliacao: "Muito divertido." },
    })).rejects.toMatchObject({ status: 404 });
  });
});
