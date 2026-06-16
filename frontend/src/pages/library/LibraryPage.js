import { PrivateLayout } from "../../app/layouts/PrivateLayout";
import { Store } from "../../store/store";
import { navigate } from "../../app/router/navigate";
import { AuthService } from "../../services/auth/auth.service";

function getCoverUrl(game) {
  const cover = game.media?.find((m) => m.type === "cover");
  return cover?.url || "https://picsum.photos/seed/default/400/600";
}

export default function LibraryPage() {
  const { library } = Store.getState();

  const content = `
    <div class="space-y-6">
      <div>
        <h1 class="text-2xl font-black">Minha Biblioteca</h1>
        <p class="text-zinc-500 text-sm mt-1">
          ${library.length > 0
            ? `${library.length} jogo${library.length !== 1 ? "s" : ""} adquirido${library.length !== 1 ? "s" : ""}`
            : "Sua coleção pessoal de jogos digitais."
          }
        </p>
      </div>

      ${
        library.length === 0
          ? `
        <div class="bg-white border border-zinc-200 rounded-lg p-12 text-center">
          <svg class="w-12 h-12 text-zinc-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z"/>
          </svg>
          <p class="text-zinc-500 text-lg font-semibold mb-2">Sua biblioteca está vazia</p>
          <p class="text-zinc-400 text-sm mb-6">Compre jogos no catálogo para adicioná-los aqui.</p>
          <a href="/hub" data-link class="px-5 py-2.5 bg-zinc-900 text-white font-bold text-sm rounded hover:bg-zinc-700 transition-colors">
            Ir ao Catálogo
          </a>
        </div>
      `
          : `
        <div class="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
          ${library
            .map(
              (game) => `
            <div class="bg-white border border-zinc-200 rounded-lg overflow-hidden">
              <!-- Capa -->
              <a href="/game/${game.slug}" data-link class="block">
                <div class="w-full aspect-[2/3] bg-cover bg-center bg-no-repeat bg-zinc-200"
                     style="background-image: url('${getCoverUrl(game)}')"></div>
              </a>
              <!-- Info -->
              <div class="p-3 space-y-2">
                <p class="font-semibold text-sm truncate">${game.title}</p>
                <p class="text-xs text-zinc-400">${game.categories?.[0] || ""}</p>
                <button data-play="${game.slug}"
                        class="w-full py-2 bg-zinc-900 text-white text-xs font-bold rounded hover:bg-zinc-700 transition-colors">
                  ▶ Jogar Agora
                </button>
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
  // Botão "Jogar Agora" — navega para a página do jogo (simulação)
  document.querySelectorAll("[data-play]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const slug = btn.getAttribute("data-play");
      navigate(`/game/${slug}`);
    });
  });

  // Logout da sidebar
  document.getElementById("btn-sidebar-logout")?.addEventListener("click", async () => {
    await AuthService.logout();
    navigate("/hub");
  });
}
