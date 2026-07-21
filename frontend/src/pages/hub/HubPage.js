import { PublicLayout } from "../../app/layouts/PublicLayout";
import { GamesService } from "../../services/games/games.service";
import { navigate } from "../../app/router/navigate";
import { GameCard } from "../../components/ui/GameCard";
import { EmptyState } from "../../components/ui/EmptyState";
import { getBannerUrl } from "../../utils/media";
import { formatPrice, getRecommendationRate } from "../../utils/format";

const ALL_CATEGORIES = [
  "Todos", "RPG", "Ação", "Aventura", "Mundo Aberto",
  "Ficção Científica", "Fantasia", "Roguelike", "Sandbox",
  "Simulação", "Metroidvania", "Plataforma",
];

let activeCategory = "Todos";
let searchQuery = "";

export default async function HubPage() {
  const allGames = await GamesService.getAll();
  const heroGame = allGames[0];
  const heroRecRate = getRecommendationRate(heroGame.reviews);

  // "Em Alta": top 5 títulos por taxa real de recomendação, excluindo o destaque do hero.
  const trending = allGames
    .filter((g) => g.id !== heroGame.id)
    .map((g) => ({ game: g, rate: getRecommendationRate(g.reviews) }))
    .filter((g) => g.rate !== null)
    .sort((a, b) => b.rate - a.rate)
    .slice(0, 5)
    .map((g) => g.game);

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
    <div class="site-container page-stack">
    <!-- Hero: destaque da semana -->
    <section class="hero-panel noise-overlay"
         style="background-image: url('${getBannerUrl(heroGame)}')">
      <div class="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-black/5"></div>
      <div class="absolute inset-0 bg-gradient-to-r from-black/90 via-black/30 to-transparent"></div>
      <div class="hero-panel__content">
          <div class="w-full min-w-0 max-w-2xl relative z-10">
            <p class="section-heading__eyebrow inline-flex items-center gap-2 mb-4">
              <span class="w-1.5 h-1.5 rounded-full bg-[var(--color-accent-400)] glow-accent"></span>
              Destaque da Semana
            </p>
            <h1 class="font-display text-white text-4xl sm:text-6xl lg:text-7xl font-bold mb-4 leading-[0.95] tracking-tight">${heroGame.title}</h1>
            <p class="text-zinc-200 text-sm sm:text-base leading-relaxed mb-5 max-w-xl line-clamp-2">${heroGame.short_description}</p>
            <div class="flex flex-wrap items-center gap-2 mb-6">
              ${heroGame.categories.map((c) => `<span class="px-2.5 py-1 bg-[var(--color-brand-500)]/25 border border-[var(--color-brand-400)]/40 text-white text-xs font-medium rounded-full">${c}</span>`).join("")}
              ${
                heroRecRate !== null
                  ? `<span class="hero-recommendation inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-black/40 border border-white/10 ${heroRecRate >= 70 ? "text-[var(--color-accent-400)]" : "text-zinc-300"}">★ ${heroRecRate}% recomendado</span>`
                  : ""
              }
            </div>
            <div class="flex flex-wrap items-center gap-4 sm:gap-6">
              <a href="/game/${heroGame.slug}" data-link
                 class="inline-flex items-center gap-2 px-5 py-3 bg-[var(--color-brand-600)] text-white font-bold text-sm rounded-lg hover:bg-[var(--color-brand-500)] transition-colors">
                Ver Detalhes
              </a>
              <span class="font-display text-2xl sm:text-3xl font-bold text-[var(--color-accent-300)]">${formatPrice(heroGame.price)}</span>
            </div>
          </div>
      </div>
    </section>

      <!-- Em Alta: fila horizontal com os títulos mais bem avaliados -->
      ${
        trending.length > 0
          ? `
        <section>
          <div class="section-heading">
            <div>
              <p class="section-heading__eyebrow mb-1">Descubra</p>
              <h2 class="font-display text-2xl sm:text-3xl font-bold">Em alta agora</h2>
            </div>
            <span class="text-muted text-sm">Mais recomendados pela comunidade</span>
          </div>
          <div class="horizontal-rail">
            ${trending
              .map(
                (game) => `<div>${GameCard(game, { variant: "catalog" })}</div>`
              )
              .join("")}
          </div>
        </section>
      `
          : ""
      }

      <!-- Busca, contagem e filtros -->
      <section class="space-y-6">
        <div class="section-heading mb-0">
          <div>
            <p class="section-heading__eyebrow mb-1">Explore</p>
            <h2 class="font-display text-2xl sm:text-3xl font-bold">Catálogo de jogos</h2>
          </div>
          <p class="text-muted text-sm shrink-0">${filteredGames.length} título${filteredGames.length !== 1 ? "s" : ""}</p>
        </div>
        <div class="catalog-toolbar">
          <div class="relative w-full sm:max-w-lg">
            <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-muted-2)]" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
            </svg>
            <input id="search-input" type="text" placeholder="Buscar jogos..."
                   value="${searchQuery}"
                   class="w-full pl-9 pr-3 py-2.5 bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-lg text-sm text-[var(--color-ink)] placeholder:text-[var(--color-muted-2)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-500)] focus:border-transparent transition-all"/>
          </div>

        <div class="flex gap-2 flex-nowrap overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          ${ALL_CATEGORIES.map(
            (cat) => `
            <button data-category="${cat}"
                    class="shrink-0 px-4 py-2 rounded-full text-xs font-semibold transition-all border
                           ${activeCategory === cat
                             ? "bg-gradient-to-r from-[var(--color-brand-500)] to-[var(--color-brand-700)] text-white border-transparent glow-brand"
                             : "bg-surface text-muted border-[var(--color-border)] hover:border-[var(--color-brand-500)]/50 hover:text-[var(--color-ink)]"}">
              ${cat}
            </button>
          `
          ).join("")}
        </div></div>
      </section>

      <!-- Grid do Catálogo -->
      <section class="-mt-8">
        <h3 class="sr-only">${activeCategory === "Todos" ? "Todos os jogos" : activeCategory}</h3>
        <div class="catalog-grid">
          ${
            filteredGames.length > 0
              ? filteredGames.map((game) => GameCard(game, { variant: "catalog" })).join("")
              : ""
          }
        </div>
        ${
          filteredGames.length === 0
            ? EmptyState({
                icon: "M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z",
                title: "Nenhum jogo encontrado",
                description: "Tente outro filtro ou termo de busca.",
              })
            : ""
        }
      </section>
    </div>
  `;

  return PublicLayout(content);
}

export async function afterRender() {
  const searchInput = document.getElementById("search-input");
  if (searchInput) {
    searchInput.addEventListener("input", (e) => {
      const cursorPosition = e.target.selectionStart;
      searchQuery = e.target.value;
      navigate("/hub");
      requestAnimationFrame(() => {
        const nextInput = document.getElementById("search-input");
        if (!nextInput) return;
        nextInput.focus();
        nextInput.setSelectionRange(cursorPosition, cursorPosition);
      });
    });
  }

  document.querySelectorAll("[data-category]").forEach((btn) => {
    btn.addEventListener("click", () => {
      activeCategory = btn.getAttribute("data-category");
      navigate("/hub");
    });
  });
}
