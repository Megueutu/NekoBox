import { getCoverUrl } from "../../utils/media";
import { formatPrice, getRecommendationRate } from "../../utils/format";

/**
 * Card de jogo reutilizável.
 * variant: "catalog" (grid do Hub) | "library" (Minha Biblioteca) | "wishlist" (Lista de Desejos)
 */
export function GameCard(game, { variant = "catalog" } = {}) {
  if (variant === "catalog") {
    const recRate = getRecommendationRate(game.reviews);
    return `
      <a href="/game/${game.slug}" data-link
         class="game-card block rounded-[var(--radius-card)] overflow-hidden border border-[var(--color-border)] card-hover-glow group">
        <div class="game-card__media w-full bg-[var(--color-surface-3)] relative overflow-hidden">
          <img src="${getCoverUrl(game)}" alt="Capa de ${game.title}" loading="lazy"
               class="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
          <div class="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/45 to-transparent pointer-events-none"></div>
          ${
            game.categories?.[0]
              ? `<span class="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide bg-black/65 backdrop-blur-sm text-[var(--color-brand-100)] border border-white/10">${game.categories[0]}</span>`
              : ""
          }
          ${
            recRate !== null
              ? `<span class="absolute top-2.5 right-2.5 flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-black/65 backdrop-blur-sm border border-white/10 ${recRate >= 70 ? "text-[var(--color-accent-400)]" : "text-[var(--color-muted)]"}">
                  ★ ${recRate}%
                 </span>`
              : ""
          }
        </div>
        <div class="game-card__body">
          <p class="font-bold text-sm sm:text-base leading-snug line-clamp-2">${game.title}</p>
          <p class="text-xs text-muted truncate mt-1">${game.publisher?.name || game.categories?.[0] || "Jogo digital"}</p>
          <span class="font-display font-bold text-base text-[var(--color-accent-400)] mt-auto pt-2">${formatPrice(game.price)}</span>
        </div>
      </a>
    `;
  }

  if (variant === "library") {
    return `
      <div class="game-card bg-surface border border-[var(--color-border)] rounded-xl overflow-hidden card-hover-glow">
        <a href="/game/${game.slug}" data-link class="block">
          <img src="${getCoverUrl(game)}" alt="Capa de ${game.title}" loading="lazy"
               class="game-card__media w-full object-cover bg-[var(--color-surface-2)]" />
        </a>
        <div class="p-3 space-y-2">
          <p class="font-semibold text-sm truncate">${game.title}</p>
          <p class="text-xs text-[var(--color-brand-400)]">${game.categories?.[0] || ""}</p>
          <button data-play="${game.slug}"
                  class="w-full py-2 bg-gradient-to-r from-[var(--color-accent-500)] to-[var(--color-accent-600)] text-[var(--color-bg)] text-xs font-bold rounded-lg hover:brightness-110 transition-all">
            ▶ Jogar Agora
          </button>
        </div>
      </div>
    `;
  }

  // variant === "wishlist"
  return `
    <div class="game-card bg-surface border border-[var(--color-border)] rounded-xl overflow-hidden card-hover-glow group">
      <a href="/game/${game.slug}" data-link class="block">
        <img src="${getCoverUrl(game)}" alt="Capa de ${game.title}" loading="lazy"
             class="game-card__media w-full object-cover bg-[var(--color-surface-2)]" />
      </a>
      <div class="p-4 space-y-2.5">
        <p class="font-semibold text-sm truncate">${game.title}</p>
        <p class="font-bold text-sm text-[var(--color-accent-400)]">${formatPrice(game.price)}</p>
        <div class="flex gap-2">
          <button data-add-cart="${game.id}"
                  class="flex-1 py-1.5 bg-gradient-to-r from-[var(--color-brand-500)] to-[var(--color-brand-700)] text-white text-xs font-bold rounded-lg hover:brightness-110 transition-all">
            + Carrinho
          </button>
          <button data-remove-wishlist="${game.id}" aria-label="Remover ${game.title} da lista de desejos"
                  class="px-2.5 py-1.5 border border-red-400/50 text-red-400 text-xs rounded-lg hover:bg-red-500/10 transition-colors">
            ✕
          </button>
        </div>
      </div>
    </div>
  `;
}
