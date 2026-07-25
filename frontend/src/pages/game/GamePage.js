import { PublicLayout } from "../../app/layouts/PublicLayout";
import { GamesService } from "../../services/games/games.service";
import { Store } from "../../store/store";
import { Actions } from "../../store/actions";
import { navigate } from "../../app/router/navigate";
import { formatPrice, formatDate } from "../../utils/format";
import { getCoverUrl, getBannerUrl, getScreenshotUrl } from "../../utils/media";
import { Section } from "../../components/ui/Section";
import { Icon, icons } from "../../components/ui/Icon";

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
        <span aria-hidden="true">${Icon(recommended ? icons.star : icons.settings, { className: "w-4 h-4" })}</span>
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
      <span aria-hidden="true">
        ${Icon(available ? icons.check : icons.x, { className: "w-4 h-4", strokeWidth: 2.5 })}
      </span>
      <span>${label}</span>
      <strong>${available ? "Disponível" : "Indisponível"}</strong>
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

export function renderAboutGame(description, tags = []) {
  return `
    <p class="text-muted text-sm leading-relaxed">${description}</p>
    ${
      tags.length
        ? `<div class="flex flex-wrap gap-2 mt-5" aria-label="Tags do jogo">
            ${tags.map((tag) => `<span class="surface-chip px-2.5 py-1 text-xs rounded-md">${tag}</span>`).join("")}
          </div>`
        : ""
    }
  `;
}

