import { formatDate } from "../../../utils/format";

export function renderAboutGame(description, tags = [], publisher, releaseDate) {
  const hasCredit = Boolean(publisher || releaseDate);

  const paragraphs = description
    .split(/\n\s*\n/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);

  return `
    <div class="game-about" data-game-description>
      ${paragraphs.map((paragraph) => `<p class="type-body text-muted">${paragraph}</p>`).join("")}
    </div>
    ${
      hasCredit
        ? `<p class="type-small text-muted mt-4">Publicado por ${publisher || "—"}${
            releaseDate ? ` em ${formatDate(releaseDate)}` : ""
          }</p>`
        : ""
    }
    ${
      tags.length
        ? `<div class="game-hashtags" aria-label="Hashtags do jogo">
            ${tags.map((tag) => `<span class="game-hashtag">#${tag.replace(/\s+/g, "")}</span>`).join("")}
          </div>`
        : ""
    }
  `;
}
