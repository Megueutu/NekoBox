import { Store } from "../../store/store";

export function Navbar() {
  const { cart, wishlist, user } = Store.getState();
  const cartCount = cart.length;
  const wishlistCount = wishlist.length;

  return `
    <nav class="bg-zinc-900 border-b border-zinc-800 sticky top-0 z-50">
      <div class="max-w-7xl mx-auto px-4 flex items-center justify-between h-16">

        <!-- Logo -->
        <a href="/hub" data-link class="flex items-center gap-2 text-white font-black text-xl tracking-tight">
          <svg class="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 24 24">
            <path d="M21 6H3a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h18a1 1 0 0 0 1-1V7a1 1 0 0 0-1-1zm-10 9H8v-2H6v-2h2V9h2v2h2v2h-1v1zm4.5 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm3-3a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3z"/>
          </svg>
          <span class="text-white">GameStore</span>
        </a>

        <!-- Links de Navegação (Desktop) -->
        <div class="hidden md:flex items-center gap-6">
          <a href="/hub" data-link class="text-zinc-300 hover:text-white text-sm font-medium transition-colors">Catálogo</a>
        </div>

        <!-- Ações Direita -->
        <div class="flex items-center gap-4">

          <!-- Wishlist -->
          <a href="/wishlist" data-link class="relative text-zinc-300 hover:text-white transition-colors" aria-label="Lista de desejos">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
            </svg>
            ${
              wishlistCount > 0
                ? `<span class="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">${wishlistCount}</span>`
                : ""
            }
          </a>

          <!-- Carrinho -->
          <a href="/cart" data-link class="relative text-zinc-300 hover:text-white transition-colors" aria-label="Carrinho de compras">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"/>
            </svg>
            ${
              cartCount > 0
                ? `<span class="absolute -top-1.5 -right-1.5 bg-blue-500 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">${cartCount}</span>`
                : ""
            }
          </a>

          <!-- Usuário Logado ou Botão de Login -->
          ${
            user
              ? `
            <a href="/profile" data-link class="flex items-center gap-2" aria-label="Meu perfil">
              <div class="w-8 h-8 rounded-full bg-cover bg-center bg-zinc-600 border-2 border-zinc-600 hover:border-zinc-400 transition-colors"
                   style="background-image: url('${user.avatar_url}')"></div>
            </a>
          `
              : `
            <a href="/login" data-link class="px-4 py-1.5 bg-white text-zinc-900 text-sm font-bold rounded hover:bg-zinc-200 transition-colors">
              Entrar
            </a>
          `
          }
        </div>

      </div>
    </nav>
  `;
}
