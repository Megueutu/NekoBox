import { PublicLayout } from "../../app/layouts/PublicLayout";
import { ACCOUNT_PATHS } from "../../app/router/account-routes";
import { GamesService } from "../../services/games/games.service";
import { Store } from "../../store/store";
import { Actions } from "../../store/actions";
import { navigate } from "../../app/router/navigate";
import { formatPrice, formatDate, isFreeGame } from "../../utils/format";
import { getCoverUrl, getBannerUrl } from "../../utils/media";
import { Section } from "../../components/ui/Section";
import { Icon, icons } from "../../components/ui/Icon";
import { renderScreenshotControls, renderScreenshotGallery } from "./game-gallery";
import {
  renderAboutGame,
  renderLanguages,
  renderSystemRequirements,
} from "./game-information";

export {
  renderScreenshotGallery,
  renderAboutGame,
  renderLanguages,
  renderSystemRequirements,
};

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

  const { user, cart, wishlist, library } = Store.getState();
  const inLibrary = library.some((g) => g.id === game.id);
  const inCart = cart.some((g) => g.id === game.id && !g.for_gift);
  const giftInCart = cart.some((g) => g.id === game.id && g.for_gift);
  const inWishlist = wishlist.some((g) => g.id === game.id);
  const freeGame = isFreeGame(game);
  const ownsGame = library.some((item) => String(item.id) === String(game.id));
  const hasOwnReview = game.reviews?.some((review) => review.username === user?.username);

  const buyButton = inLibrary
    ? `<button disabled class="w-full py-3 bg-[var(--color-surface-2)] text-[var(--color-muted-2)] font-bold rounded-lg cursor-not-allowed text-sm">
         Disponível na sua Biblioteca
       </button>`
    : freeGame
    ? `<button id="btn-acquire-free-license" class="button-primary w-full py-3 text-sm">
         Adquirir licença gratuitamente
       </button>`
    : inCart
    ? `<a href="${ACCOUNT_PATHS.cart}" data-link class="block w-full py-3 bg-[var(--color-surface-3)] text-white font-bold rounded-lg text-center text-sm hover:bg-[var(--color-brand-700)]/50 transition-colors">
         Item no Carrinho — Ver Sacola
       </a>`
    : `<button id="btn-add-cart" class="button-primary w-full py-3 text-sm">
         Adicionar ao Carrinho
       </button>`;

  const giftButton = freeGame
    ? `<button disabled aria-disabled="true" title="Jogos gratuitos não podem ser presenteados." class="button-secondary purchase-gift-action__button w-full py-2.5 text-sm gap-2 cursor-not-allowed opacity-50">
         ${Icon(icons.gift, { className: "w-4 h-4" })} Presentear indisponível
       </button>`
    : giftInCart
    ? `<a href="${ACCOUNT_PATHS.cart}" data-link class="button-secondary purchase-gift-action__button w-full py-2.5 text-sm gap-2">
         ${Icon(icons.gift, { className: "w-4 h-4" })} Presente no carrinho — Ver sacola
       </a>`
    : `<button id="btn-gift-game" class="button-secondary purchase-gift-action__button w-full py-2.5 text-sm gap-2">
         ${Icon(icons.gift, { className: "w-4 h-4" })} Presentear este jogo
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
    <div class="game-primary">
      <!-- Banner Hero -->
      <section class="hero-panel game-detail-hero"
         style="background-image: url('${banner ? getBannerUrl(game) : getCoverUrl(game)}')">
      <div class="absolute inset-0 bg-black/60"></div>
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

      <!-- Conteúdo e compra -->
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
          actions: screenshots.length ? renderScreenshotControls() : "",
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
            <div class="purchase-gift-action">
              ${giftButton}
              <p>${freeGame ? "Jogos gratuitos não podem ser presenteados." : `Você recebe um código para enviar a um amigo. <a href="${ACCOUNT_PATHS.gifts}" data-link>Ver meus códigos</a>`}</p>
            </div>
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

    <div class="game-details-fullwidth">
      ${Section({
        title: "Sua avaliação",
        body: !user
          ? `<p class="text-muted text-sm">Entre na sua conta para avaliar este jogo.</p>`
          : !ownsGame
          ? `<p class="text-muted text-sm">Você poderá avaliar este jogo quando ele estiver na sua biblioteca.</p>`
          : hasOwnReview
          ? `<p class="text-muted text-sm">Você já enviou uma avaliação para este jogo.</p>`
          : `
            <form class="game-review-form" data-review-form>
              <div class="game-review-form__fields">
                <label>
                  <span>Nota</span>
                  <select class="ui-control" name="rating" required>
                    <option value="">Selecione</option>
                    <option value="5">5 — Excelente</option>
                    <option value="4">4 — Muito bom</option>
                    <option value="3">3 — Bom</option>
                    <option value="2">2 — Regular</option>
                    <option value="1">1 — Não gostei</option>
                  </select>
                </label>
                <fieldset>
                  <legend>Você recomenda?</legend>
                  <div class="game-review-form__recommendation">
                    <label><input type="radio" name="recommended" value="true" required> Recomendo</label>
                    <label><input type="radio" name="recommended" value="false" required> Não recomendo</label>
                  </div>
                </fieldset>
              </div>
              <label>
                <span>Conte como foi sua experiência <small>(opcional)</small></span>
                <textarea class="ui-control" name="reviewText" rows="4" placeholder="O que você gostou ou não gostou?"></textarea>
              </label>
              <div class="game-review-form__footer">
                <p data-review-feedback role="status" aria-live="polite"></p>
                <button type="submit" class="button-primary">Publicar avaliação</button>
              </div>
            </form>
          `,
      })}

      ${
        game.languages?.length
          ? Section({
              title: "Idiomas Suportados",
              body: renderLanguages(game.languages),
            })
          : ""
      }

      ${
        game.updates?.length
          ? Section({
              title: "Histórico de Atualizações",
              body: `
                <div class="game-detail-rail game-detail-rail--updates" aria-label="Histórico de atualizações">
                  ${game.updates
                    .map(
                      (u) => `
                    <article class="game-update-card">
                      <header>
                        <span>${u.version}</span>
                        <time datetime="${u.created_at}">${formatDate(u.created_at)}</time>
                      </header>
                      <h3>${u.title}</h3>
                      <p>${u.content}</p>
                    </article>
                  `
                    )
                    .join("")}
                </div>
              `,
            })
          : ""
      }

      ${
        game.reviews?.length
          ? Section({
              title: "Avaliações",
              heading: `<span class="text-sm font-normal text-[var(--color-muted-2)] ml-2">(${game.reviews.length})</span>`,
              body: `
                <div class="game-detail-rail game-detail-rail--reviews" aria-label="Avaliações de jogadores">
                  ${game.reviews
                    .map(
                      (r) => `
                    <article class="game-review-card">
                      <header>
                        <span class="game-review-card__recommendation ${r.recommended ? "is-recommended" : "is-not-recommended"}">
                          ${Icon(r.recommended ? icons.check : icons.x, { className: "w-3 h-3" })} ${r.recommended ? "Recomenda" : "Não recomenda"}
                        </span>
                        <time datetime="${r.created_at}">${formatDate(r.created_at)}</time>
                      </header>
                      <h3>${r.username}</h3>
                      <p>${r.review_text || "Sem comentário adicional."}</p>
                      <small>${r.votes} pessoas acharam útil</small>
                    </article>
                  `
                    )
                    .join("")}
                </div>
              `,
            })
          : ""
      }
    </div>
    </div>
  `;

  return PublicLayout(content);
}

