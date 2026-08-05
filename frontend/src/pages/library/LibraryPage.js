import { PrivateLayout } from "../../app/layouts/PrivateLayout";
import { ACCOUNT_PATHS } from "../../app/router/account-routes";
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
  const redemptionMessage = sessionStorage.getItem("game-code-redemption-message");
  sessionStorage.removeItem("game-code-redemption-message");
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

      <section class="library-redemption panel" aria-labelledby="library-redemption-title">
        <div>
          <span>${Icon(icons.gift, { className: "w-5 h-5" })}</span>
          <div>
            <p>Recebeu um presente?</p>
            <h2 id="library-redemption-title">Resgatar código de jogo</h2>
            <small>O código adiciona o título diretamente à sua biblioteca.</small>
          </div>
        </div>
        <form id="game-code-form" novalidate>
          <label class="sr-only" for="game-code-input">Código de jogo</label>
          <input id="game-code-input" class="ui-control" name="code" type="text" maxlength="32"
                 autocomplete="off" spellcheck="false" placeholder="NEKO-GAME-XXXX-XXXX-XXXX"
                 aria-describedby="game-code-status" required />
          <button type="submit" class="button-primary">Resgatar</button>
        </form>
        <p id="game-code-status" class="library-redemption__status${redemptionMessage ? " is-success" : ""}"
           role="status" aria-live="polite">${redemptionMessage || ""}</p>
      </section>

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
            <input id="library-search" class="ui-control" type="search" placeholder="Buscar por jogo, gênero ou publicadora" autocomplete="off" />
          </label>
          <label class="collection-sort">
            <span>Ordenar por</span>
            <select id="library-sort" class="ui-control">
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
          ${Icon(icons.search, { className: "w-5 h-5" })}
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

  const codeForm = document.getElementById("game-code-form");
  codeForm?.addEventListener("submit", async (event) => {
    event.preventDefault();
    const input = document.getElementById("game-code-input");
    const status = document.getElementById("game-code-status");
    const button = codeForm.querySelector("button");
    const code = input.value.trim();

    status.classList.remove("is-success", "is-error");
    if (!code) {
      status.textContent = "Informe o código que você recebeu.";
      status.classList.add("is-error");
      input.setAttribute("aria-invalid", "true");
      input.focus();
      return;
    }

    input.removeAttribute("aria-invalid");
    codeForm.setAttribute("aria-busy", "true");
    button.disabled = true;
    try {
      const game = await AccountService.redeemGameCode(code);
      const library = await AccountService.getLibrary();
      Store.setState((state) => ({ ...state, library }));
      sessionStorage.setItem(
        "game-code-redemption-message",
        `${game.title} foi adicionado à sua biblioteca.`
      );
      navigate(ACCOUNT_PATHS.library, { focusTarget: "#game-code-status" });
    } catch (error) {
      status.textContent = error.message || "Não foi possível resgatar o código.";
      status.classList.add("is-error");
      codeForm.removeAttribute("aria-busy");
      button.disabled = false;
      input.setAttribute("aria-invalid", "true");
      input.focus();
    }
  });

  document.getElementById("btn-sidebar-logout")?.addEventListener("click", async () => {
    await AuthService.logout();
    navigate("/hub");
  });
}
