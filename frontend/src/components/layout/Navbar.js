import { Store } from "../../store/store";

export function Navbar() {
  const { cart, wishlist, user } = Store.getState();
  const cartCount = cart.length;
  const wishlistCount = wishlist.length;

  return `
    <nav class="bg-[var(--color-bg)]/80 backdrop-blur-md border-b border-[var(--color-border)] sticky top-0 z-50">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16">

        <a href="/hub" data-link class="flex items-center gap-2 font-display font-bold text-xl sm:text-2xl tracking-tight shrink-0">
          <span class="w-8 h-8 rounded-lg bg-gradient-to-br from-[var(--color-brand-500)] to-[var(--color-accent-500)] flex items-center justify-center shadow-[0_0_18px_-2px_rgba(147,51,234,0.65)]">
            <svg class="w-4.5 h-4.5 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M21 6H3a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h18a1 1 0 0 0 1-1V7a1 1 0 0 0-1-1zm-10 9H8v-2H6v-2h2V9h2v2h2v2h-1v1zm4.5 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm3-3a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3z"/>
            </svg>
          </span>
          <span class="text-gradient-brand">NEXUS<span class="text-[var(--color-ink)]">PLAY</span></span>
        </a>

        <div class="hidden md:flex items-center gap-7">
          <a href="/hub" data-link class="relative text-[var(--color-muted)] hover:text-[var(--color-ink)] text-sm font-semibold tracking-wide transition-colors group">
            Catálogo
            <span class="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-[var(--color-brand-400)] to-[var(--color-accent-400)] group-hover:w-full transition-all duration-300"></span>
          </a>
        </div>

        <div class="flex items-center gap-3 sm:gap-5">

          <a href="/wishlist" data-link class="relative text-[var(--color-muted)] hover:text-[var(--color-accent-400)] transition-colors" aria-label="Lista de desejos">
            <svg class="w-5.5 h-5.5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
            </svg>
            ${
              wishlistCount > 0
                ? `<span class="absolute -top-1.5 -right-1.5 bg-gradient-to-br from-[var(--color-accent-400)] to-[var(--color-accent-600)] text-[var(--color-bg)] text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">${wishlistCount}</span>`
                : ""
            }
          </a>

          <a href="/cart" data-link class="relative text-[var(--color-muted)] hover:text-[var(--color-accent-400)] transition-colors" aria-label="Carrinho de compras">
            <svg class="w-5.5 h-5.5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"/>
            </svg>
            ${
              cartCount > 0
                ? `<span class="absolute -top-1.5 -right-1.5 bg-gradient-to-br from-[var(--color-brand-400)] to-[var(--color-brand-600)] text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">${cartCount}</span>`
                : ""
            }
          </a>

          ${
            user
              ? `
            <a href="/profile" data-link class="flex items-center gap-2" aria-label="Meu perfil">
              <div class="w-8 h-8 rounded-full bg-cover bg-center bg-[var(--color-surface-3)] border-2 border-[var(--color-brand-500)]/60 hover:border-[var(--color-accent-400)] transition-colors"
                   style="background-image: url('${user.avatar_url}')"></div>
            </a>
          `
              : `
            <a href="/login" data-link class="px-4 py-1.5 bg-gradient-to-r from-[var(--color-brand-500)] to-[var(--color-brand-600)] text-white text-sm font-bold rounded-lg hover:brightness-110 transition-all shadow-[0_0_16px_-4px_rgba(147,51,234,0.7)]">
              Entrar
            </a>
          `
          }
        </div>

      </div>
    </nav>
  `;
}
