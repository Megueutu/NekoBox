import { PublicLayout } from "../../app/layouts/PublicLayout";
import { GamesService } from "../../services/games/games.service";
import { resolveRandomBannerUrl } from "../../utils/random-banner";

export async function LegalDocument({ eyebrow, title, introduction, updatedAt, sections }) {
  const heroBannerUrl = await resolveRandomBannerUrl(() => GamesService.getAll());
  const shortcuts = sections
    .map(({ id, title: sectionTitle }) => `<a href="#${id}">${sectionTitle}</a>`)
    .join("");

  const content = `
    <div class="legal-page">
      <header class="site-container legal-hero" aria-labelledby="legal-title">
        <img src="${heroBannerUrl}" alt="" class="legal-hero__image" fetchpriority="high" />
        <div class="legal-hero__backdrop" aria-hidden="true"></div>
        <div class="legal-hero__content">
          <p class="section-heading__eyebrow">${eyebrow}</p>
          <h1 id="legal-title">${title}</h1>
          <p>${introduction}</p>
          <p class="legal-updated">Última atualização: <time datetime="2026-07-22">${updatedAt}</time></p>
        </div>
      </header>

      <div class="site-container legal-layout">
        <nav class="legal-index" aria-label="Nesta página">
          <p>Nesta página</p>
          ${shortcuts}
        </nav>

        <article class="legal-content">
          ${sections
            .map(
              ({ id, title: sectionTitle, content: sectionContent }) => `
                <section id="${id}" aria-labelledby="${id}-title">
                  <h2 id="${id}-title">${sectionTitle}</h2>
                  ${sectionContent}
                </section>
              `
            )
            .join("")}
        </article>
      </div>
    </div>
  `;

  return PublicLayout(content);
}
