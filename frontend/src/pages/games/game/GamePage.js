import { PublicLayout } from "../../../app/layouts/PublicLayout";
import { ACCOUNT_PATHS } from "../../../app/router/account-routes";
import { GamesService } from "../../../services/games/games.service";
import { Store } from "../../../store/store";
import { Actions } from "../../../store/actions";
import { navigate } from "../../../app/router/navigate";
import { formatPrice, isFreeGame } from "../../../utils/format";
import { getCoverUrl, getBannerUrl } from "../../../utils/media";
import { Section } from "../../../components/ui/Section";
import { Icon, icons } from "../../../components/ui/Icon";
import { renderScreenshotGallery } from "./game-gallery";
import { renderAboutGame } from "./game-information";

export { renderScreenshotGallery, renderAboutGame };

export default async function GamePage({ slug }) {
  const game = await GamesService.getBySlug(slug);

  if (!game) {
    return PublicLayout(`
      <div class="max-w-7xl mx-auto px-4 py-24 text-center">
        <h1 class="type-page-title mb-4">Jogo não encontrado</h1>
        <p class="type-body text-muted mb-6">Este título não existe ou foi removido do catálogo.</p>
        <a href="/hub" data-link class="button-primary px-6 py-3">
          Voltar ao Catálogo
        </a>
      </div>
    `);
  }

  const banner = game.media?.find((m) => m.type === "banner");
  const screenshots = game.media?.filter((m) => m.type === "screenshot") || [];

  const { cart, wishlist, library } = Store.getState();
  const inLibrary = library.some((g) => g.id === game.id);
  const inPersonalCart = cart.some((g) => g.id === game.id && !g.for_gift);
  const inGiftCart = cart.some((g) => g.id === game.id && g.for_gift);
  const inWishlist = wishlist.some((g) => g.id === game.id);
  const freeGame = isFreeGame(game);

  const buyButton = inLibrary
    ? `<button disabled class="button-secondary w-full py-3 cursor-not-allowed">
         Disponível na sua Biblioteca
       </button>`
    : freeGame
    ? `<button id="btn-acquire-free-license" class="button-primary w-full py-3">
         Adquirir licença gratuitamente
       </button>`
    : inPersonalCart
    ? `<a href="${ACCOUNT_PATHS.cart}" data-link class="block w-full py-3 bg-[var(--color-surface-3)] text-white font-bold rounded-lg text-center text-sm hover:bg-[var(--color-brand-700)]/50 transition-colors">
         Item no carrinho
       </a>`
    : `<button id="btn-add-cart" class="button-primary w-full py-3">
         Comprar
       </button>`;

  const wishlistButton = inWishlist
    ? `<button id="btn-wishlist" class="w-full py-2.5 border-2 border-[var(--color-danger)]/70 text-[var(--color-danger)] font-semibold rounded-lg hover:bg-[var(--color-danger)]/10 transition-colors text-sm inline-flex items-center justify-center gap-2">
         ${Icon(icons.heart, { className: "w-4 h-4" })} Na lista de desejos
       </button>`
    : `<button id="btn-wishlist" class="button-secondary w-full py-2.5 gap-2">
         ${Icon(icons.heart, { className: "w-4 h-4" })} Adicionar à lista de desejos
       </button>`;

  const content = `
    <div class="site-container page-stack">
      <!-- Banner Hero -->
      <section class="hero-panel game-detail-hero"
         style="background-image: url('${banner ? getBannerUrl(game) : getCoverUrl(game)}')">
      <div class="absolute inset-0 bg-black/60"></div>
      <div class="hero-panel__content">
        <div class="relative z-10 max-w-3xl">
          <h1 class="type-hero-title text-white mb-4">${game.title}</h1>
          <div class="flex flex-wrap gap-2 items-center">
            ${game.categories.map((c) => `<span class="chip">${c}</span>`).join("")}
          </div>
        </div>
      </div>
    </section>

      <!-- Seção 1: Informações + Compra -->
      <section class="game-layout" aria-label="Informações e compra do jogo">

      <!-- Coluna Principal (Detalhes) -->
      <div class="game-content">

        <!-- Descrição -->
        ${Section({
          title: "Sobre o Jogo",
          body: renderAboutGame(game.long_description, game.tags, game.publisher?.name, game.release_date),
        })}

      </div>

      <!-- Coluna Lateral: Checkout -->
      <aside>
        <div class="purchase-card p-5 space-y-5">

          <!-- Capa pequena -->
          <img src="${getCoverUrl(game)}" alt="Capa de ${game.title}"
               class="w-full aspect-[3/4] object-cover rounded-xl bg-[var(--color-surface-2)]" />

          <!-- Preço -->
          <div>
            <p class="type-eyebrow text-[var(--color-muted-2)]">Preço</p>
            <p class="type-content-title mt-1">${formatPrice(game.price)}</p>
          </div>

          <!-- Botões de Ação -->
          <div class="space-y-2">
            ${buyButton}
            ${!inLibrary ? wishlistButton : ""}
          </div>
        </div>
      </aside>
      </section>

      <!-- Seção 2: Capturas de Tela (100% da largura da tela) -->
      ${
        screenshots.length
          ? `
        <section class="screenshot-showcase" data-screenshot-showcase aria-label="Capturas de tela de ${game.title}">
          ${renderScreenshotGallery(game.title, screenshots)}
        </section>
      `
          : ""
      }
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
    await Actions.adicionarAoCarrinho(game);
    navigate(ACCOUNT_PATHS.cart);
  });

  // Alternar Lista de Desejos
  document.getElementById("btn-wishlist")?.addEventListener("click", async () => {
    await Actions.alternarListaDesejos(game);
    navigate(`/game/${slug}`);
  });

  document.querySelectorAll("[data-screenshot-showcase]").forEach((showcase) => {
    const rail = showcase.querySelector(".screenshot-carousel__rail");
    const cards = rail ? [...rail.querySelectorAll(".screenshot-card:not([data-clone])")] : [];
    if (!rail || !cards.length) return;

    const leadingClones = [...rail.querySelectorAll('.screenshot-card[data-clone="leading"]')];
    const trailingClones = [...rail.querySelectorAll('.screenshot-card[data-clone="trailing"]')];
    if (leadingClones.length && trailingClones.length) {
      const realStart = cards[0].offsetLeft;
      const realEnd = trailingClones[0].offsetLeft;
      const loopWidth = realEnd - realStart;
      // Metade do espaço sobrando ao redor de um slide: desloca a janela de rolagem
      // para que o slide ativo fique centralizado, com o anterior/próximo espiando nas bordas.
      const peek = Math.max(0, (rail.clientWidth - cards[0].offsetWidth) / 2);
      const windowStart = realStart - peek;
      const windowEnd = realEnd - peek;

      // Começa com a primeira captura centralizada; a última (clone à esquerda) e a
      // segunda captura espiam nas laterais, e o arrasto nunca mostra espaço vazio.
      rail.scrollLeft = windowStart;

      rail.addEventListener(
        "scroll",
        () => {
          if (loopWidth <= 0) return;
          if (rail.scrollLeft >= windowEnd) {
            rail.scrollLeft -= loopWidth;
          } else if (rail.scrollLeft < windowStart) {
            rail.scrollLeft += loopWidth;
          }
        },
        { passive: true }
      );
    }

    let isDragging = false;
    let pointerId = null;
    let startX = 0;
    let startScrollLeft = 0;

    const endDrag = () => {
      if (!isDragging) return;
      isDragging = false;
      rail.classList.remove("is-dragging");
      if (pointerId !== null) rail.releasePointerCapture(pointerId);
      pointerId = null;
    };

    rail.addEventListener("pointerdown", (event) => {
      isDragging = true;
      pointerId = event.pointerId;
      rail.setPointerCapture(pointerId);
      rail.classList.add("is-dragging");
      startX = event.clientX;
      startScrollLeft = rail.scrollLeft;
    });

    rail.addEventListener("pointermove", (event) => {
      if (!isDragging) return;
      rail.scrollLeft = startScrollLeft - (event.clientX - startX);
    });

    rail.addEventListener("pointerup", endDrag);
    rail.addEventListener("pointercancel", endDrag);

    const dots = [...showcase.querySelectorAll("[data-carousel-dot]")];
    dots.forEach((dot, index) => {
      dot.addEventListener("click", () => {
        cards[index]?.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
      });
    });

    if (dots.length) {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            const index = cards.indexOf(entry.target);
            if (index === -1) return;
            dots.forEach((dot, dotIndex) => dot.setAttribute("aria-current", String(dotIndex === index)));
          });
        },
        { root: rail, threshold: 0.6 }
      );
      cards.forEach((card) => observer.observe(card));
    }
  });

  const purchaseCard = document.querySelector(".purchase-card");
  const descriptionBox = document.querySelector("[data-game-description]");
  if (purchaseCard && descriptionBox) {
    const desktopLayout = window.matchMedia("(min-width: 1024px)");
    const updateDescriptionHeight = () => {
      descriptionBox.style.maxHeight = desktopLayout.matches ? `${purchaseCard.offsetHeight}px` : "";
    };
    updateDescriptionHeight();
    window.addEventListener("resize", updateDescriptionHeight);
    window.addEventListener("rerender", () => window.removeEventListener("resize", updateDescriptionHeight), { once: true });
  }
}
