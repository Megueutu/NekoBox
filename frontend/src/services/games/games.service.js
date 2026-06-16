import { mockGames } from "../../mocks/games.mock";

export const GamesService = {
  async getAll() {
    return new Promise((resolve) =>
      setTimeout(() => resolve([...mockGames]), 100)
    );
  },

  async getBySlug(slug) {
    return new Promise((resolve) => {
      const game = mockGames.find((g) => g.slug === slug);
      setTimeout(() => resolve(game ? { ...game } : null), 80);
    });
  },

  async getByCategory(category) {
    return new Promise((resolve) => {
      const games = mockGames.filter((g) =>
        g.categories.some(
          (c) => c.toLowerCase() === category.toLowerCase()
        )
      );
      setTimeout(() => resolve([...games]), 100);
    });
  },

  async search(query) {
    return new Promise((resolve) => {
      const q = query.toLowerCase();
      const games = mockGames.filter(
        (g) =>
          g.title.toLowerCase().includes(q) ||
          g.short_description.toLowerCase().includes(q) ||
          g.categories.some((c) => c.toLowerCase().includes(q)) ||
          g.tags.some((t) => t.toLowerCase().includes(q))
      );
      setTimeout(() => resolve([...games]), 80);
    });
  },
};
