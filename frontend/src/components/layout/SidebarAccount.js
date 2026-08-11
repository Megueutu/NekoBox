import { Store } from "../../store/store";
import { ACCOUNT_PATHS } from "../../app/router/account-routes";
import { Icon, icons } from "../ui/Icon";
import { AuthService } from "../../services/auth.service";
import { navigate } from "../../app/router/navigate";

export function bindSidebarLogout() {
  document.getElementById("btn-sidebar-logout")?.addEventListener("click", async () => {
    await AuthService.logout();
    navigate("/hub");
  });
}

export function SidebarAccount() {
  const { user } = Store.getState();
  const currentPath = window.location.pathname;

  const navItem = (href, label, icon) => {
    const isActive = currentPath === href;
    return `
      <a href="${href}" data-link ${isActive ? 'aria-current="page"' : ""}
         class="account-nav__link ${isActive ? "button-primary account-nav__link--active" : "button-secondary"}">
        ${icon}
        <span>${label}</span>
      </a>
    `;
  };

  return `
    <aside class="account-sidebar-panel">

      <nav class="account-nav" aria-label="Área da conta">
        ${navItem(ACCOUNT_PATHS.profile, "Meu Perfil", Icon(icons.user, { className: "w-4 h-4 shrink-0" }))}
        ${navItem(ACCOUNT_PATHS.games, "Meus Jogos", Icon(icons.gamepad, { className: "w-4 h-4 shrink-0" }))}
        ${navItem(ACCOUNT_PATHS.library, "Minha Biblioteca", Icon(icons.library, { className: "w-4 h-4 shrink-0" }))}
        ${navItem(ACCOUNT_PATHS.wishlist, "Lista de Desejos", Icon(icons.heart, { className: "w-4 h-4 shrink-0" }))}
        ${navItem(ACCOUNT_PATHS.cart, "Carrinho", Icon(icons.shoppingCart, { className: "w-4 h-4 shrink-0" }))}
        ${user?.role === "ADMIN" ? navItem("/admin", "Administração", Icon(icons.shieldCheck, { className: "w-4 h-4 shrink-0" })) : ""}
      </nav>
      <button id="btn-sidebar-logout" class="account-nav__link account-nav__logout button-secondary" type="button">
        ${Icon(icons.logOut, { className: "w-4 h-4 shrink-0" })}
        <span>Sair da Conta</span>
      </button>

    </aside>
  `;
}
