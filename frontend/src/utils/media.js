import { fill } from "@cloudinary/url-gen/actions/resize";
import { autoGravity } from "@cloudinary/url-gen/qualifiers/gravity";
import { format, quality } from "@cloudinary/url-gen/actions/delivery";
import { auto as autoFormat } from "@cloudinary/url-gen/qualifiers/format";
import { auto as autoQuality } from "@cloudinary/url-gen/qualifiers/quality";
import { cld } from "../core/cloudinary/cloudinary";

/**
 * Gera uma URL otimizada do Cloudinary (crop "fill" + gravidade automática +
 * formato/qualidade automáticos) a partir de um public_id.
 *
 * Retorna null quando o Cloudinary não está configurado (env ausente) ou
 * quando o item de mídia não tem public_id — nesses casos o chamador deve
 * cair de volta para a URL externa já existente (ver getCoverUrl/getBannerUrl).
 */
export function buildCloudinaryUrl(publicId, { width, height } = {}) {
  if (!cld || !publicId) return null;

  return cld
    .image(publicId)
    .resize(fill().width(width).height(height).gravity(autoGravity()))
    .delivery(format(autoFormat()))
    .delivery(quality(autoQuality()))
    .toURL();
}

/**
 * Resolve a URL final de um item de mídia: usa Cloudinary quando o item tem
 * public_id e a integração está configurada; senão usa a URL externa/mock.
 */
function resolveMediaUrl(mediaItem, { width, height, fallback }) {
  if (!mediaItem) return fallback;
  return (
    buildCloudinaryUrl(mediaItem.public_id, { width, height }) ||
    mediaItem.url ||
    fallback
  );
}

export function getCoverUrl(game) {
  const cover = game.media?.find((m) => m.type === "cover");
  return resolveMediaUrl(cover, {
    width: 400,
    height: 600,
    fallback: "https://picsum.photos/seed/default/400/600",
  });
}

export function getBannerUrl(game) {
  const banner = game.media?.find((m) => m.type === "banner");
  return resolveMediaUrl(banner, {
    width: 1920,
    height: 1080,
    fallback: "https://picsum.photos/seed/defaultbanner/1920/1080",
  });
}

export function getScreenshotUrl(mediaItem) {
  return resolveMediaUrl(mediaItem, {
    width: 800,
    height: 450,
    fallback: "https://picsum.photos/seed/defaultscreenshot/800/450",
  });
}
