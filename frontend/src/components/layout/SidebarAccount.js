import { Store } from "../../store/store";

export function SidebarAccount() {
  const { user } = Store.getState();
  const currentPath = window.location.pathname;

  const navItem = (href, label, icon) => {
    const isActive = currentPath === href;
    return `
      <a href="${href}" data-link
         class="flex items-center gap-3 px-3 py-2.5 rounded text-sm font-medium transition-colors
                ${isActive ? "bg-zinc-700 text-white" : "text-zinc-300 hover:bg-zinc-700 hover:text-white"}">
        ${icon}
        ${label}
      </a>
    `;
  };

  return `
    <aside class="bg-zinc-900 rounded-lg p-4 border border-zinc-800 h-fit">

      <!-- Avatar e Info do Usuário -->
      <div class="flex flex-col items-center text-center pb-4 mb-4 border-b border-zinc-800">
        <div class="w-16 h-16 rounded-full bg-cover bg-center bg-zinc-700 mb-3 border-2 border-zinc-600"
             style="background-image: url('${user?.avatar_url || "https://picsum.photos/seed/defaultavatar/150/150"}')"></div>
        <p class="text-white font-semibold text-sm">${user?.username || "Usuário"}</p>
        <p class="text-zinc-400 text-xs mt-0.5 truncate max-w-full">${user?.email || ""}</p>
      </div>

      <!-- Links de Navegação -->
      <nav class="flex flex-col gap-1">
        ${navItem("/profile", "Meu Perfil", `
          <svg class="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
          </svg>
        `)}
        ${navItem("/library", "Minha Biblioteca", `
          <svg class="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z"/>
          </svg>
        `)}
        ${navItem("/wishlist", "Lista de Desejos", `
          <svg class="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
          </svg>
        `)}
        ${navItem("/cart", "Carrinho", `
          <svg class="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"/>
          </svg>
        `)}

        <!-- Botão de Logout -->
        <button id="btn-sidebar-logout"
                class="flex items-center gap-3 px-3 py-2.5 rounded text-sm font-medium text-red-400 hover:bg-zinc-700 hover:text-red-300 transition-colors w-full mt-2 border-t border-zinc-800 pt-3">
          <svg class="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
          </svg>
          Sair da Conta
        </button>
      </nav>

    </aside>
  `;
}
