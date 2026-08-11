import { getScreenshotUrl } from "../../../utils/media";

const SCREENSHOT_LIMIT = 10;

function screenshotCard(gameTitle, screenshot, index, total, { clone = false } = {}) {
  return `
    <figure class="screenshot-card" ${clone ? `data-clone="${clone}" aria-hidden="true"` : ""}>
      <img src="${getScreenshotUrl(screenshot)}"
           alt="${clone ? "" : `Captura de tela ${index + 1} de ${total} de ${gameTitle}`}"
           width="800" height="450" loading="lazy" draggable="false" />
    </figure>
  `;
}

export function renderScreenshotGallery(gameTitle, screenshots = []) {
  const visibleScreenshots = [...screenshots]
    .sort((first, second) => Number(first.position || 1) - Number(second.position || 1))
    .slice(0, SCREENSHOT_LIMIT);

  if (!visibleScreenshots.length) {
    return `
      <div class="screenshot-empty" role="status">
        <img src="${getScreenshotUrl(null)}" alt="" width="800" height="450" />
        <p>Sem imagens disponíveis deste jogo.</p>
      </div>
    `;
  }

  const cards = visibleScreenshots
    .map((screenshot, index) => screenshotCard(gameTitle, screenshot, index, visibleScreenshots.length))
    .join("");

  const canLoop = visibleScreenshots.length > 1;

  // Clones dos dois lados: rolar para trás no primeiro item revela a última captura
  // (e vice-versa), então o carrossel nunca mostra espaço vazio nas pontas.
  const leadingClones = canLoop
    ? visibleScreenshots
        .map((screenshot, index) => screenshotCard(gameTitle, screenshot, index, visibleScreenshots.length, { clone: "leading" }))
        .join("")
    : "";

  const trailingClones = canLoop
    ? visibleScreenshots
        .map((screenshot, index) => screenshotCard(gameTitle, screenshot, index, visibleScreenshots.length, { clone: "trailing" }))
        .join("")
    : "";

  const dots =
    visibleScreenshots.length > 1
      ? `
    <div class="screenshot-carousel__dots" role="group" aria-label="Selecionar captura de tela">
      ${visibleScreenshots
        .map(
          (_, index) => `
        <button type="button" data-carousel-dot="${index}" aria-label="Ir para captura ${index + 1}" aria-current="${index === 0}"></button>
      `
        )
        .join("")}
    </div>
  `
      : "";

  return `
    <div class="screenshot-carousel" data-screenshot-carousel>
      <div class="screenshot-carousel__rail" tabindex="0" aria-label="Capturas de tela de ${gameTitle}">
        ${leadingClones}${cards}${trailingClones}
      </div>
      ${dots}
    </div>
  `;
}
