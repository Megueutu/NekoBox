import { afterEach, describe, expect, it, vi } from "vitest";
import { auditCatalogMedia } from "../services/games/catalog-media.audit";

const game = { id: "1", title: "Hades", slug: "hades", media: [] };

afterEach(() => vi.restoreAllMocks());

describe("Catalog Cloudinary media audit", () => {
  it("should hydrate media found through the naming convention", async () => {
    const games = await auditCatalogMedia([game], {
      enabled: true,
      loadReport: async () => ({
        disponiveis: [
          { slug: "hades", tipo: "cover", posicao: 1, public_id: "nekobox/games/hades/cover" },
        ],
        ausentes: [],
        nomes_divergentes: [],
      }),
    });

    expect(games[0].media[0]).toMatchObject({
      type: "cover",
      position: 1,
      public_id: "nekobox/games/hades/cover",
    });
  });

  it("should keep only media confirmed by the Cloudinary audit", async () => {
    vi.spyOn(console, "warn").mockImplementation(() => {});
    const gameWithFallbacks = {
      ...game,
      media: [
        { type: "cover", url: "https://example.com/old-cover.jpg", position: 1 },
        { type: "screenshot", url: "https://example.com/old-screenshot.jpg", position: 1 },
      ],
    };

    const games = await auditCatalogMedia([gameWithFallbacks], {
      enabled: true,
      loadReport: async () => ({
        disponiveis: [
          { slug: "hades", tipo: "cover", posicao: 1, public_id: "nekobox/games/hades/cover" },
        ],
        ausentes: [],
        nomes_divergentes: [],
        jogos_sem_screenshots: [{ jogo: "Hades", slug: "hades" }],
      }),
    });

    expect(games[0].media).toHaveLength(1);
  });

  it("should warn with every missing expected public id", async () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const ausentes = ["cover", "banner", "screenshot-3"].map((name) => ({
      slug: "hades",
      tipo: name.startsWith("screenshot") ? "screenshot" : name,
      posicao: name.startsWith("screenshot") ? 3 : 1,
      public_id: `nekobox/games/hades/${name}`,
    }));

    await auditCatalogMedia([game], {
      enabled: true,
      loadReport: async () => ({ disponiveis: [], ausentes, nomes_divergentes: [] }),
    });

    expect(warn.mock.calls[0][1].ausentes).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ public_id_esperado: "nekobox/games/hades/cover" }),
        expect.objectContaining({ public_id_esperado: "nekobox/games/hades/banner" }),
        expect.objectContaining({ public_id_esperado: "nekobox/games/hades/screenshot-3" }),
      ])
    );
  });

  it("should report a declared public id that diverges from the convention", async () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const divergence = {
      jogo: "Hades",
      slug: "hades",
      tipo: "cover",
      posicao: 1,
      public_id_atual: "other/hades-cover",
      public_id_esperado: "nekobox/games/hades/cover",
    };

    await auditCatalogMedia([game], {
      enabled: true,
      loadReport: async () => ({ disponiveis: [], ausentes: [], nomes_divergentes: [divergence] }),
    });

    expect(warn.mock.calls[0][1].nomes_divergentes).toContainEqual(divergence);
  });

  it("should warn when a game has no screenshots", async () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const withoutScreenshots = { jogo: "Hades", slug: "hades" };

    await auditCatalogMedia([game], {
      enabled: true,
      loadReport: async () => ({
        disponiveis: [],
        ausentes: [],
        nomes_divergentes: [],
        jogos_sem_screenshots: [withoutScreenshots],
      }),
    });

    expect(warn.mock.calls[0][1].sem_screenshots).toContainEqual(withoutScreenshots);
  });

  it("should warn only once when the same audit report is reused", async () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const report = {
      disponiveis: [],
      ausentes: [],
      nomes_divergentes: [],
      jogos_sem_screenshots: [{ jogo: "Hades", slug: "hades" }],
    };
    const options = { enabled: true, loadReport: async () => report };

    await auditCatalogMedia([game], options);
    await auditCatalogMedia([game], options);

    expect(warn).toHaveBeenCalledTimes(1);
  });
});
