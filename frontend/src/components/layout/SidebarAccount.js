import { Store } from "../../store/store";
import { ACCOUNT_PATHS } from "../../app/router/account-routes";
import { Icon, icons } from "../ui/Icon";

export function SidebarAccount() {
  const { user } = Store.getState();
  const currentPath = window.location.pathname;

  const navItem = (href, label, icon) => {
    const isActive = currentPath === href;
    return `
      <a href="${href}" data-link ${isActive ? 'aria-current="page"' : ""}
         class="account-nav__link${isActive ? " account-nav__link--active" : ""}">
        ${icon}
        <span>${label}</span>
      </a>
    `;
  };

  return `
    <aside class="account-sidebar-panel">

      <!-- Avatar e Info do Usuário -->
      <div class="account-sidebar__identity">
        <div class="account-sidebar__avatar"
             role="img" aria-label="Avatar de ${user?.username || "usuário"}"
             style="background-image: url('${user?.avatar_url || "https://picsum.photos/seed/defaultavatar/150/150"}');"></div>
        <div class="account-sidebar__user">
          <span>Conta pessoal</span>
          <p>${user?.username || "Usuário"}</p>
          <small title="${user?.email || ""}">${user?.email || ""}</small>
        </div>
      </div>

      <!-- Links de Navegação -->
      <nav class="account-nav" aria-label="Área da conta">
        ${navItem(ACCOUNT_PATHS.profile, "Meu Perfil", Icon(icons.user, { className: "w-4 h-4 shrink-0" }))}
        ${navItem(ACCOUNT_PATHS.games, "Meus Jogos", Icon(icons.gamepad, { className: "w-4 h-4 shrink-0" }))}
        ${navItem(ACCOUNT_PATHS.gifts, "Presentes", Icon(icons.gift, { className: "w-4 h-4 shrink-0" }))}
        ${navItem(ACCOUNT_PATHS.library, "Minha Biblioteca", Icon(icons.library, { className: "w-4 h-4 shrink-0" }))}
        ${navItem(ACCOUNT_PATHS.wishlist, "Lista de Desejos", Icon(icons.heart, { className: "w-4 h-4 shrink-0" }))}
        ${navItem(ACCOUNT_PATHS.cart, "Carrinho", Icon(icons.shoppingCart, { className: "w-4 h-4 shrink-0" }))}
        ${navItem(ACCOUNT_PATHS.settings, "Configurações", Icon(icons.settings, { className: "w-4 h-4 shrink-0" }))}
        ${user?.role === "ADMIN" ? navItem("/admin", "Administração", Icon(icons.shieldCheck, { className: "w-4 h-4 shrink-0" })) : ""}

        <!-- Botão de Logout -->
        <button id="btn-sidebar-logout" class="account-nav__link account-nav__logout" type="button">
          ${Icon(icons.logOut, { className: "w-4 h-4 shrink-0" })}
          <span>Sair da Conta</span>
        </button>
      </nav>

    </aside>
  `;
}
