import { Store } from "../../store/store";
import { Icon, icons } from "../ui/Icon";
import { WalletDialog } from "../wallet/WalletDialog";

export function Navbar() {
  const { cart, wishlist, user } = Store.getState();
  const currentPath = window.location.pathname;
  const cartCount = cart.length;
  const wishlistCount = wishlist.length;
  const navLink = (href, label) => {
    const isCurrent = currentPath === href;
    return `<a href="${href}" data-link ${isCurrent ? 'aria-current="page"' : ""}
      class="site-nav__link ${isCurrent ? "site-nav__link--current" : ""}">${label}</a>`;
  };

  return `
    <nav class="site-nav sticky top-0 z-50" aria-label="Navegação principal">
      <div class="site-container site-nav__inner flex items-center justify-between">

        <a href="/" data-link class="flex items-center gap-2 font-display font-bold text-xl sm:text-2xl tracking-tight shrink-0" aria-label="NekoBox — Início">
          <span class="w-8 h-8 rounded-lg bg-[var(--color-brand-600)] flex items-center justify-center">
            ${Icon(icons.gamepad, { className: "w-4.5 h-4.5 text-white", strokeWidth: 2.25 })}
          </span>
          <span class="text-[var(--color-ink)]">NEXUS<span class="text-[var(--color-brand-400)]">PLAY</span></span>
        </a>

        <div class="hidden lg:flex items-center gap-7">
          ${navLink("/", "Início")}
          ${navLink("/hub", "Catálogo")}
          ${navLink("/library", "Biblioteca")}
          ${user?.role === "ADMIN" ? navLink("/admin", "Admin") : ""}
          ${navLink("/acessibilidade", "Acessibilidade")}
        </div>

        <div class="flex items-center gap-3 sm:gap-5">

          <a href="/configuracoes" data-link
             class="nav-icon-link ${currentPath === "/configuracoes" ? "nav-icon-link--current" : ""}"
             ${currentPath === "/configuracoes" ? 'aria-current="page"' : ""}
             aria-label="Configurações">
            ${Icon(icons.settings, { className: "w-5.5 h-5.5 sm:w-6 sm:h-6" })}
          </a>

          <details class="lg:hidden relative order-last">
            <summary class="list-none [&::-webkit-details-marker]:hidden flex items-center justify-center w-9 h-9 rounded-lg text-muted hover:text-[var(--color-ink)] hover:bg-[var(--color-surface-2)] transition-colors cursor-pointer" aria-label="Abrir menu de navegação">
              ${Icon(icons.menu)}
            </summary>
            <nav class="absolute right-0 top-full mt-2 w-48 bg-surface rounded-xl shadow-xl py-2 z-50" aria-label="Navegação mobile">
              <a href="/" data-link ${currentPath === "/" ? 'aria-current="page"' : ""} class="block px-4 py-2.5 text-sm text-muted hover:text-[var(--color-ink)] hover:bg-[var(--color-surface-2)] transition-colors">Início</a>
              <a href="/hub" data-link ${currentPath === "/hub" ? 'aria-current="page"' : ""} class="block px-4 py-2.5 text-sm text-muted hover:text-[var(--color-ink)] hover:bg-[var(--color-surface-2)] transition-colors">Catálogo</a>
              <a href="/acessibilidade" data-link ${currentPath === "/acessibilidade" ? 'aria-current="page"' : ""} class="block px-4 py-2.5 text-sm text-muted hover:text-[var(--color-ink)] hover:bg-[var(--color-surface-2)] transition-colors">Acessibilidade</a>
              <a href="/configuracoes" data-link ${currentPath === "/configuracoes" ? 'aria-current="page"' : ""} class="block px-4 py-2.5 text-sm text-muted hover:text-[var(--color-ink)] hover:bg-[var(--color-surface-2)] transition-colors">Configurações</a>
              <a href="/library" data-link ${currentPath === "/library" ? 'aria-current="page"' : ""} class="block px-4 py-2.5 text-sm text-muted hover:text-[var(--color-ink)] hover:bg-[var(--color-surface-2)] transition-colors">Minha Biblioteca</a>
              ${user?.role === "ADMIN" ? '<a href="/admin" data-link class="block px-4 py-2.5 text-sm text-muted hover:text-[var(--color-ink)] hover:bg-[var(--color-surface-2)] transition-colors">Administração</a>' : ""}
              <a href="/wishlist" data-link class="block px-4 py-2.5 text-sm text-muted hover:text-[var(--color-ink)] hover:bg-[var(--color-surface-2)] transition-colors">Lista de Desejos${wishlistCount ? ` (${wishlistCount})` : ""}</a>
              <a href="/cart" data-link class="block px-4 py-2.5 text-sm text-muted hover:text-[var(--color-ink)] hover:bg-[var(--color-surface-2)] transition-colors">Carrinho${cartCount ? ` (${cartCount})` : ""}</a>
              ${user ? '<button type="button" data-wallet-trigger class="w-full text-left px-4 py-2.5 text-sm text-muted hover:text-[var(--color-ink)] hover:bg-[var(--color-surface-2)] transition-colors">Carteira</button>' : ""}
              <a href="/profile" data-link class="block px-4 py-2.5 text-sm text-muted hover:text-[var(--color-ink)] hover:bg-[var(--color-surface-2)] transition-colors">Meu Perfil</a>
            </nav>
          </details>

          <a href="/wishlist" data-link class="hidden sm:block relative text-muted hover:text-[var(--color-accent-400)] transition-colors" aria-label="Lista de desejos">
            ${Icon(icons.heart, { className: "w-5.5 h-5.5 sm:w-6 sm:h-6" })}
            ${
              wishlistCount > 0
                ? `<span class="absolute -top-1.5 -right-1.5 bg-[var(--color-accent-400)] text-[var(--color-bg)] text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">${wishlistCount}</span>`
                : ""
            }
          </a>

          <a href="/cart" data-link class="hidden sm:block relative text-muted hover:text-[var(--color-accent-400)] transition-colors" aria-label="Carrinho de compras">
            ${Icon(icons.shoppingCart, { className: "w-5.5 h-5.5 sm:w-6 sm:h-6" })}
            ${
              cartCount > 0
                ? `<span class="absolute -top-1.5 -right-1.5 bg-[var(--color-brand-500)] text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">${cartCount}</span>`
                : ""
            }
          </a>

          ${
            user
              ? `<button type="button" data-wallet-trigger class="nav-icon-link hidden sm:flex" aria-haspopup="dialog" aria-controls="wallet-dialog" aria-label="Abrir carteira">
                  ${Icon(icons.wallet, { className: "w-5.5 h-5.5 sm:w-6 sm:h-6" })}
                </button>`
              : ""
          }

          ${
            user
              ? `
            <a href="/profile" data-link class="hidden sm:flex items-center gap-2" aria-label="Meu perfil">
              <div class="w-8 h-8 rounded-full bg-cover bg-center bg-[var(--color-surface-3)] border-2 border-[var(--color-brand-500)]/60 hover:border-[var(--color-accent-400)] transition-colors"
                   role="img" aria-label="Avatar de ${user.username || "usuário"}"
                   style="background-image: url('${user.avatar_url}')"></div>
            </a>
          `
              : `
            <a href="/login" data-link class="button-primary hidden sm:inline-flex px-4 py-2 text-sm">
              Entrar
            </a>
          `
          }
        </div>

      </div>
    </nav>
    ${user ? WalletDialog() : ""}
  `;
}
