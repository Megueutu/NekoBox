import { PrivateLayout } from "../../app/layouts/PrivateLayout";
import { Store } from "../../store/store";
import { navigate } from "../../app/router/navigate";
import { AuthService } from "../../services/auth/auth.service";
import { EmptyState } from "../../components/ui/EmptyState";
import { PageHeader } from "../../components/ui/PageHeader";
import { Icon, icons } from "../../components/ui/Icon";
import { AccountService } from "../../services/account/account.service";
import { getCoverUrl } from "../../utils/media";
import { formatDate, formatPlaytime } from "../../utils/format";

export function filterAndSortLibrary(library, query = "", order = "recent") {
  const normalizedQuery = query.trim().toLocaleLowerCase("pt-BR");
  const filtered = normalizedQuery
    ? library.filter((game) =>
        [game.title, game.publisher?.name, ...(game.categories || [])]
          .filter(Boolean)
          .some((value) => value.toLocaleLowerCase("pt-BR").includes(normalizedQuery))
      )
    : [...library];

  return filtered.sort((a, b) => {
    if (order === "title") return a.title.localeCompare(b.title, "pt-BR");
    if (order === "playtime") return b.playtime_minutes - a.playtime_minutes;
    return new Date(b.acquired_at || 0) - new Date(a.acquired_at || 0);
  });
}

function LibraryCard(game) {
  return `
    <article class="library-card">
      <a href="/game/${game.slug}" data-link class="library-card__cover">
        <img src="${getCoverUrl(game)}" alt="Capa de ${game.title}" loading="lazy" />
        <span class="library-card__owned">${Icon(icons.circleCheck, { className: "w-3.5 h-3.5" })} Adquirido</span>
      </a>
      <div class="library-card__content">
        <div>
          <p class="library-card__eyebrow">${game.categories?.[0] || "Jogo digital"}</p>
          <h2><a href="/game/${game.slug}" data-link>${game.title}</a></h2>
          <p class="library-card__publisher">${game.publisher?.name || "Publicadora independente"}</p>
        </div>
        <dl class="library-card__meta">
          <div><dt>Tempo jogado</dt><dd>${formatPlaytime(game.playtime_minutes)}</dd></div>
          <div><dt>Na biblioteca desde</dt><dd>${game.acquired_at ? formatDate(game.acquired_at) : "Data indisponível"}</dd></div>
        </dl>
        <a href="/game/${game.slug}" data-link class="button-accent library-card__action">
          ${Icon(icons.play, { className: "w-4 h-4", fill: "currentColor" })} Ver jogo
        </a>
      </div>
    </article>
  `;
}

export default async function LibraryPage() {
  const library = await AccountService.getLibrary();
  const orderedLibrary = filterAndSortLibrary(library);
  Store.setState((state) => ({ ...state, library }));

  const totalPlaytime = library.reduce((total, game) => total + game.playtime_minutes, 0);
  const genreCount = new Set(library.flatMap((game) => game.categories || [])).size;

  const content = `
    <div class="library-page space-y-6">
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
        <section class="library-overview" aria-label="Resumo da biblioteca">
          <div><strong>${library.length}</strong><span>Jogos adquiridos</span></div>
          <div><strong>${formatPlaytime(totalPlaytime)}</strong><span>Tempo total jogado</span></div>
          <div><strong>${genreCount}</strong><span>Gêneros na coleção</span></div>
        </section>

        <section class="collection-toolbar" aria-label="Ferramentas da biblioteca">
          <label class="collection-search">
            <span class="sr-only">Buscar na biblioteca</span>
            ${Icon(icons.search, { className: "w-4 h-4" })}
            <input id="library-search" type="search" placeholder="Buscar por jogo, gênero ou publicadora" autocomplete="off" />
          </label>
          <label class="collection-sort">
            <span>Ordenar por</span>
            <select id="library-sort">
              <option value="recent">Adicionados recentemente</option>
              <option value="title">Título (A–Z)</option>
              <option value="playtime">Mais jogados</option>
            </select>
          </label>
        </section>

        <p id="library-results-status" class="sr-only" aria-live="polite"></p>
        <div id="library-grid" class="collection-grid">
          ${orderedLibrary.map(LibraryCard).join("")}
        </div>
        <div id="library-no-results" class="collection-no-results" role="status" hidden>
          ${Icon(icons.search, { className: "w-8 h-8" })}
          <h2>Nenhum jogo encontrado</h2>
          <p>Tente buscar por outro título, gênero ou publicadora.</p>
        </div>
      `
      }
    </div>
  `;

  return PrivateLayout(content);
}

export async function afterRender() {
  const search = document.getElementById("library-search");
  const sort = document.getElementById("library-sort");
  const grid = document.getElementById("library-grid");
  const noResults = document.getElementById("library-no-results");
  const status = document.getElementById("library-results-status");

  const renderLibrary = () => {
    const library = filterAndSortLibrary(Store.getState().library, search?.value, sort?.value);
    if (grid) grid.innerHTML = library.map(LibraryCard).join("");
    if (noResults) noResults.hidden = library.length > 0;
    if (status) {
      status.textContent = `${library.length} jogo${library.length === 1 ? "" : "s"} encontrado${library.length === 1 ? "" : "s"}.`;
    }
  };

  search?.addEventListener("input", renderLibrary);
  sort?.addEventListener("change", renderLibrary);

  document.getElementById("btn-sidebar-logout")?.addEventListener("click", async () => {
    await AuthService.logout();
    navigate("/hub");
  });
}
