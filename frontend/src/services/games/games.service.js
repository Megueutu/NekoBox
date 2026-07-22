import { ApiClient } from "../api/api.client";
import { normalizeGame, normalizeGames } from "./game.normalizer";
import { auditCatalogMedia } from "./catalog-media.audit";

let catalogMediaAudit = null;

export const GamesService = {
  async getAll() {
    const response = await ApiClient.get("/api/games?size=100");
    const games = normalizeGames(response.content);
    catalogMediaAudit ||= auditCatalogMedia(games);
    return catalogMediaAudit;
  },

  async getBySlug(slug) {
    try {
      const game = normalizeGame(await ApiClient.get(`/api/games/${encodeURIComponent(slug)}`));
      return (await auditCatalogMedia([game]))[0];
    } catch (error) {
      if (error.status === 404) return null;
      throw error;
    }
  },

  async getByCategory(category) {
    const games = await this.getAll();
    return games.filter((game) => game.categories.some((item) => item.toLowerCase() === category.toLowerCase()));
  },

  async search(query) {
    const response = await ApiClient.get(`/api/games?size=100&search=${encodeURIComponent(query)}`);
    return normalizeGames(response.content);
  },
};
