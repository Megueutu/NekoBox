import { PublicLayout } from "../../app/layouts/PublicLayout";

export function LegalDocument({ eyebrow, title, introduction, updatedAt, sections }) {
  const shortcuts = sections
    .map(({ id, title: sectionTitle }) => `<a href="#${id}">${sectionTitle}</a>`)
    .join("");

  const content = `
    <div class="legal-page">
      <header class="legal-hero" aria-labelledby="legal-title">
        <div class="site-container legal-hero__content">
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
