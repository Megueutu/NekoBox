import { PublicLayout } from "../../app/layouts/PublicLayout";
import { GamesService } from "../../services/games/games.service";
import { navigate } from "../../app/router/navigate";

const ALL_CATEGORIES = [
  "Todos", "RPG", "Ação", "Aventura", "Mundo Aberto",
  "Ficção Científica", "Fantasia", "Roguelike", "Sandbox",
  "Simulação", "Metroidvania", "Plataforma",
];

let activeCategory = "Todos";
let searchQuery = "";

function getCoverUrl(game) {
  const cover = game.media?.find((m) => m.type === "cover");
  return cover?.url || "https://picsum.photos/seed/default/400/600";
}

function getBannerUrl(game) {
  const banner = game.media?.find((m) => m.type === "banner");
  return banner?.url || "https://picsum.photos/seed/defaultbanner/1920/1080";
}

function formatPrice(price) {
  return price.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function renderGameCard(game) {
  return `
    <article class="bg-surface rounded-xl overflow-hidden border border-[var(--color-border)] card-hover-glow cursor-pointer group"
             data-link href="/game/${game.slug}">
      <div class="w-full aspect-[1/1] bg-cover bg-center bg-no-repeat bg-[var(--color-surface-3)] relative overflow-hidden"
           style="background-image: url('${getCoverUrl(game)}')">
        <div class="absolute inset-0 bg-gradient-to-t from-black/70 via-black/0 to-black/0 opacity-0 group-hover:opacity-100 transition-opacity"></div>
      </div>
      <div class="p-3">
        <p class="font-semibold text-sm leading-tight mb-1 truncate text-[var(--color-ink)]">${game.title}</p>
        <div class="flex items-center justify-between gap-2">
          <span class="text-xs text-[var(--color-brand-400)] font-medium">${game.categories[0] || ""}</span>
          <span class="font-bold text-sm text-[var(--color-accent-400)]">${formatPrice(game.price)}</span>
        </div>
      </div>
    </article>
  `;
}

function renderSkeleton() {
  return Array(8).fill("").map(() => `
    <div class="bg-surface rounded-xl overflow-hidden border border-[var(--color-border)] animate-pulse">
      <div class="w-full aspect-[2/3] bg-[var(--color-surface-2)]"></div>
      <div class="p-3 space-y-2">
        <div class="h-3 bg-[var(--color-surface-2)] rounded w-3/4"></div>
        <div class="h-3 bg-[var(--color-surface-2)] rounded w-1/2"></div>
      </div>
    </div>
  `).join("");
}

export default async function HubPage() {
  const allGames = await GamesService.getAll();
  const heroGame = allGames[0];

  let filteredGames = allGames;
  if (activeCategory !== "Todos") {
    filteredGames = filteredGames.filter((g) =>
      g.categories.includes(activeCategory)
    );
  }
  if (searchQuery.trim()) {
    const q = searchQuery.toLowerCase();
    filteredGames = filteredGames.filter(
      (g) =>
        g.title.toLowerCase().includes(q) ||
        g.short_description.toLowerCase().includes(q) ||
        g.tags.some((t) => t.toLowerCase().includes(q))
    );
  }

  const content = `
    <div class="w-full h-[240px] sm:h-[380px] md:h-[500px] bg-cover bg-center bg-no-repeat relative"
         style="background-image: url('${getBannerUrl(heroGame)}')">
      <div class="absolute inset-0 bg-gradient-to-t from-[var(--color-bg)] via-black/40 to-transparent"></div>
      <div class="absolute inset-0 bg-gradient-to-r from-black/60 via-transparent to-transparent"></div>
      <div class="absolute inset-0 flex items-end p-6 md:p-10">
        <div>
          <p class="text-[var(--color-accent-400)] text-xs font-bold uppercase tracking-[0.2em] mb-2">✦ Destaque da Semana</p>
          <h1 class="font-display text-white text-4xl md:text-6xl font-bold mb-2 leading-tight tracking-tight">${heroGame.title}</h1>
          <p class="text-zinc-300 text-sm md:text-base max-w-xl mb-5 hidden sm:block">${heroGame.short_description}</p>
          <a href="/game/${heroGame.slug}" data-link
             class="inline-block px-6 py-2.5 bg-gradient-to-r from-[var(--color-brand-500)] to-[var(--color-brand-700)] text-white font-bold text-sm rounded-lg hover:brightness-110 transition-all glow-brand">
            Ver Detalhes
          </a>
        </div>
      </div>
    </div>

    <div class="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div class="relative w-full sm:w-80">
          <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-muted-2)]" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
          </svg>
          <input id="search-input" type="text" placeholder="Buscar jogos..."
                 value="${searchQuery}"
                 class="w-full pl-9 pr-3 py-2.5 bg-surface border border-[var(--color-border)] rounded-lg text-sm text-[var(--color-ink)] placeholder:text-[var(--color-muted-2)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-500)] focus:border-transparent transition-all"/>
        </div>
        <p class="text-muted text-sm shrink-0">${filteredGames.length} título${filteredGames.length !== 1 ? "s" : ""}</p>
      </div>

      <!-- Filtros por Categoria -->
      <div class="flex gap-2 flex-wrap mb-8">
        ${ALL_CATEGORIES.map(
          (cat) => `
          <button data-category="${cat}"
                  class="px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all border
                         ${activeCategory === cat
                           ? "bg-gradient-to-r from-[var(--color-brand-500)] to-[var(--color-brand-700)] text-white border-transparent glow-brand"
                           : "bg-surface text-muted border-[var(--color-border)] hover:border-[var(--color-brand-500)]/50 hover:text-[var(--color-ink)]"}">
            ${cat}
          </button>
        `
        ).join("")}
      </div>

      <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        ${
          filteredGames.length > 0
            ? filteredGames.map(renderGameCard).join("")
            : `
          <div class="col-span-full text-center py-16">
            <p class="text-muted text-lg mb-2">Nenhum jogo encontrado</p>
            <p class="text-[var(--color-muted-2)] text-sm">Tente outro filtro ou termo de busca.</p>
          </div>
        `
        }
      </div>
    </div>
  `;

  return PublicLayout(content);
}

export async function afterRender() {
  const searchInput = document.getElementById("search-input");
  if (searchInput) {
    searchInput.addEventListener("input", (e) => {
      searchQuery = e.target.value;
      navigate("/hub");
    });
  }

  document.querySelectorAll("[data-category]").forEach((btn) => {
    btn.addEventListener("click", () => {
      activeCategory = btn.getAttribute("data-category");
      navigate("/hub");
    });
  });
}
