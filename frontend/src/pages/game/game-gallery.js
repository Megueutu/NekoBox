import { Icon, icons } from "../../components/ui/Icon";
import { getScreenshotUrl } from "../../utils/media";

const SCREENSHOT_LIMIT = 10;
const SCREENSHOT_GRID_LIMIT = 4;

function screenshotCard(gameTitle, screenshot, index, total) {
  return `
    <figure class="screenshot-card">
      <img src="${getScreenshotUrl(screenshot)}"
           alt="Captura de tela ${index + 1} de ${total} de ${gameTitle}"
           width="800" height="450" loading="lazy" />
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

  if (visibleScreenshots.length <= SCREENSHOT_GRID_LIMIT) {
    return `<div class="screenshot-grid">${cards}</div>`;
  }

  return `
    <div class="screenshot-carousel" data-screenshot-carousel>
      <div class="screenshot-carousel__controls" aria-label="Controles das capturas de tela">
        <button type="button" data-carousel-direction="-1" aria-label="Mostrar capturas anteriores">
          ${Icon(icons.arrowLeft, { className: "w-4 h-4" })}
        </button>
        <button type="button" data-carousel-direction="1" aria-label="Mostrar próximas capturas">
          ${Icon(icons.arrowLeft, { className: "w-4 h-4 rotate-180" })}
        </button>
      </div>
      <div class="screenshot-carousel__rail" tabindex="0" aria-label="Capturas de tela de ${gameTitle}">
        ${cards}
      </div>
    </div>
  `;
}
