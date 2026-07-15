import { PrivateLayout } from "../../app/layouts/PrivateLayout";
import { Store } from "../../store/store";
import { Actions } from "../../store/actions";
import { navigate } from "../../app/router/navigate";
import { AuthService } from "../../services/auth/auth.service";

function getCoverUrl(game) {
  const cover = game.media?.find((m) => m.type === "cover");
  return cover?.url || "https://picsum.photos/seed/default/400/600";
}

function formatPrice(price) {
  return price.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export default function WishlistPage() {
  const { wishlist } = Store.getState();

  const content = `
    <div class="space-y-6">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="font-display text-2xl font-bold">Lista de Desejos</h1>
          <p class="text-[var(--color-muted)] text-sm mt-1">${wishlist.length} item${wishlist.length !== 1 ? "s" : ""} salvo${wishlist.length !== 1 ? "s" : ""}</p>
        </div>
      </div>

      ${
        wishlist.length === 0
          ? `
        <div class="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-12 text-center">
          <svg class="w-12 h-12 text-[var(--color-muted-2)] mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
          </svg>
          <p class="text-[var(--color-ink)] text-lg font-semibold mb-2">Sua lista de desejos está vazia</p>
          <p class="text-[var(--color-muted-2)] text-sm mb-6">Explore o catálogo e salve os jogos que te interessam.</p>
          <a href="/hub" data-link class="px-5 py-2.5 bg-gradient-to-r from-[var(--color-brand-500)] to-[var(--color-brand-700)] text-white font-bold text-sm rounded-lg hover:brightness-110 transition-all glow-brand inline-block">
            Explorar Catálogo
          </a>
        </div>
      `
          : `
        <div class="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
          ${wishlist
            .map(
              (game) => `
            <div class="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl overflow-hidden card-hover-glow group">
              <!-- Capa -->
              <a href="/game/${game.slug}" data-link class="block">
                <div class="w-full aspect-[2/3] bg-cover bg-center bg-no-repeat bg-[var(--color-surface-2)]"
                     style="background-image: url('${getCoverUrl(game)}')"></div>
              </a>
              <!-- Info -->
              <div class="p-3 space-y-2">
                <p class="font-semibold text-sm truncate">${game.title}</p>
                <p class="font-bold text-sm text-[var(--color-accent-400)]">${formatPrice(game.price)}</p>
                <div class="flex gap-2">
                  <button data-add-cart="${game.id}"
                          class="flex-1 py-1.5 bg-gradient-to-r from-[var(--color-brand-500)] to-[var(--color-brand-700)] text-white text-xs font-bold rounded-lg hover:brightness-110 transition-all">
                    + Carrinho
                  </button>
                  <button data-remove-wishlist="${game.id}"
                          class="px-2.5 py-1.5 border border-red-400/50 text-red-400 text-xs rounded-lg hover:bg-red-500/10 transition-colors">
                    ✕
                  </button>
                </div>
              </div>
            </div>
          `
            )
            .join("")}
        </div>
      `
      }
    </div>
  `;

  return PrivateLayout(content);
}

export async function afterRender() {
  // Remover item da wishlist
  document.querySelectorAll("[data-remove-wishlist]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const gameId = btn.getAttribute("data-remove-wishlist");
      const { wishlist } = Store.getState();
      const game = wishlist.find((g) => g.id === gameId);
      if (game) {
        Actions.alternarListaDesejos(game);
        navigate("/wishlist");
      }
    });
  });

  // Adicionar ao carrinho a partir da wishlist
  document.querySelectorAll("[data-add-cart]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const gameId = btn.getAttribute("data-add-cart");
      const { wishlist } = Store.getState();
      const game = wishlist.find((g) => g.id === gameId);
      if (game) {
        Actions.adicionarAoCarrinho(game);
        navigate("/cart");
      }
    });
  });

  // Logout da sidebar
  document.getElementById("btn-sidebar-logout")?.addEventListener("click", async () => {
    await AuthService.logout();
    navigate("/hub");
  });
}
