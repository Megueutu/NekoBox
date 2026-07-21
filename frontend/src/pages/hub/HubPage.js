import { PublicLayout } from "../../app/layouts/PublicLayout";
import { GamesService } from "../../services/games/games.service";
import { navigate } from "../../app/router/navigate";
import { GameCard } from "../../components/ui/GameCard";
import { EmptyState } from "../../components/ui/EmptyState";
import { getBannerUrl } from "../../utils/media";
import { formatPrice, getRecommendationRate } from "../../utils/format";
import { Icon, icons } from "../../components/ui/Icon";

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
              ${heroGame.categories.map((c) => `<span class="surface-chip px-2.5 py-1 text-xs font-medium rounded-md">${c}</span>`).join("")}
              ${
                heroRecRate !== null
                  ? `<span class="hero-recommendation inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-bold bg-black/55 ${heroRecRate >= 70 ? "text-[var(--color-accent-400)]" : "text-zinc-300"}">${Icon(icons.star, { className: "w-3.5 h-3.5", fill: "currentColor" })} ${heroRecRate}% recomendado</span>`
                  : ""
              }
            </div>
            <div class="flex flex-wrap items-center gap-4 sm:gap-6">
              <a href="/game/${heroGame.slug}" data-link
                 class="button-primary gap-2 px-5 py-3 text-sm">
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
            ${Icon(icons.search, { className: "absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-muted-2)]" })}
            <input id="search-input" type="text" placeholder="Buscar jogos..."
                   value="${searchQuery}"
                   class="w-full pl-9 pr-3 py-2.5 bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-lg text-sm text-[var(--color-ink)] placeholder:text-[var(--color-muted-2)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-500)] focus:border-transparent transition-all"/>
          </div>

        <div class="flex gap-2 flex-nowrap overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden" role="radiogroup" aria-label="Filtrar por categoria">
          ${ALL_CATEGORIES.map(
            (cat) => `
            <button data-category="${cat}"
                    type="button" role="radio" aria-checked="${activeCategory === cat}" tabindex="${activeCategory === cat ? "0" : "-1"}"
                    class="surface-chip shrink-0 px-4 py-2 rounded-full text-xs font-semibold transition-colors
                           data-[active=true]:bg-[var(--color-brand-600)]
                           ${activeCategory === cat
                             ? "bg-[var(--color-brand-600)] text-white"
                             : "hover:bg-[var(--color-surface-3)] hover:text-[var(--color-ink)]"}"
                    data-active="${activeCategory === cat}">
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
                icon: icons.search,
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
      navigate("/hub", { focusTarget: null });
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
      navigate("/hub", { focusTarget: "[data-active='true']" });
    });
  });
}