export async function afterRender({ slug }) {
  const game = await GamesService.getBySlug(slug);
  if (!game) return;

  document.getElementById("btn-acquire-free-license")?.addEventListener("click", async () => {
    await Actions.adquirirLicencaGratuita(game);
    navigate(`/game/${slug}`);
  });

  // Adicionar ao Carrinho
  document.getElementById("btn-add-cart")?.addEventListener("click", async () => {
    await Actions.adicionarAoCarrinho(game, false);
    navigate(ACCOUNT_PATHS.cart);
  });

  document.getElementById("btn-gift-game")?.addEventListener("click", async () => {
    await Actions.adicionarAoCarrinho(game, true);
    navigate(ACCOUNT_PATHS.cart);
  });

  // Alternar Lista de Desejos
  document.getElementById("btn-wishlist")?.addEventListener("click", async () => {
    await Actions.alternarListaDesejos(game);
    navigate(`/game/${slug}`);
  });

  document.querySelector("[data-review-form]")?.addEventListener("submit", async (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    if (!form.reportValidity()) return;

    const feedback = form.querySelector("[data-review-feedback]");
    const submit = form.querySelector('button[type="submit"]');
    submit.disabled = true;
    feedback.textContent = "Publicando avaliação…";

    try {
      await GamesService.createReview(game.id, {
        rating: Number(form.elements.rating.value),
        recommended: form.elements.recommended.value === "true",
        reviewText: form.elements.reviewText.value.trim(),
      });
      navigate(`/game/${slug}`);
    } catch (error) {
      feedback.textContent = error.message || "Não foi possível publicar sua avaliação.";
      submit.disabled = false;
    }
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
