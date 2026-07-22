import { escapeHtml } from "../../utils/escape";

const text = (value = "") => escapeHtml(value);
const safeFields = (item, fields) => Object.fromEntries(fields.map((field) => [field, text(item?.[field])]));

export function normalizeGame(game) {
  return {
    ...game,
    id: text(game.id),
    owner_id: text(game.owner_id),
    title: text(game.title),
    slug: text(game.slug),
    short_description: text(game.short_description),
    long_description: text(game.long_description),
    price: Number(game.price || 0),
    playtime_minutes: Math.max(0, Number(game.playtime_minutes || 0)),
    acquired_at: text(game.acquired_at),
    categories: Array.isArray(game.categories) ? game.categories.map(text) : [],
    tags: Array.isArray(game.tags) ? game.tags.map(text) : [],
    media: Array.isArray(game.media)
      ? game.media.map((item) => ({
          ...item,
          id: text(item.id),
          type: text(item.type),
          url: text(item.url),
          public_id: text(item.public_id),
          position: Number(item.position || 1),
        }))
      : [],
    publisher: game.publisher
      ? { ...game.publisher, id: text(game.publisher.id), name: text(game.publisher.name) }
      : null,
    system_requirements: Array.isArray(game.system_requirements)
      ? game.system_requirements.map((item) => ({ ...item, ...safeFields(item, ["type", "os", "cpu", "ram", "gpu", "storage"]) }))
      : [],
    languages: Array.isArray(game.languages)
      ? game.languages.map((item) => ({ ...item, name: text(item.name) }))
      : [],
    updates: Array.isArray(game.updates)
      ? game.updates.map((item) => ({ ...item, ...safeFields(item, ["version", "title", "content"]) }))
      : [],
    reviews: Array.isArray(game.reviews)
      ? game.reviews.map((item) => ({ ...item, ...safeFields(item, ["username", "review_text"]) }))
      : [],
  };
}

export const normalizeGames = (games) => (Array.isArray(games) ? games.map(normalizeGame) : []);
