import { PrivateLayout } from "../../app/layouts/PrivateLayout";
import { Store } from "../../store/store";
import { navigate } from "../../app/router/navigate";
import { AuthService } from "../../services/auth/auth.service";
import { GameCard } from "../../components/ui/GameCard";
import { EmptyState } from "../../components/ui/EmptyState";
import { PageHeader } from "../../components/ui/PageHeader";
import { icons } from "../../components/ui/Icon";
import { AccountService } from "../../services/account/account.service";

export default async function LibraryPage() {
  const library = await AccountService.getLibrary();
  Store.setState((state) => ({ ...state, library }));

  const content = `
    <div class="space-y-6">
      ${PageHeader({
        title: "Minha Biblioteca",
        subtitle:
          library.length > 0
            ? `${library.length} jogo${library.length !== 1 ? "s" : ""} adquirido${library.length !== 1 ? "s" : ""}`
            : "Sua coleção pessoal de jogos digitais.",
      })}

      ${
        library.length === 0
          ? EmptyState({
              icon: icons.library,
              title: "Sua biblioteca está vazia",
              description: "Compre jogos no catálogo para adicioná-los aqui.",
              ctaHref: "/hub",
              ctaLabel: "Ir ao Catálogo",
            })
          : `
        <div class="account-grid">
          ${library.map((game) => GameCard(game, { variant: "library" })).join("")}
        </div>
      `
      }
    </div>
  `;

  return PrivateLayout(content);
}

export async function afterRender() {
  document.querySelectorAll("[data-play]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const slug = btn.getAttribute("data-play");
      navigate(`/game/${slug}`);
    });
  });

  document.getElementById("btn-sidebar-logout")?.addEventListener("click", async () => {
    await AuthService.logout();
    navigate("/hub");
  });
}
