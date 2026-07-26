import { ApiClient } from "../api/api.client";
import { buildCloudinaryUrl } from "../../utils/media";

const AUDIT_ENABLED = import.meta.env.DEV && import.meta.env.VITE_CLOUDINARY_MEDIA_AUDIT === "true";

function applyAvailableMedia(game, media) {
  const items = [...(game.media || [])];
  const index = items.findIndex(
    (item) => item.type === media.tipo && Number(item.position || 1) === media.posicao
  );
  const item = {
    ...(index >= 0 ? items[index] : {}),
    type: media.tipo,
    position: media.posicao,
    public_id: media.public_id,
    url: buildCloudinaryUrl(media.public_id),
  };

  if (index >= 0) items[index] = item;
  else items.push(item);

  return { ...game, media: items };
}

let auditReportPromise = null;
const reportedAuditResults = new WeakSet();

const loadAuditReport = () => {
  auditReportPromise ||= ApiClient.get("/api/games/media-audit");
  return auditReportPromise;
};

function hydrateAvailableMedia(game, availableMedia) {
  const managedTypes = new Set(["cover", "banner", "screenshot"]);
  const cleanGame = {
    ...game,
    media: (game.media || []).filter((item) => !managedTypes.has(item.type)),
  };

  return availableMedia
    .filter((media) => media.slug === game.slug)
    .reduce(applyAvailableMedia, cleanGame);
}

export async function auditCatalogMedia(
  games,
  { enabled = AUDIT_ENABLED, loadReport = loadAuditReport } = {}
) {
  if (!enabled || !Array.isArray(games) || games.length === 0) return games;

  try {
    const report = await loadReport();
    const missing = (report.ausentes || []).map((media) => ({
      jogo: games.find((game) => game.slug === media.slug)?.title || media.slug,
      slug: media.slug,
      tipo: media.tipo,
      posicao: media.posicao,
      public_id_esperado: media.public_id,
    }));
    const divergent = report.nomes_divergentes || [];
    const withoutScreenshots = report.jogos_sem_screenshots || [];

    const shouldWarn = missing.length || divergent.length || withoutScreenshots.length;
    if (shouldWarn && !reportedAuditResults.has(report)) {
      console.warn("[NekoBox][Cloudinary] Auditoria de mídia do catálogo", {
        ausentes: missing,
        nomes_divergentes: divergent,
        sem_screenshots: withoutScreenshots,
      });
      reportedAuditResults.add(report);
    }

    return games.map((game) => hydrateAvailableMedia(game, report.disponiveis || []));
  } catch (error) {
    console.warn("[NekoBox][Cloudinary] Não foi possível auditar a mídia do catálogo", error);
    return games;
  }
}