export default async function GamePage({ slug }) {
  const game = await GamesService.getBySlug(slug);

  if (!game) {
    return PublicLayout(`
      <div class="max-w-7xl mx-auto px-4 py-24 text-center">
        <h1 class="font-display text-4xl font-bold mb-4">Jogo não encontrado</h1>
        <p class="text-muted mb-6">Este título não existe ou foi removido do catálogo.</p>
        <a href="/hub" data-link class="button-primary px-6 py-3">
          Voltar ao Catálogo
        </a>
      </div>
    `);
  }

  const banner = game.media?.find((m) => m.type === "banner");
  const screenshots = game.media?.filter((m) => m.type === "screenshot") || [];
  const minReq = game.system_requirements?.find((r) => r.type === "minimum");
  const recReq = game.system_requirements?.find((r) => r.type === "recommended");

  const { cart, wishlist, library } = Store.getState();
  const inLibrary = library.some((g) => g.id === game.id);
  const inCart = cart.some((g) => g.id === game.id);
  const inWishlist = wishlist.some((g) => g.id === game.id);

  const buyButton = inLibrary
    ? `<button disabled class="w-full py-3 bg-[var(--color-surface-2)] text-[var(--color-muted-2)] font-bold rounded-lg cursor-not-allowed text-sm">
         Disponível na sua Biblioteca
       </button>`
    : inCart
    ? `<a href="/cart" data-link class="block w-full py-3 bg-[var(--color-surface-3)] text-white font-bold rounded-lg text-center text-sm hover:bg-[var(--color-brand-700)]/50 transition-colors">
         Item no Carrinho — Ver Sacola
       </a>`
    : `<button id="btn-add-cart" class="button-primary w-full py-3 text-sm">
         Adicionar ao Carrinho
       </button>`;

  const wishlistButton = inWishlist
    ? `<button id="btn-wishlist" class="w-full py-2.5 border-2 border-red-400/70 text-red-400 font-semibold rounded-lg hover:bg-red-500/10 transition-colors text-sm inline-flex items-center justify-center gap-2">
         ${Icon(icons.heart, { className: "w-4 h-4", fill: "currentColor" })} Na Lista de Desejos
       </button>`
    : `<button id="btn-wishlist" class="button-secondary w-full py-2.5 text-muted text-sm gap-2 hover:text-[var(--color-accent-400)]">
         ${Icon(icons.heart, { className: "w-4 h-4" })} Adicionar à Lista de Desejos
       </button>`;

  const content = `
    <div class="site-container page-stack">
    <!-- Banner Hero -->
    <section class="hero-panel game-detail-hero"
         style="background-image: url('${banner ? getBannerUrl(game) : getCoverUrl(game)}')">
      <div class="absolute inset-0 bg-gradient-to-t from-black via-black/45 to-black/5"></div>
      <div class="hero-panel__content">
        <div class="relative z-10 max-w-3xl">
          <p class="section-heading__eyebrow mb-2">${game.publisher?.name || ""}</p>
          <h1 class="font-display text-white text-4xl sm:text-6xl lg:text-7xl font-bold leading-[0.95] mb-4 tracking-tight">${game.title}</h1>
          <div class="flex flex-wrap gap-2 items-center">
            ${game.categories.map((c) => `<span class="surface-chip px-2.5 py-1 text-white text-xs rounded-md">${c}</span>`).join("")}
            <span class="text-zinc-400 text-xs ml-1">${formatDate(game.release_date)}</span>
          </div>
        </div>
      </div>
    </section>

    <!-- Corpo Principal -->
    <div class="game-layout">

      <!-- Coluna Principal (Detalhes + Mídias) -->
      <div class="game-content">

        <!-- Descrição -->
        ${Section({
          title: "Sobre o Jogo",
          body: renderAboutGame(game.long_description, game.tags),
        })}

        <!-- Screenshots -->
        ${Section({
          title: "Capturas de Tela",
          body: renderScreenshotGallery(game.title, screenshots),
        })}

        <!-- Requisitos de Sistema -->
        ${
          (minReq || recReq)
            ? Section({
                title: "Requisitos de Sistema",
                body: renderSystemRequirements(minReq, recReq),
              })
            : ""
        }

        <!-- Idiomas -->
        ${
          game.languages?.length
            ? Section({
                title: "Idiomas Suportados",
                body: renderLanguages(game.languages),
              })
            : ""
        }

        <!-- Atualizações -->
        ${
          game.updates?.length
            ? Section({
                title: "Histórico de Atualizações",
                body: `
                  <div class="space-y-3">
                    ${game.updates
                      .map(
                        (u) => `
                      <div class="bg-surface rounded-lg p-4">
                        <div class="flex items-center gap-2 mb-1">
                          <span class="text-xs font-bold bg-[var(--color-brand-500)]/25 text-[var(--color-brand-100)] px-2 py-0.5 rounded-full">${u.version}</span>
                          <span class="font-semibold text-sm">${u.title}</span>
                          <span class="text-[var(--color-muted-2)] text-xs ml-auto">${formatDate(u.created_at)}</span>
                        </div>
                        <p class="text-muted text-xs leading-relaxed">${u.content}</p>
                      </div>
                    `
                      )
                      .join("")}
                  </div>
                `,
              })
            : ""
        }

        <!-- Reviews -->
        ${
          game.reviews?.length
            ? Section({
                title: "Avaliações",
                heading: `<span class="text-sm font-normal text-[var(--color-muted-2)] ml-2">(${game.reviews.length})</span>`,
                body: `
                  <div class="space-y-4">
                    ${game.reviews
                      .map(
                        (r) => `
                      <div class="bg-surface rounded-lg p-4">
                        <div class="flex items-center gap-2 mb-2">
                          <span class="inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full ${r.recommended ? "bg-[var(--color-accent-500)]/20 text-[var(--color-accent-400)]" : "bg-red-500/15 text-red-400"}">
                            ${Icon(r.recommended ? icons.check : icons.x, { className: "w-3 h-3" })} ${r.recommended ? "Recomenda" : "Não Recomenda"}
                          </span>
                          <span class="font-semibold text-sm">${r.username}</span>
                          <span class="text-[var(--color-muted-2)] text-xs ml-auto">${formatDate(r.created_at)}</span>
                        </div>
                        <p class="text-muted text-sm leading-relaxed">${r.review_text}</p>
                        <p class="text-[var(--color-muted-2)] text-xs mt-2">${r.votes} pessoas acharam útil</p>
                      </div>
                    `
                      )
                      .join("")}
                  </div>
                `,
              })
            : ""
        }

      </div>

      <!-- Coluna Lateral: Checkout -->
      <aside>
        <div class="purchase-card p-5 space-y-5">

          <!-- Capa pequena -->
          <img src="${getCoverUrl(game)}" alt="Capa de ${game.title}"
               class="w-full aspect-[3/4] object-cover rounded-xl bg-[var(--color-surface-2)]" />

          <!-- Preço -->
          <div>
            <p class="text-xs text-[var(--color-muted-2)] uppercase tracking-widest">Preço</p>
            <p class="font-display text-3xl font-bold mt-1 text-gradient-brand">${formatPrice(game.price)}</p>
          </div>

          <!-- Botões de Ação -->
          <div class="space-y-2">
            ${buyButton}
            ${!inLibrary ? wishlistButton : ""}
          </div>

          <!-- Publisher -->
          ${
            game.publisher?.name
              ? `<p class="text-xs text-[var(--color-muted-2)] text-center border-t border-[var(--color-border)] pt-3">
                   Publicado por <strong class="text-muted">${game.publisher.name}</strong>
                 </p>`
              : ""
          }

        </div>
      </aside>

    </div>
    </div>
  `;

  return PublicLayout(content);
}

export async function afterRender({ slug }) {
  const game = await GamesService.getBySlug(slug);
  if (!game) return;

  // Adicionar ao Carrinho
  document.getElementById("btn-add-cart")?.addEventListener("click", async () => {
    await Actions.adicionarAoCarrinho(game);
    navigate("/cart");
  });

  // Alternar Lista de Desejos
  document.getElementById("btn-wishlist")?.addEventListener("click", async () => {
    await Actions.alternarListaDesejos(game);
    navigate(`/game/${slug}`);
  });

  document.querySelectorAll("[data-screenshot-carousel]").forEach((carousel) => {
    const rail = carousel.querySelector(".screenshot-carousel__rail");
    if (!rail) return;

    carousel.querySelectorAll("[data-carousel-direction]").forEach((button) => {
      button.addEventListener("click", () => {
        rail.scrollBy({
          left: Number(button.dataset.carouselDirection) * rail.clientWidth * 0.85,
          behavior: "smooth",
        });
      });
    });
  });
}
