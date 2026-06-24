import { PublicLayout } from "../../app/layouts/PublicLayout";
import { GamesService } from "../../services/games/games.service";
import { Store } from "../../store/store";
import { Actions } from "../../store/actions";
import { navigate } from "../../app/router/navigate";

function formatPrice(price) {
  return price.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString("pt-BR", {
    day: "2-digit", month: "long", year: "numeric",
  });
}

export default async function GamePage({ slug }) {
  const game = await GamesService.getBySlug(slug);

  if (!game) {
    return PublicLayout(`
      <div class="max-w-7xl mx-auto px-4 py-24 text-center">
        <h1 class="text-4xl font-black mb-4">Jogo não encontrado</h1>
        <p class="text-zinc-500 mb-6">Este título não existe ou foi removido do catálogo.</p>
        <a href="/hub" data-link class="px-6 py-3 bg-zinc-900 text-white font-bold rounded hover:bg-zinc-700 transition-colors">
          Voltar ao Catálogo
        </a>
      </div>
    `);
  }

  const banner = game.media?.find((m) => m.type === "banner");
  const cover = game.media?.find((m) => m.type === "cover");
  const screenshots = game.media?.filter((m) => m.type === "screenshot") || [];
  const minReq = game.system_requirements?.find((r) => r.type === "minimum");
  const recReq = game.system_requirements?.find((r) => r.type === "recommended");

  const { cart, wishlist, library } = Store.getState();
  const inLibrary = library.some((g) => g.id === game.id);
  const inCart = cart.some((g) => g.id === game.id);
  const inWishlist = wishlist.some((g) => g.id === game.id);

  const buyButton = inLibrary
    ? `<button disabled class="w-full py-3 bg-zinc-200 text-zinc-500 font-bold rounded cursor-not-allowed text-sm">
         Disponível na sua Biblioteca
       </button>`
    : inCart
    ? `<a href="/cart" data-link class="block w-full py-3 bg-zinc-700 text-white font-bold rounded text-center text-sm hover:bg-zinc-600 transition-colors">
         Item no Carrinho — Ver Sacola
       </a>`
    : `<button id="btn-add-cart" class="w-full py-3 bg-zinc-900 text-white font-bold rounded hover:bg-zinc-700 transition-colors text-sm">
         Adicionar ao Carrinho
       </button>`;

  const wishlistButton = inWishlist
    ? `<button id="btn-wishlist" class="w-full py-2.5 border-2 border-red-400 text-red-500 font-semibold rounded hover:bg-red-50 transition-colors text-sm">
         ♥ Na Lista de Desejos
       </button>`
    : `<button id="btn-wishlist" class="w-full py-2.5 border-2 border-zinc-300 text-zinc-600 font-semibold rounded hover:border-zinc-500 transition-colors text-sm">
         ♡ Adicionar à Lista de Desejos
       </button>`;

  const reqRow = (label, val) =>
    val
      ? `<div class="flex gap-2 text-xs"><span class="text-zinc-400 shrink-0 w-20">${label}</span><span class="text-zinc-700">${val}</span></div>`
      : "";

  const content = `
    <!-- Banner Hero -->
    <div class="w-full h-[260px] md:h-[420px] bg-cover bg-center bg-no-repeat relative"
         style="background-image: url('${banner?.url || cover?.url || "https://picsum.photos/seed/gamebanner/1920/1080"}')">
      <div class="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent flex items-end px-6 md:px-10 pb-8">
        <div>
          <p class="text-zinc-400 text-xs uppercase tracking-widest mb-1 text-white">${game.publisher?.name || ""}</p>
          <h1 class="text-white text-3xl md:text-5xl font-black leading-tight mb-2">${game.title}</h1>
          <div class="flex flex-wrap gap-2 items-center">
            ${game.categories.map((c) => `<span class="px-2 py-0.5 bg-white/20 text-white text-xs rounded">${c}</span>`).join("")}
            <span class="text-zinc-300 text-xs ml-1">${formatDate(game.release_date)}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Corpo Principal -->
    <div class="max-w-7xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-3 gap-8">

      <!-- Coluna Principal (Detalhes + Mídias) -->
      <div class="lg:col-span-2 space-y-8">

        <!-- Descrição -->
        <section>
          <h2 class="font-bold text-lg mb-3 border-b border-zinc-200 pb-2">Sobre o Jogo</h2>
          <p class="text-zinc-600 text-sm leading-relaxed">${game.long_description}</p>
        </section>

        <!-- Tags -->
        ${
          game.tags?.length
            ? `<section>
                <div class="flex flex-wrap gap-2">
                  ${game.tags.map((t) => `<span class="px-2.5 py-1 bg-zinc-100 text-zinc-600 text-xs rounded border border-zinc-200">${t}</span>`).join("")}
                </div>
               </section>`
            : ""
        }

        <!-- Screenshots -->
        ${
          screenshots.length
            ? `
          <section>
            <h2 class="font-bold text-lg mb-3 border-b border-zinc-200 pb-2">Capturas de Tela</h2>
            <div class="grid grid-cols-2 sm:grid-cols-3 gap-3">
              ${screenshots
                .map(
                  (s) => `
                <div class="w-full aspect-video bg-cover bg-center bg-no-repeat rounded bg-zinc-200"
                     style="background-image: url('${s.url}')"></div>
              `
                )
                .join("")}
            </div>
          </section>
        `
            : ""
        }

        <!-- Requisitos de Sistema -->
        ${
          (minReq || recReq)
            ? `
          <section>
            <h2 class="font-bold text-lg mb-3 border-b border-zinc-200 pb-2">Requisitos de Sistema</h2>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              ${
                minReq
                  ? `
                <div class="bg-zinc-50 rounded p-4 border border-zinc-200">
                  <p class="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-3">Mínimo</p>
                  <div class="space-y-1.5">
                    ${reqRow("SO", minReq.os)}
                    ${reqRow("CPU", minReq.cpu)}
                    ${reqRow("RAM", minReq.ram)}
                    ${reqRow("GPU", minReq.gpu)}
                    ${reqRow("Armazenamento", minReq.storage)}
                  </div>
                </div>
              `
                  : ""
              }
              ${
                recReq
                  ? `
                <div class="bg-zinc-50 rounded p-4 border border-zinc-200">
                  <p class="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-3">Recomendado</p>
                  <div class="space-y-1.5">
                    ${reqRow("SO", recReq.os)}
                    ${reqRow("CPU", recReq.cpu)}
                    ${reqRow("RAM", recReq.ram)}
                    ${reqRow("GPU", recReq.gpu)}
                    ${reqRow("Armazenamento", recReq.storage)}
                  </div>
                </div>
              `
                  : ""
              }
            </div>
          </section>
        `
            : ""
        }

        <!-- Idiomas -->
        ${
          game.languages?.length
            ? `
          <section>
            <h2 class="font-bold text-lg mb-3 border-b border-zinc-200 pb-2">Idiomas Suportados</h2>
            <div class="overflow-x-auto">
              <table class="w-full text-sm">
                <thead>
                  <tr class="text-left border-b border-zinc-200">
                    <th class="pb-2 font-semibold text-zinc-600 pr-4">Idioma</th>
                    <th class="pb-2 font-semibold text-zinc-600 text-center">Interface</th>
                    <th class="pb-2 font-semibold text-zinc-600 text-center">Legendas</th>
                    <th class="pb-2 font-semibold text-zinc-600 text-center">Áudio</th>
                  </tr>
                </thead>
                <tbody>
                  ${game.languages
                    .map(
                      (lang) => `
                    <tr class="border-b border-zinc-100">
                      <td class="py-2 pr-4 text-zinc-700">${lang.name}</td>
                      <td class="py-2 text-center">${lang.interface ? "✓" : "–"}</td>
                      <td class="py-2 text-center">${lang.subtitles ? "✓" : "–"}</td>
                      <td class="py-2 text-center">${lang.audio ? "✓" : "–"}</td>
                    </tr>
                  `
                    )
                    .join("")}
                </tbody>
              </table>
            </div>
          </section>
        `
            : ""
        }

        <!-- Atualizações -->
        ${
          game.updates?.length
            ? `
          <section>
            <h2 class="font-bold text-lg mb-3 border-b border-zinc-200 pb-2">Histórico de Atualizações</h2>
            <div class="space-y-3">
              ${game.updates
                .map(
                  (u) => `
                <div class="bg-zinc-50 rounded p-4 border border-zinc-200">
                  <div class="flex items-center gap-2 mb-1">
                    <span class="text-xs font-bold bg-zinc-200 px-2 py-0.5 rounded">${u.version}</span>
                    <span class="font-semibold text-sm">${u.title}</span>
                    <span class="text-zinc-400 text-xs ml-auto">${formatDate(u.created_at)}</span>
                  </div>
                  <p class="text-zinc-600 text-xs leading-relaxed">${u.content}</p>
                </div>
              `
                )
                .join("")}
            </div>
          </section>
        `
            : ""
        }

        <!-- Reviews -->
        ${
          game.reviews?.length
            ? `
          <section>
            <h2 class="font-bold text-lg mb-3 border-b border-zinc-200 pb-2">
              Avaliações
              <span class="text-sm font-normal text-zinc-400 ml-2">(${game.reviews.length})</span>
            </h2>
            <div class="space-y-3">
              ${game.reviews
                .map(
                  (r) => `
                <div class="bg-zinc-50 rounded p-4 border border-zinc-200">
                  <div class="flex items-center gap-2 mb-2">
                    <span class="text-xs font-bold px-2 py-0.5 rounded ${r.recommended ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"}">
                      ${r.recommended ? "✓ Recomenda" : "✗ Não Recomenda"}
                    </span>
                    <span class="font-semibold text-sm">${r.username}</span>
                    <span class="text-zinc-400 text-xs ml-auto">${formatDate(r.created_at)}</span>
                  </div>
                  <p class="text-zinc-600 text-sm leading-relaxed">${r.review_text}</p>
                  <p class="text-zinc-400 text-xs mt-2">${r.votes} pessoas acharam útil</p>
                </div>
              `
                )
                .join("")}
            </div>
          </section>
        `
            : ""
        }

      </div>

      <!-- Coluna Lateral: Checkout -->
      <div class="lg:col-span-1">
        <div class="bg-white border border-zinc-200 rounded-lg p-5 sticky top-20 space-y-4">

          <!-- Capa pequena -->
          <div class="w-full aspect-[2/3] bg-cover bg-center bg-no-repeat rounded bg-zinc-200"
               style="background-image: url('${cover?.url || "https://picsum.photos/seed/default/400/600"}')"></div>

          <!-- Preço -->
          <div>
            <p class="text-xs text-zinc-400 uppercase tracking-widest">Preço</p>
            <p class="text-3xl font-black mt-1">${formatPrice(game.price)}</p>
          </div>

          <!-- Botões de Ação -->
          <div class="space-y-2">
            ${buyButton}
            ${!inLibrary ? wishlistButton : ""}
          </div>

          <!-- Publisher -->
          ${
            game.publisher?.name
              ? `<p class="text-xs text-zinc-400 text-center border-t border-zinc-100 pt-3">
                   Publicado por <strong>${game.publisher.name}</strong>
                 </p>`
              : ""
          }

        </div>
      </div>

    </div>
  `;

  return PublicLayout(content);
}

export async function afterRender({ slug }) {
  const game = await GamesService.getBySlug(slug);
  if (!game) return;

  // Adicionar ao Carrinho
  document.getElementById("btn-add-cart")?.addEventListener("click", () => {
    Actions.adicionarAoCarrinho(game);
    navigate("/cart");
  });

  // Alternar Lista de Desejos
  document.getElementById("btn-wishlist")?.addEventListener("click", () => {
    Actions.alternarListaDesejos(game);
    navigate(`/game/${slug}`);
  });
}
