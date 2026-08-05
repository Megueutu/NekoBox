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
let catalogGames = [];

export function filterCatalogGames(games, query = "", category = "Todos") {
  const normalizedQuery = query.trim().toLocaleLowerCase("pt-BR");

  return games.filter((game) => {
    const matchesCategory =
      category === "Todos" || game.categories.includes(category);
    const matchesQuery =
      !normalizedQuery ||
      [game.title, game.short_description, ...game.tags]
        .some((value) => value.toLocaleLowerCase("pt-BR").includes(normalizedQuery));

    return matchesCategory && matchesQuery;
  });
}

function updateCatalogResults(games) {
  const filteredGames = filterCatalogGames(games, searchQuery, activeCategory);
  const count = document.getElementById("catalog-results-count");
  const heading = document.getElementById("catalog-results-heading");
  const grid = document.getElementById("catalog-grid");
  const noResults = document.getElementById("catalog-no-results");

  if (count) {
    count.textContent = `${filteredGames.length} título${filteredGames.length !== 1 ? "s" : ""}`;
  }
  if (heading) {
    heading.textContent = activeCategory === "Todos" ? "Todos os jogos" : activeCategory;
  }
  if (grid) {
    grid.innerHTML = filteredGames
      .map((game) => GameCard(game, { variant: "poster" }))
      .join("");
  }
  if (noResults) {
    noResults.hidden = filteredGames.length > 0;
  }
}

function coverRail(eyebrow, title, description, games) {
  if (!games.length) return "";
  return `
    <section class="catalog-showcase">
      <div class="section-heading">
        <div>
          <p class="section-heading__eyebrow mb-1">${eyebrow}</p>
          <h2 class="font-display text-2xl sm:text-3xl font-bold">${title}</h2>
        </div>
        <span class="text-muted text-sm">${description}</span>
      </div>
      <div class="horizontal-rail">
        ${games.map((game) => `<div>${GameCard(game, { variant: "catalog" })}</div>`).join("")}
      </div>
    </section>
  `;
}

export function bindCatalogSearch(games) {
  const searchInput = document.getElementById("search-input");
  searchInput?.addEventListener("input", (event) => {
    searchQuery = event.target.value;
    updateCatalogResults(games);
  });
}

export default async function HubPage() {
  const allGames = await GamesService.getAll();
  catalogGames = allGames;
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

  const latestReleases = [...allGames]
    .filter((game) => game.release_date)
    .sort((a, b) => b.release_date.localeCompare(a.release_date))
    .slice(0, 8);
  const freeToPlay = allGames.filter((game) => Number(game.price) === 0).slice(0, 8);
  const rolePlaying = allGames.filter((game) => game.categories.includes("RPG")).slice(0, 8);

  const filteredGames = filterCatalogGames(allGames, searchQuery, activeCategory);

  const content = `
    <div class="site-container page-stack">
    <!-- Hero: destaque da semana -->
    <section class="hero-panel noise-overlay"
         style="background-image: url('${getBannerUrl(heroGame)}')">
      <div class="absolute inset-0 bg-black/60"></div>
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

      ${coverRail("Lançamentos", "Novos no catálogo", "Adicionados recentemente", latestReleases)}
      ${coverRail("Jogue sem custo", "Gratuitos para começar", "Títulos disponíveis agora", freeToPlay)}
      ${coverRail("Para sua próxima aventura", "RPGs para explorar", "Histórias, mundos e escolhas", rolePlaying)}
      ${coverRail("Descubra", "Em alta agora", "Mais recomendados pela comunidade", trending)}

      <!-- Busca, contagem e filtros -->
      <section class="space-y-6">
        <div class="section-heading mb-0">
          <div>
            <p class="section-heading__eyebrow mb-1">Explore</p>
            <h2 class="font-display text-2xl sm:text-3xl font-bold">Catálogo de jogos</h2>
          </div>
          <p id="catalog-results-count" class="text-muted text-sm shrink-0" aria-live="polite">${filteredGames.length} título${filteredGames.length !== 1 ? "s" : ""}</p>
        </div>
        <div class="catalog-toolbar">
          <label class="catalog-search w-full sm:max-w-lg">
            <span class="sr-only">Buscar jogos</span>
            ${Icon(icons.search, { className: "w-4 h-4" })}
            <input id="search-input" class="ui-control" type="search" placeholder="Buscar jogos..."
                   value="${searchQuery}"
                   />
          </label>

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
        <h3 id="catalog-results-heading" class="sr-only">${activeCategory === "Todos" ? "Todos os jogos" : activeCategory}</h3>
        <div id="catalog-grid" class="catalog-grid">
          ${
            filteredGames.length > 0
              ? filteredGames.map((game) => GameCard(game, { variant: "poster" })).join("")
              : ""
          }
        </div>
        <div id="catalog-no-results" ${filteredGames.length > 0 ? "hidden" : ""}>
          ${EmptyState({
            icon: icons.search,
            title: "Nenhum jogo encontrado",
            description: "Tente outro filtro ou termo de busca.",
          })}
        </div>
      </section>
    </div>
  `;

  return PublicLayout(content);
}

export async function afterRender() {
  bindCatalogSearch(catalogGames);

  document.querySelectorAll("[data-category]").forEach((btn) => {
    btn.addEventListener("click", () => {
      activeCategory = btn.getAttribute("data-category");
      navigate("/hub", { focusTarget: "[data-active='true']" });
    });
  });
}
