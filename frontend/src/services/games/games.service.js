import { ApiClient } from "../api.client";
import { normalizeGame, normalizeGames } from "./game.normalizer";

export const GamesService = {
  async getAll() {
    const response = await ApiClient.get("/api/games?size=100");
    return normalizeGames(response.content);
  },

  async getBySlug(slug) {
    try {
      return normalizeGame(await ApiClient.get(`/api/games/${encodeURIComponent(slug)}`));
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
