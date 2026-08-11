import { PublicLayout } from "../../app/layouts/PublicLayout";
import { GamesService } from "../../services/games/games.service";
import { GameCard } from "../../components/ui/GameCard";
import { EmptyState } from "../../components/ui/EmptyState";
import { getBannerUrl } from "../../utils/media";
import { formatPrice, isFreeGame } from "../../utils/format";
import { Icon, icons } from "../../components/ui/Icon";
import { bindNavigationScroll } from "../../utils/nav-scroll";

const ALL_CATEGORIES = [
  "Todos", "RPG", "Ação", "Aventura", "Mundo Aberto",
  "Ficção Científica", "Fantasia", "Roguelike", "Sandbox",
  "Simulação", "Metroidvania", "Plataforma",
];

let activeCategories = [];
let searchQuery = "";
let catalogGames = [];

export function filterCatalogGames(games, query = "", categories = []) {
  const normalizedQuery = query.trim().toLocaleLowerCase("pt-BR");
  const categoryList = (Array.isArray(categories) ? categories : [categories])
    .filter((cat) => cat && cat !== "Todos");

  return games.filter((game) => {
    const matchesCategory =
      categoryList.length === 0 ||
      categoryList.some((cat) => game.categories.includes(cat));
    const matchesQuery =
      !normalizedQuery ||
      [game.title, ...game.tags]
        .some((value) => value.toLocaleLowerCase("pt-BR").includes(normalizedQuery));

    return matchesCategory && matchesQuery;
  });
}

function catalogHeadingText() {
  return activeCategories.length === 0 ? "Todos os jogos" : activeCategories.join(", ");
}

function updateCatalogResults(games) {
  const filteredGames = filterCatalogGames(games, searchQuery, activeCategories);
  const count = document.getElementById("catalog-results-count");
  const heading = document.getElementById("catalog-results-heading");
  const grid = document.getElementById("catalog-grid");
  const noResults = document.getElementById("catalog-no-results");

  if (count) {
    count.textContent = `${filteredGames.length} título${filteredGames.length !== 1 ? "s" : ""}`;
  }
  if (heading) {
    heading.textContent = catalogHeadingText();
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

function syncCategoryButtons() {
  document.querySelectorAll("[data-category]").forEach((btn) => {
    const cat = btn.getAttribute("data-category");
    const isActive = cat === "Todos" ? activeCategories.length === 0 : activeCategories.includes(cat);

    btn.setAttribute("aria-pressed", String(isActive));
    btn.setAttribute("data-active", String(isActive));
    btn.classList.toggle("bg-[var(--color-brand-600)]", isActive);
    btn.classList.toggle("text-white", isActive);
  });
}

function toggleCategory(category) {
  if (category === "Todos") {
    activeCategories = [];
    return;
  }

  activeCategories = activeCategories.includes(category)
    ? activeCategories.filter((cat) => cat !== category)
    : [...activeCategories, category];
}

function coverRail(eyebrow, title, description, games) {
  if (!games.length) return "";
  return `
    <section class="catalog-showcase">
      <div class="section-heading">
        <div>
          <p class="section-heading__eyebrow mb-1">${eyebrow}</p>
          <h2 class="type-section-title">${title}</h2>
        </div>
        <span class="type-small text-muted">${description}</span>
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

export function bindCategoryFilters(games) {
  document.querySelectorAll("[data-category]").forEach((btn) => {
    btn.addEventListener("click", () => {
      toggleCategory(btn.getAttribute("data-category"));
      updateCatalogResults(games);
      syncCategoryButtons();
    });
  });
}

export function bindHubNavigationScroll() {
  bindNavigationScroll(".site-nav--hub");
}

export default async function HubPage() {
  const allGames = await GamesService.getAll();
  catalogGames = allGames;
  const heroGame = allGames[0];
  const latestReleases = [...allGames]
    .filter((game) => game.release_date)
    .sort((a, b) => b.release_date.localeCompare(a.release_date))
    .slice(0, 8);
  const freeToPlay = allGames.filter(isFreeGame).slice(0, 8);
  const rolePlaying = allGames.filter((game) => game.categories.includes("RPG")).slice(0, 8);

  const filteredGames = filterCatalogGames(allGames, searchQuery, activeCategories);

  const content = `
    <div class="site-container page-stack">
    <section class="hero-panel"
         style="background-image: url('${getBannerUrl(heroGame)}')">
      <div class="absolute inset-0 bg-black/60"></div>
      <div class="hero-panel__content">
          <div class="w-full min-w-0 max-w-2xl relative z-10">
            <h1 class="type-hero-title text-white mb-4">${heroGame.title}</h1>
            <div class="flex flex-wrap items-center gap-2 mb-6">
              ${heroGame.categories.map((c) => `<span class="chip">${c}</span>`).join("")}
            </div>
            <div class="flex flex-wrap items-center gap-4 sm:gap-6">
              <a href="/game/${heroGame.slug}" data-link
                 class="button-primary gap-2 px-5 py-3">
                Ver Detalhes
              </a>
              <span class="type-content-title text-[var(--color-accent-300)]">${formatPrice(heroGame.price)}</span>
            </div>
          </div>
      </div>
    </section>

      ${coverRail("Lançamentos", "Novos no catálogo", "Adicionados recentemente", latestReleases)}
      ${coverRail("Jogue sem custo", "Gratuitos para começar", "Títulos disponíveis agora", freeToPlay)}
      ${coverRail("Para sua próxima aventura", "RPGs para explorar", "Histórias, mundos e escolhas", rolePlaying)}

      <section class="space-y-6">
        <div class="section-heading mb-0">
          <div>
            <h2 class="type-section-title">Catálogo de jogos</h2>
          </div>
          <p id="catalog-results-count" class="type-small text-muted shrink-0" aria-live="polite">${filteredGames.length} título${filteredGames.length !== 1 ? "s" : ""}</p>
        </div>
        <div class="catalog-toolbar">
          <label class="catalog-search">
            <span class="sr-only">Buscar jogos</span>
            ${Icon(icons.search, { className: "w-4 h-4" })}
            <input id="search-input" class="ui-control" type="search" placeholder="Buscar jogos..."
                   value="${searchQuery}"
                   />
          </label>

        <div class="catalog-category-rail" role="group" aria-label="Filtrar por categoria">
          ${ALL_CATEGORIES.map((cat) => {
            const isActive = cat === "Todos" ? activeCategories.length === 0 : activeCategories.includes(cat);
            return `
            <button data-category="${cat}"
                    type="button" aria-pressed="${isActive}"
                    class="surface-chip shrink-0 px-4 py-2 rounded-full text-xs font-semibold transition-colors
                           ${isActive
                             ? "bg-[var(--color-brand-600)] text-white"
                             : "hover:bg-[var(--color-surface-3)] hover:text-[var(--color-ink)]"}"
                    data-active="${isActive}">
              ${cat}
            </button>
          `;
          }).join("")}
        </div></div>
      </section>

      <section class="-mt-8">
        <h3 id="catalog-results-heading" class="sr-only">${catalogHeadingText()}</h3>
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
  bindCategoryFilters(catalogGames);
  bindHubNavigationScroll();
}
