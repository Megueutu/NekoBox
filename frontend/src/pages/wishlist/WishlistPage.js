import { PrivateLayout } from "../../app/layouts/PrivateLayout";
import { Store } from "../../store/store";
import { Actions } from "../../store/actions";
import { navigate } from "../../app/router/navigate";
import { AuthService } from "../../services/auth/auth.service";
import { GameCard } from "../../components/ui/GameCard";
import { EmptyState } from "../../components/ui/EmptyState";
import { PageHeader } from "../../components/ui/PageHeader";

export default function WishlistPage() {
  const { wishlist } = Store.getState();

  const content = `
    <div class="space-y-8">
      ${PageHeader({
        title: "Lista de Desejos",
        subtitle: `${wishlist.length} item${wishlist.length !== 1 ? "s" : ""} salvo${wishlist.length !== 1 ? "s" : ""}`,
      })}

      ${
        wishlist.length === 0
          ? EmptyState({
              icon: "M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z",
              title: "Sua lista de desejos está vazia",
              description: "Explore o catálogo e salve os jogos que te interessam.",
              ctaHref: "/hub",
              ctaLabel: "Explorar Catálogo",
            })
          : `
        <div class="account-grid">
          ${wishlist.map((game) => GameCard(game, { variant: "wishlist" })).join("")}
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
