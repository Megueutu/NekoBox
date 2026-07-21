import { PrivateLayout } from "../../app/layouts/PrivateLayout";
import { Store } from "../../store/store";
import { Actions } from "../../store/actions";
import { navigate } from "../../app/router/navigate";
import { AuthService } from "../../services/auth/auth.service";
import { EmptyState } from "../../components/ui/EmptyState";
import { PageHeader } from "../../components/ui/PageHeader";
import { getCoverUrl } from "../../utils/media";
import { formatPrice } from "../../utils/format";

export default function CartPage() {
  const { cart } = Store.getState();

  const total = cart.reduce((acc, game) => acc + game.price, 0);

  const content = `
    <div class="space-y-8">
      ${PageHeader({
        title: "Carrinho",
        subtitle: `${cart.length} item${cart.length !== 1 ? "s" : ""} na sacola`,
      })}

      ${
        cart.length === 0
          ? EmptyState({
              icon: "M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z",
              title: "Seu carrinho está vazio",
              description: "Adicione jogos ao carrinho para continuar.",
              ctaHref: "/hub",
              ctaLabel: "Explorar Catálogo",
            })
          : `
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">

          <!-- Lista de Itens -->
          <div class="lg:col-span-2 space-y-4">
            ${cart
              .map(
                (game) => `
              <div class="panel p-3 sm:p-5 flex items-center gap-3 sm:gap-5">
                <!-- Capa Compacta -->
                <a href="/game/${game.slug}" data-link class="shrink-0">
                  <div class="w-14 h-20 bg-cover bg-center bg-no-repeat rounded-lg bg-[var(--color-surface-2)]"
                       role="img" aria-label="Capa do jogo ${game.title}"
                       style="background-image: url('${getCoverUrl(game)}')"></div>
                </a>
                <!-- Infos -->
                <div class="flex-1 min-w-0">
                  <a href="/game/${game.slug}" data-link class="font-semibold text-sm hover:text-[var(--color-brand-400)] truncate block transition-colors">${game.title}</a>
                  <p class="text-xs text-[var(--color-muted-2)] mt-1">${game.categories?.[0] || ""} • ${game.publisher?.name || ""}</p>
                  <p class="font-bold text-sm mt-1.5 text-[var(--color-accent-400)]">${formatPrice(game.price)}</p>
                </div>
                <!-- Remover -->
                <button data-remove-cart="${game.id}"
                        class="shrink-0 text-[var(--color-muted-2)] hover:text-red-400 transition-colors p-1" aria-label="Remover ${game.title}">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                  </svg>
                </button>
              </div>
            `
              )
              .join("")}
          </div>

          <!-- Resumo do Pedido -->
          <div class="lg:col-span-1">
            <div class="panel p-4 sm:p-6 lg:sticky lg:top-24 space-y-5">
              <h2 class="font-display font-semibold text-base border-b border-[var(--color-border)] pb-4">Resumo do Pedido</h2>

              <div class="space-y-2.5">
                ${cart
                  .map(
                    (game) => `
                  <div class="flex justify-between text-sm">
                    <span class="text-muted truncate pr-2">${game.title}</span>
                    <span class="shrink-0 font-medium">${formatPrice(game.price)}</span>
                  </div>
                `
                  )
                  .join("")}
              </div>

              <div class="border-t border-[var(--color-border)] pt-4 flex justify-between items-center">
                <span class="font-bold">Total</span>
                <span class="font-display font-bold text-xl text-gradient-brand">${formatPrice(total)}</span>
              </div>

              <button id="btn-checkout"
                      class="w-full py-3 bg-gradient-to-r from-[var(--color-brand-500)] to-[var(--color-brand-700)] text-white font-bold rounded-lg hover:brightness-110 transition-all text-sm glow-brand">
                Simular Compra
              </button>
              <p class="text-[var(--color-muted-2)] text-xs text-center">Ambiente de demonstração: nenhum pagamento será processado.</p>

              <a href="/hub" data-link class="block text-center text-[var(--color-muted-2)] text-xs hover:text-[var(--color-ink)] transition-colors">
                Continuar Comprando
              </a>
            </div>
          </div>
        </div>
      `
      }
    </div>
  `;

  return PrivateLayout(content);
}

export async function afterRender() {
  document.querySelectorAll("[data-remove-cart]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const gameId = btn.getAttribute("data-remove-cart");
      Actions.removerDoCarrinho(gameId);
      navigate("/cart");
    });
  });

  document.getElementById("btn-checkout")?.addEventListener("click", () => {
    Actions.finalizarCheckoutCarrinho();
    navigate("/library");
  });

  document.getElementById("btn-sidebar-logout")?.addEventListener("click", async () => {
    await AuthService.logout();
    navigate("/hub");
  });
}
