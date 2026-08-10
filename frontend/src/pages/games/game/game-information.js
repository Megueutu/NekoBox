import { Icon, icons } from "../../../components/ui/Icon";
import { formatDate } from "../../../utils/format";

const requirementFields = [
  ["Sistema operacional", "os"],
  ["Processador", "cpu"],
  ["Memória", "ram"],
  ["Placa de vídeo", "gpu"],
  ["Armazenamento", "storage"],
];

function requirementCard(title, requirement, recommended = false) {
  if (!requirement) return "";

  return `
    <article class="game-requirement-card${recommended ? " game-requirement-card--recommended" : ""}">
      <header>
        <span class="game-info-icon-badge" aria-hidden="true">${Icon(recommended ? icons.star : icons.settings, { className: "w-4 h-4" })}</span>
        <div>
          <p>${recommended ? "Experiência ideal" : "Para executar"}</p>
          <h3>${title}</h3>
        </div>
      </header>
      <dl class="game-requirement-list">
        ${requirementFields
          .filter(([, field]) => requirement[field])
          .map(
            ([label, field]) => `
              <div>
                <dt>${label}</dt>
                <dd>${requirement[field]}</dd>
              </div>
            `
          )
          .join("")}
      </dl>
    </article>
  `;
}

export function renderSystemRequirements(minimum, recommended) {
  return `
    <div class="game-requirements">
      ${requirementCard("Requisitos mínimos", minimum)}
      ${requirementCard("Requisitos recomendados", recommended, true)}
    </div>
  `;
}

function languageSupport(label, available) {
  return `
    <li class="${available ? "is-available" : "is-unavailable"}">
      <span class="game-info-icon-badge" aria-hidden="true">
        ${Icon(available ? icons.check : icons.x, { className: "w-4 h-4", strokeWidth: 2.5 })}
      </span>
      <span class="game-language-card__support">
        <span>${label}</span>
        <strong>${available ? "Disponível" : "Indisponível"}</strong>
      </span>
    </li>
  `;
}

export function renderLanguages(languages = []) {
  return `
    <div class="game-languages">
      ${languages
        .map(
          (language) => `
            <article class="game-language-card">
              <h3>${language.name}</h3>
              <ul aria-label="Recursos disponíveis em ${language.name}">
                ${languageSupport("Interface", language.interface)}
                ${languageSupport("Legendas", language.subtitles)}
                ${languageSupport("Áudio", language.audio)}
              </ul>
            </article>
          `
        )
        .join("")}
    </div>
  `;
}

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
