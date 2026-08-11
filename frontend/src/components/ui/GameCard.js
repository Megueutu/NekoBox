import { getCoverUrl, getPosterUrl } from "../../utils/media";
import { formatPrice, isFreeGame } from "../../utils/format";
import { Icon, icons } from "./Icon";

export function GameCard(game, { variant = "catalog" } = {}) {
  if (variant === "catalog") {
    return `
      <a href="/game/${game.slug}" data-link
         class="game-card block rounded-[var(--radius-card)] overflow-hidden card-hover group">
        <div class="game-card__media w-full bg-[var(--color-surface-3)] relative overflow-hidden">
          <img src="${getCoverUrl(game)}" alt="Capa de ${game.title}" loading="lazy"
               class="w-full h-full object-cover transition-opacity duration-200 group-hover:opacity-90" />
          <div class="game-card__overlay">
            <p class="game-card__title type-card-title line-clamp-2">${game.title}</p>
            <p class="type-caption text-muted truncate">${game.publisher?.name || game.categories?.[0] || "Jogo digital"}</p>
            <span class="type-card-title text-[var(--color-accent-400)]">${formatPrice(game.price)}</span>
          </div>
        </div>
      </a>
    `;
  }

  if (variant === "poster") {
    return `
      <a href="/game/${game.slug}" data-link
         class="catalog-poster group" aria-label="Ver ${game.title}">
        <img src="${getPosterUrl(game)}" alt="Pôster de ${game.title}" loading="lazy" />
      </a>
    `;
  }

  if (variant === "library") {
    return `
      <div class="game-card bg-surface rounded-xl overflow-hidden card-hover">
        <a href="/game/${game.slug}" data-link class="block">
          <img src="${getCoverUrl(game)}" alt="Capa de ${game.title}" loading="lazy"
               class="game-card__media w-full object-cover bg-[var(--color-surface-2)]" />
        </a>
        <div class="p-3 space-y-2">
          <p class="type-card-title truncate">${game.title}</p>
          <p class="type-caption text-[var(--color-brand-400)]">${game.categories?.[0] || ""}</p>
          <button data-play="${game.slug}"
                  class="button-accent button--sm w-full py-2 gap-1.5">
            ${Icon(icons.play, { className: "w-3.5 h-3.5", fill: "currentColor" })} Jogar Agora
          </button>
        </div>
      </div>
    `;
  }

  const freeGame = isFreeGame(game);
  return `
    <div class="game-card block rounded-[var(--radius-card)] overflow-hidden card-hover group">
    <div class="game-card__media w-full bg-[var(--color-surface-3)] relative overflow-hidden">
      <div class="game-card__actions flex gap-1.5">
        <button ${freeGame ? `data-acquire-free-license="${game.id}"` : `data-add-cart="${game.id}"`}
                class="game-card__icon-btn" aria-label="${freeGame ? "Adquirir licença" : "Adicionar ao carrinho"}">
          ${Icon(freeGame ? icons.library : icons.shoppingCart, { className: "w-3.5 h-3.5" })}
        </button>
        <button data-remove-wishlist="${game.id}"
                class="game-card__icon-btn game-card__icon-btn--danger" aria-label="Remover ${game.title} da lista de desejos">
          ${Icon(icons.x, { className: "w-3.5 h-3.5" })}
        </button>
      </div>
        <a href="/game/${game.slug}" data-link class="absolute inset-0 block" aria-label="Ver ${game.title}">
          <img src="${getCoverUrl(game)}" alt="Capa de ${game.title}" loading="lazy"
               class="w-full h-full object-cover transition-opacity duration-200 group-hover:opacity-90" />
        </a>
        <div class="game-card__overlay">
          <p class="game-card__title type-card-title line-clamp-2">${game.title}</p>
          <div class="flex items-center justify-between gap-2 pointer-events-auto">
            <span class="type-card-title text-[var(--color-accent-400)]">${formatPrice(game.price)}</span>
          </div>
        </div>
      </div>
    </div>
  `;
}
