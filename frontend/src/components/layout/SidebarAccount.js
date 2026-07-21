import { Store } from "../../store/store";

export function SidebarAccount() {
  const { user } = Store.getState();
  const currentPath = window.location.pathname;

  const navItem = (href, label, icon) => {
    const isActive = currentPath === href;
    return `
      <a href="${href}" data-link
         class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors
                ${isActive ? "bg-gradient-to-r from-[var(--color-brand-600)]/40 to-[var(--color-brand-500)]/10 text-white border border-[var(--color-brand-500)]/40" : "text-muted hover:bg-[var(--color-surface-2)] hover:text-[var(--color-ink)] border border-transparent"}">
        ${icon}
        ${label}
      </a>
    `;
  };

  return `
    <aside class="bg-surface rounded-xl p-5 border border-[var(--color-border)] h-fit">

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
                class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-400 hover:bg-[var(--color-surface-2)] hover:text-red-300 transition-colors w-full mt-2 border-t border-[var(--color-border)] pt-3">
          <svg class="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
          </svg>
          Sair da Conta
        </button>
      </nav>

    </aside>
  `;
}
