import bannerGameNames from "../data/banner-games.json";
import { getBannerUrl } from "./media";

const normalizeTitle = (title = "") =>
  title.trim().toLocaleLowerCase("pt-BR");

const safeRandomValue = (random) => {
  const value = Number(random());
  return Number.isFinite(value) && value >= 0 && value < 1 ? value : 0;
};

export function getBannerCandidates(games, allowedNames = bannerGameNames) {
  if (!Array.isArray(games) || !Array.isArray(allowedNames)) return [];

  const allowedTitles = new Set(allowedNames.map(normalizeTitle));
  return games.filter(
    (game) =>
      allowedTitles.has(normalizeTitle(game?.title)) &&
      game?.media?.some(
        (media) =>
          media.type === "banner" &&
          Boolean(media.url || media.public_id)
      )
  );
}

export function getGameBannerRotation(
  games,
  { allowedNames = bannerGameNames, random = Math.random, limit = 5 } = {}
) {
  const candidates = [...getBannerCandidates(games, allowedNames)];
  const safeLimit = Math.max(0, Math.floor(Number(limit) || 0));

  for (let index = candidates.length - 1; index > 0; index -= 1) {
    const target = Math.floor(safeRandomValue(random) * (index + 1));
    [candidates[index], candidates[target]] = [candidates[target], candidates[index]];
  }

  return candidates.slice(0, safeLimit).map((game) => ({
    game,
    url: getBannerUrl(game),
  }));
}

export async function resolveRandomBannerUrls(
  loadGames,
  { fallbackUrl = "/mocks/callofduty.png", limit = 1, ...options } = {}
) {
  try {
    const urls = getGameBannerRotation(await loadGames(), { ...options, limit })
      .map(({ url }) => url);
    return urls.length ? urls : [fallbackUrl];
  } catch {
    return [fallbackUrl];
  }
}

export async function resolveRandomBannerUrl(
  loadGames,
  options = {}
) {
  return (await resolveRandomBannerUrls(loadGames, options))[0];
}
