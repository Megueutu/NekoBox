import { Store } from "../../store/store";
import { ACCOUNT_PATHS } from "../../app/router/account-routes";
import { Icon, icons } from "../ui/Icon";
import { WalletDialog } from "../WalletDialog";

export function Navbar() {
  const { cart, wishlist, user } = Store.getState();
  const isAuthenticated = Boolean(localStorage.getItem("access_token") && user);
  const isAdmin = isAuthenticated && user.role === "ADMIN";
  const isCustomer = isAuthenticated && !isAdmin;
  const currentPath = window.location.pathname;
  const isHub = currentPath === "/hub";
  const isLanding = currentPath === "/";
  const cartCount = cart.length;
  const wishlistCount = wishlist.length;
  const navIcon = (href, label, icon, className = "") => {
    const isCurrent = currentPath === href;
    return `<a href="${href}" data-link ${isCurrent ? 'aria-current="page"' : ""}
      class="nav-icon-link ${className} ${isCurrent ? "nav-icon-link--current" : ""}"
      aria-label="${label}" title="${label}">
        ${Icon(icon, { className: "w-4 h-4 sm:w-5 h-5" })}
      </a>`;
  };

  return `
    <nav class="site-nav ${isHub ? "site-nav--hub" : ""} ${isLanding ? "site-nav--landing" : ""} ${(isHub || isLanding) && window.scrollY > 0 ? "site-nav--scrolled" : ""} sticky top-0 z-50" aria-label="Navegação principal">
      <div class="site-container site-nav__inner flex items-center justify-between">

        <a href="/" data-link class="flex items-center gap-2 shrink-0" aria-label="NekoBox — Início">
          <img src="/cat.svg" class="site-brand__mark" alt="" aria-hidden="true" />
          <img src="/logo.svg" class="site-brand__logo" alt="NekoBox" />
        </a>

        <div class="flex items-center gap-0 sm:gap-2">
          ${navIcon("/", "Início", icons.home)}
          ${navIcon("/hub", "Catálogo", icons.search)}
          ${isCustomer ? navIcon(ACCOUNT_PATHS.library, "Minha Biblioteca", icons.library, "hidden sm:flex") : ""}
          ${isCustomer ? navIcon(ACCOUNT_PATHS.games, "Lançar Jogo", icons.gamepad, "hidden sm:flex") : ""}
          ${isAdmin ? navIcon("/admin", "Administração", icons.dashboard, "hidden sm:flex") : ""}
          ${navIcon("/acessibilidade", "Acessibilidade", icons.accessibility, "hidden sm:flex")}

          ${
            isAuthenticated
              ? `<details class="lg:hidden relative order-last">
            <summary class="list-none [&::-webkit-details-marker]:hidden flex items-center justify-center w-9 h-9 rounded-lg text-muted hover:text-[var(--color-ink)] hover:bg-[var(--color-surface-2)] transition-colors cursor-pointer" aria-label="Abrir menu de navegação">
              ${Icon(icons.menu)}
            </summary>
            <nav class="absolute right-0 top-full mt-2 w-48 bg-surface rounded-xl shadow-xl py-2 z-50" aria-label="Navegação mobile">
              <a href="/" data-link ${currentPath === "/" ? 'aria-current="page"' : ""} class="type-small block px-4 py-2.5 text-muted hover:text-[var(--color-ink)] hover:bg-[var(--color-surface-2)] transition-colors">Início</a>
              <a href="/hub" data-link ${currentPath === "/hub" ? 'aria-current="page"' : ""} class="type-small block px-4 py-2.5 text-muted hover:text-[var(--color-ink)] hover:bg-[var(--color-surface-2)] transition-colors">Catálogo</a>
              <a href="/acessibilidade" data-link ${currentPath === "/acessibilidade" ? 'aria-current="page"' : ""} class="type-small block px-4 py-2.5 text-muted hover:text-[var(--color-ink)] hover:bg-[var(--color-surface-2)] transition-colors">Acessibilidade</a>
              ${
                isCustomer
                  ? `
                    <a href="${ACCOUNT_PATHS.library}" data-link ${currentPath === ACCOUNT_PATHS.library ? 'aria-current="page"' : ""} class="type-small block px-4 py-2.5 text-muted hover:text-[var(--color-ink)] hover:bg-[var(--color-surface-2)] transition-colors">Minha Biblioteca</a>
                    <a href="${ACCOUNT_PATHS.games}" data-link ${currentPath === ACCOUNT_PATHS.games ? 'aria-current="page"' : ""} class="type-small block px-4 py-2.5 text-muted hover:text-[var(--color-ink)] hover:bg-[var(--color-surface-2)] transition-colors">Meus Jogos</a>
                    <a href="${ACCOUNT_PATHS.wishlist}" data-link class="type-small block px-4 py-2.5 text-muted hover:text-[var(--color-ink)] hover:bg-[var(--color-surface-2)] transition-colors">Lista de Desejos${wishlistCount ? ` (${wishlistCount})` : ""}</a>
                    <a href="${ACCOUNT_PATHS.cart}" data-link class="type-small block px-4 py-2.5 text-muted hover:text-[var(--color-ink)] hover:bg-[var(--color-surface-2)] transition-colors">Carrinho${cartCount ? ` (${cartCount})` : ""}</a>
                    <button type="button" data-wallet-trigger class="type-small w-full text-left px-4 py-2.5 text-muted hover:text-[var(--color-ink)] hover:bg-[var(--color-surface-2)] transition-colors">Adicionar saldo</button>
                    <a href="${ACCOUNT_PATHS.profile}" data-link class="type-small block px-4 py-2.5 text-muted hover:text-[var(--color-ink)] hover:bg-[var(--color-surface-2)] transition-colors">Meu Perfil</a>
                  `
                  : isAdmin
                    ? '<a href="/admin" data-link class="type-small block px-4 py-2.5 text-muted hover:text-[var(--color-ink)] hover:bg-[var(--color-surface-2)] transition-colors">Administração</a>'
                    : ""
              }
            </nav>
          </details>`
              : ""
          }

          ${
            isCustomer
              ? `
                <a href="${ACCOUNT_PATHS.wishlist}" data-link class="nav-icon-link hidden sm:flex relative" aria-label="Lista de desejos" title="Lista de desejos">
                  ${Icon(icons.heart, { className: "w-4 h-4 sm:w-4.5 sm:h-4.5" })}
                  ${wishlistCount > 0 ? `<span class="absolute -top-1.5 -right-1.5 bg-[var(--color-accent-400)] text-[var(--color-bg)] text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">${wishlistCount}</span>` : ""}
                </a>
                <a href="${ACCOUNT_PATHS.cart}" data-link class="nav-icon-link hidden sm:flex relative" aria-label="Carrinho de compras" title="Carrinho de compras">
                  ${Icon(icons.shoppingCart, { className: "w-4 h-4 sm:w-4.5 sm:h-4.5" })}
                  ${cartCount > 0 ? `<span class="absolute -top-1.5 -right-1.5 bg-[var(--color-brand-500)] text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">${cartCount}</span>` : ""}
                </a>
              `
              : ""
          }

          ${
            isCustomer
              ? `<button type="button" data-wallet-trigger class="nav-icon-link hidden sm:flex" aria-haspopup="dialog" aria-controls="wallet-dialog" aria-label="Adicionar saldo" title="Adicionar saldo">
                  ${Icon(icons.wallet, { className: "w-4 h-4 sm:w-4.5 sm:h-4.5" })}
                </button>`
              : ""
          }

          ${
            isCustomer
              ? `
            <a href="${ACCOUNT_PATHS.profile}" data-link class="hidden sm:flex items-center gap-2" aria-label="Meu perfil">
              <div class="w-8 h-8 rounded-full bg-cover bg-center bg-[var(--color-surface-3)] border-2 border-[var(--color-brand-500)]/60 hover:border-[var(--color-accent-400)] transition-colors"
                   role="img" aria-label="Avatar de ${user.username || "usuário"}"
                   style="background-image: url('${user.avatar_url}')"></div>
            </a>
          `
              : !isAuthenticated
                ? `
                  <a href="/login" data-login-trigger class="nav-icon-link" aria-label="Entrar" aria-haspopup="dialog" aria-controls="auth-dialog">
                    ${Icon(icons.logIn, { className: "w-4 h-4 sm:w-4.5 sm:h-4.5" })}
                  </a>
                `
                : ""
          }
        </div>

      </div>
    </nav>
    ${isCustomer ? WalletDialog() : ""}
  `;
}
