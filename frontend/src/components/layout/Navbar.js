import { Store } from "../../store/store";
import { ACCOUNT_PATHS } from "../../app/router/account-routes";
import { Icon, icons } from "../ui/Icon";
import { WalletDialog } from "../wallet/WalletDialog";

export function Navbar() {
  const { cart, wishlist, user } = Store.getState();
  const isAuthenticated = Boolean(localStorage.getItem("access_token") && user);
  const isAdmin = isAuthenticated && user.role === "ADMIN";
  const isCustomer = isAuthenticated && !isAdmin;
  const currentPath = window.location.pathname;
  const cartCount = cart.length;
  const wishlistCount = wishlist.length;
  const navIcon = (href, label, icon, className = "") => {
    const isCurrent = currentPath === href;
    return `<a href="${href}" data-link ${isCurrent ? 'aria-current="page"' : ""}
      class="nav-icon-link ${className} ${isCurrent ? "nav-icon-link--current" : ""}"
      aria-label="${label}" title="${label}">
        ${Icon(icon, { className: "w-5 h-5 sm:w-5.5 sm:h-5.5" })}
      </a>`;
  };

  return `
    <nav class="site-nav sticky top-0 z-50" aria-label="Navegação principal">
      <div class="site-container site-nav__inner flex items-center justify-between">

        <a href="/" data-link class="flex items-center gap-2 font-display font-bold text-xl sm:text-2xl tracking-tight shrink-0" aria-label="NekoBox — Início">
          <span class="w-8 h-8 rounded-lg bg-[var(--color-brand-600)] flex items-center justify-center">
            ${Icon(icons.gamepad, { className: "w-4.5 h-4.5 text-white", strokeWidth: 2.25 })}
          </span>
          <span class="text-[var(--color-ink)]">Neko<span class="text-[var(--color-brand-400)]">Box</span></span>
        </a>

        <div class="flex items-center gap-0 sm:gap-2">
          ${navIcon("/", "Início", icons.home)}
          ${navIcon("/hub", "Catálogo", icons.search)}
          ${isCustomer ? navIcon(ACCOUNT_PATHS.library, "Minha Biblioteca", icons.library, "hidden sm:flex") : ""}
          ${isAdmin ? navIcon("/admin", "Administração", icons.dashboard, "hidden sm:flex") : ""}
          ${navIcon("/acessibilidade", "Acessibilidade", icons.accessibility, "hidden sm:flex")}

          ${isAuthenticated ? `<details class="lg:hidden relative order-last">
            <summary class="list-none [&::-webkit-details-marker]:hidden flex items-center justify-center w-9 h-9 rounded-lg text-muted hover:text-[var(--color-ink)] hover:bg-[var(--color-surface-2)] transition-colors cursor-pointer" aria-label="Abrir menu de navegação">
              ${Icon(icons.menu)}
            </summary>
            <nav class="absolute right-0 top-full mt-2 w-48 bg-surface rounded-xl shadow-xl py-2 z-50" aria-label="Navegação mobile">
              <a href="/" data-link ${currentPath === "/" ? 'aria-current="page"' : ""} class="block px-4 py-2.5 text-sm text-muted hover:text-[var(--color-ink)] hover:bg-[var(--color-surface-2)] transition-colors">Início</a>
              <a href="/hub" data-link ${currentPath === "/hub" ? 'aria-current="page"' : ""} class="block px-4 py-2.5 text-sm text-muted hover:text-[var(--color-ink)] hover:bg-[var(--color-surface-2)] transition-colors">Catálogo</a>
              <a href="/acessibilidade" data-link ${currentPath === "/acessibilidade" ? 'aria-current="page"' : ""} class="block px-4 py-2.5 text-sm text-muted hover:text-[var(--color-ink)] hover:bg-[var(--color-surface-2)] transition-colors">Acessibilidade</a>
              ${
                isCustomer
                  ? `
                    <a href="${ACCOUNT_PATHS.settings}" data-link ${currentPath === ACCOUNT_PATHS.settings ? 'aria-current="page"' : ""} class="block px-4 py-2.5 text-sm text-muted hover:text-[var(--color-ink)] hover:bg-[var(--color-surface-2)] transition-colors">Configurações</a>
                    <a href="${ACCOUNT_PATHS.library}" data-link ${currentPath === ACCOUNT_PATHS.library ? 'aria-current="page"' : ""} class="block px-4 py-2.5 text-sm text-muted hover:text-[var(--color-ink)] hover:bg-[var(--color-surface-2)] transition-colors">Minha Biblioteca</a>
                    <a href="${ACCOUNT_PATHS.wishlist}" data-link class="block px-4 py-2.5 text-sm text-muted hover:text-[var(--color-ink)] hover:bg-[var(--color-surface-2)] transition-colors">Lista de Desejos${wishlistCount ? ` (${wishlistCount})` : ""}</a>
                    <a href="${ACCOUNT_PATHS.cart}" data-link class="block px-4 py-2.5 text-sm text-muted hover:text-[var(--color-ink)] hover:bg-[var(--color-surface-2)] transition-colors">Carrinho${cartCount ? ` (${cartCount})` : ""}</a>
                    <button type="button" data-wallet-trigger class="w-full text-left px-4 py-2.5 text-sm text-muted hover:text-[var(--color-ink)] hover:bg-[var(--color-surface-2)] transition-colors">Carteira</button>
                    <a href="${ACCOUNT_PATHS.profile}" data-link class="block px-4 py-2.5 text-sm text-muted hover:text-[var(--color-ink)] hover:bg-[var(--color-surface-2)] transition-colors">Meu Perfil</a>
                  `
                  : isAdmin
                    ? '<a href="/admin" data-link class="block px-4 py-2.5 text-sm text-muted hover:text-[var(--color-ink)] hover:bg-[var(--color-surface-2)] transition-colors">Administração</a>'
                    : ""
              }
            </nav>
          </details>` : ""}

          ${
            isCustomer
              ? `
                <a href="${ACCOUNT_PATHS.wishlist}" data-link class="nav-icon-link hidden sm:flex relative" aria-label="Lista de desejos" title="Lista de desejos">
                  ${Icon(icons.heart, { className: "w-5.5 h-5.5 sm:w-6 sm:h-6" })}
                  ${wishlistCount > 0 ? `<span class="absolute -top-1.5 -right-1.5 bg-[var(--color-accent-400)] text-[var(--color-bg)] text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">${wishlistCount}</span>` : ""}
                </a>
                <a href="${ACCOUNT_PATHS.cart}" data-link class="nav-icon-link hidden sm:flex relative" aria-label="Carrinho de compras" title="Carrinho de compras">
                  ${Icon(icons.shoppingCart, { className: "w-5.5 h-5.5 sm:w-6 sm:h-6" })}
                  ${cartCount > 0 ? `<span class="absolute -top-1.5 -right-1.5 bg-[var(--color-brand-500)] text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">${cartCount}</span>` : ""}
                </a>
              `
              : ""
          }

          ${
            isCustomer
              ? `<button type="button" data-wallet-trigger class="nav-icon-link hidden sm:flex" aria-haspopup="dialog" aria-controls="wallet-dialog" aria-label="Abrir carteira">
                  ${Icon(icons.wallet, { className: "w-5.5 h-5.5 sm:w-6 sm:h-6" })}
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
                    ${Icon(icons.logIn, { className: "w-5.5 h-5.5 sm:w-6 sm:h-6" })}
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
