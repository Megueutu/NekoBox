import { PublicLayout } from "../../app/layouts/PublicLayout";
import { GamesService } from "../../services/games/games.service";
import { navigate } from "../../app/router/navigate";

// Todas as categorias disponíveis para filtro
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
    <article class="bg-white rounded-lg overflow-hidden border border-zinc-200 hover:border-zinc-400 transition-all cursor-pointer group"
             data-link href="/game/${game.slug}">
      <!-- Capa -->
      <div class="w-full aspect-[2/3] bg-cover bg-center bg-no-repeat bg-zinc-800"
           style="background-image: url('${getCoverUrl(game)}')"></div>
      <!-- Info -->
      <div class="p-3">
        <p class="font-semibold text-sm leading-tight mb-1 truncate">${game.title}</p>
        <div class="flex items-center justify-between gap-2">
          <span class="text-xs text-zinc-400">${game.categories[0] || ""}</span>
          <span class="font-bold text-sm">${formatPrice(game.price)}</span>
        </div>
      </div>
    </article>
  `;
}

function renderSkeleton() {
  return Array(8).fill("").map(() => `
    <div class="bg-zinc-100 rounded-lg overflow-hidden border border-zinc-200 animate-pulse">
      <div class="w-full aspect-[2/3] bg-zinc-200"></div>
      <div class="p-3 space-y-2">
        <div class="h-3 bg-zinc-200 rounded w-3/4"></div>
        <div class="h-3 bg-zinc-200 rounded w-1/2"></div>
      </div>
    </div>
  `).join("");
}

export default async function HubPage() {
  // Carrega todos os jogos para ter o hero disponível imediatamente
  const allGames = await GamesService.getAll();
  const heroGame = allGames[0];

  // Filtra os jogos conforme estado atual
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
    <!-- Hero Banner -->
    <div class="w-full h-[220px] sm:h-[350px] md:h-[480px] bg-cover bg-center bg-no-repeat relative"
         style="background-image: url('${getBannerUrl(heroGame)}')">
      <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex items-end p-6 md:p-10">
        <div>
          <p class="text-zinc-300 text-xs uppercase tracking-widest mb-1 text-white">Destaque</p>
          <h1 class="text-white text-3xl md:text-5xl font-black mb-2 leading-tight">${heroGame.title}</h1>
          <p class="text-zinc-200 text-sm md:text-base max-w-xl mb-4 hidden sm:block">${heroGame.short_description}</p>
          <a href="/game/${heroGame.slug}" data-link
             class="inline-block px-5 py-2.5 bg-white text-zinc-900 font-bold text-sm rounded hover:bg-zinc-200 transition-colors">
            Ver Detalhes
          </a>
        </div>
      </div>
    </div>

    <!-- Barra de Controle -->
    <div class="max-w-7xl mx-auto px-4 py-6">
      <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <!-- Busca -->
        <div class="relative w-full sm:w-72">
          <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
          </svg>
          <input id="search-input" type="text" placeholder="Buscar jogos..."
                 value="${searchQuery}"
                 class="w-full pl-9 pr-3 py-2 border border-zinc-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900"/>
        </div>
        <!-- Contagem -->
        <p class="text-zinc-500 text-sm shrink-0">${filteredGames.length} título${filteredGames.length !== 1 ? "s" : ""}</p>
      </div>

      <!-- Filtros por Categoria -->
      <div class="flex gap-2 flex-wrap mb-6">
        ${ALL_CATEGORIES.map(
          (cat) => `
          <button data-category="${cat}"
                  class="px-3 py-1.5 rounded text-xs font-semibold transition-colors
                         ${activeCategory === cat ? "bg-zinc-900 text-white" : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"}">
            ${cat}
          </button>
        `
        ).join("")}
      </div>

      <!-- Grid de Jogos -->
      <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        ${
          filteredGames.length > 0
            ? filteredGames.map(renderGameCard).join("")
            : `
          <div class="col-span-full text-center py-16">
            <p class="text-zinc-400 text-lg mb-2">Nenhum jogo encontrado</p>
            <p class="text-zinc-300 text-sm">Tente outro filtro ou termo de busca.</p>
          </div>
        `
        }
      </div>
    </div>
  `;

  return PublicLayout(content);
}

export async function afterRender() {
  // Busca em tempo real
  const searchInput = document.getElementById("search-input");
  if (searchInput) {
    searchInput.addEventListener("input", (e) => {
      searchQuery = e.target.value;
      navigate("/hub");
    });
  }

  // Filtros de categoria
  document.querySelectorAll("[data-category]").forEach((btn) => {
    btn.addEventListener("click", () => {
      activeCategory = btn.getAttribute("data-category");
      navigate("/hub");
    });
  });
}
