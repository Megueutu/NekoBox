import { Store } from "../../store/store";
import { Icon, icons } from "../ui/Icon";

export function SidebarAccount() {
  const { user } = Store.getState();
  const currentPath = window.location.pathname;

  const navItem = (href, label, icon) => {
    const isActive = currentPath === href;
    return `
      <a href="${href}" data-link
         class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors
                ${isActive ? "bg-[var(--color-surface-3)] text-white" : "text-muted hover:bg-[var(--color-surface-2)] hover:text-[var(--color-ink)]"}">
        ${icon}
        ${label}
      </a>
    `;
  };

  return `
    <aside class="bg-surface rounded-xl p-5 h-fit">

      <!-- Avatar e Info do Usuário -->
      <div class="flex flex-col items-center text-center pb-5 mb-5 border-b border-[var(--color-border)]">
        <div class="w-16 h-16 rounded-full bg-cover bg-center bg-[var(--color-surface-3)] mb-3 border-2 border-transparent bg-origin-border p-0.5"
             role="img" aria-label="Avatar de ${user?.username || "usuário"}"
             style="background-image: url('${user?.avatar_url || "https://picsum.photos/seed/defaultavatar/150/150"}'); box-shadow: 0 0 0 2px var(--color-brand-500), 0 0 18px -2px rgba(147,51,234,0.65);"></div>
        <p class="text-[var(--color-ink)] font-semibold text-sm mt-1">${user?.username || "Usuário"}</p>
        <p class="text-[var(--color-muted-2)] text-xs mt-1 truncate max-w-full">${user?.email || ""}</p>
      </div>

      <!-- Links de Navegação -->
      <nav class="flex flex-col gap-1.5">
        ${navItem("/profile", "Meu Perfil", Icon(icons.user, { className: "w-4 h-4 shrink-0" }))}
        ${navItem("/library", "Minha Biblioteca", Icon(icons.library, { className: "w-4 h-4 shrink-0" }))}
        ${navItem("/wishlist", "Lista de Desejos", Icon(icons.heart, { className: "w-4 h-4 shrink-0" }))}
        ${navItem("/cart", "Carrinho", Icon(icons.shoppingCart, { className: "w-4 h-4 shrink-0" }))}
        ${navItem("/configuracoes", "Configurações", Icon(icons.settings, { className: "w-4 h-4 shrink-0" }))}

        <!-- Botão de Logout -->
        <button id="btn-sidebar-logout"
                class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-400 hover:bg-[var(--color-surface-2)] hover:text-red-300 transition-colors w-full mt-2 border-t border-[var(--color-border)] pt-3">
          ${Icon(icons.logOut, { className: "w-4 h-4 shrink-0" })}
          Sair da Conta
        </button>
      </nav>

    </aside>
  `;
}
