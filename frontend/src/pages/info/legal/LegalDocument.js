import { PublicLayout } from "../../../app/layouts/PublicLayout";
import { ContentHero } from "../../../components/ui/ContentHero";
import { GamesService } from "../../../services/games/games.service";
import { resolveRandomBannerUrl } from "../../../utils/random-banner";

export async function LegalDocument({ title, introduction, sections }) {
  const heroBannerUrl = await resolveRandomBannerUrl(() => GamesService.getAll());
  const shortcuts = sections
    .map(({ id, title: sectionTitle }) => `<a href="#${id}">${sectionTitle}</a>`)
    .join("");

  const content = `
    <div class="legal-page">
      ${ContentHero({
        titleId: "legal-title",
        title,
        description: introduction,
        bannerUrl: heroBannerUrl,
      })}

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
