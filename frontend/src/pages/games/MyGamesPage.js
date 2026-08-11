import { PrivateLayout } from "../../app/layouts/PrivateLayout";
import { PageHeader } from "../../components/ui/PageHeader";
import { EmptyState } from "../../components/ui/EmptyState";
import { Icon, icons } from "../../components/ui/Icon";
import { GameResourceForm } from "../../components/GameResourceForm";
import { MyGamesService } from "../../services/games/my-games.service";
import { escapeHtml } from "../../utils/escape";
import { formatDate, money } from "../admin/admin-format";
import {
  cleanupSelectedMedia,
  removeSelectedMedia,
  renderSelectedMedia,
  saveGameWithMedia,
  selectMediaFiles,
  updateGamePreview,
} from "../admin/admin-game-preview";
import { bindSidebarLogout } from "../../components/layout/SidebarAccount";

let myGames = [];

function emptyRow(columns, message) {
  return `<tr><td colspan="${columns}" class="admin-empty">${message}</td></tr>`;
}

function statusLabel(status) {
  return { draft: "Rascunho", published: "Publicado", archived: "Arquivado" }[status] || status;
}

function statusVariant(status) {
  return status === "published" ? "success" : status === "archived" ? "muted" : "warning";
}

function gamesTable(games) {
  return `
    <div class="admin-table-wrap"><table class="admin-table admin-games-table">
      <thead><tr><th>Jogo</th><th>Preço</th><th>Status</th><th>Lançamento</th><th><span class="sr-only">Ações</span></th></tr></thead>
      <tbody>
        ${games.map((game) => `
          <tr>
            <td><div class="admin-game-cell"><div class="admin-game-cover" ${game.capa_url ? `style="background-image:url('${escapeHtml(game.capa_url)}')"` : ""}>${game.capa_url ? "" : Icon(icons.gamepad, { className: "w-5 h-5" })}</div><div><strong>${escapeHtml(game.titulo)}</strong><small>${escapeHtml(game.slug)}</small></div></div></td>
            <td>${money.format(game.preco)}</td>
            <td><span class="admin-status admin-status--${statusVariant(game.status)}">${escapeHtml(statusLabel(game.status))}</span></td>
            <td>${formatDate(game.release_date)}</td>
            <td><div class="admin-row-actions">
              <button type="button" data-my-game-edit="${game.id}" aria-label="Editar ${escapeHtml(game.titulo)}">${Icon(icons.pencil, { className: "w-4 h-4" })}</button>
              <button type="button" class="admin-danger" data-my-game-delete="${game.id}" aria-label="Excluir ${escapeHtml(game.titulo)}">${Icon(icons.trash, { className: "w-4 h-4" })}</button>
            </div></td>
          </tr>
        `).join("") || emptyRow(5, "Você ainda não lançou nenhum jogo.")}
      </tbody>
    </table></div>
  `;
}

function myGamesDialog() {
  return `
    <dialog id="my-games-dialog" class="admin-dialog" aria-labelledby="my-games-dialog-title">
      <div class="admin-dialog__frame">
        <button type="button" class="admin-dialog__close" data-my-games-dialog-close aria-label="Fechar">${Icon(icons.x, { className: "w-5 h-5" })}</button>
        <div id="my-games-dialog-content"></div>
      </div>
    </dialog>
    <p id="my-games-toast" class="admin-toast hidden" role="status" aria-live="polite"></p>
  `;
}

export default async function MyGamesPage() {
  myGames = await MyGamesService.getMine();

  const content = `
    <div class="my-games-page">
      ${PageHeader({
        title: "Meus Jogos",
        subtitle: "Publique seus próprios jogos no catálogo do NekoBox e acompanhe o que você já lançou.",
      })}
      <div class="admin-page-header">
        <button type="button" class="button-primary admin-header-action" data-my-game-create>
          ${Icon(icons.plus, { className: "w-4 h-4" })} Lançar jogo
        </button>
      </div>
      <article class="admin-panel">
        <div class="admin-panel__heading"><div><p>Seus lançamentos</p><h2>${myGames.length} jogo${myGames.length === 1 ? "" : "s"}</h2></div></div>
        ${myGames.length
          ? gamesTable(myGames)
          : EmptyState({
              icon: icons.gamepad,
              title: "Nenhum jogo lançado ainda",
              description: "Clique em \"Lançar jogo\" para publicar o seu primeiro título no catálogo.",
            })}
      </article>
      ${myGamesDialog()}
    </div>
  `;

  return PrivateLayout(content);
}

function showToast(message, error = false) {
  const toast = document.getElementById("my-games-toast");
  if (!toast) return;
  toast.textContent = message;
  toast.classList.toggle("admin-toast--error", error);
  toast.classList.remove("hidden");
  window.setTimeout(() => toast.classList.add("hidden"), 4200);
}

function openGameDialog(game = null) {
  const dialog = document.getElementById("my-games-dialog");
  const content = document.getElementById("my-games-dialog-content");
  dialog.dataset.variant = "game";
  content.innerHTML = `
    <header><p>${game ? "Editar jogo" : "Novo lançamento"}</p><h2 id="my-games-dialog-title">${game ? escapeHtml(game.titulo) : "Lançar jogo"}</h2></header>
    ${GameResourceForm({
      formId: "my-game-form",
      idPrefix: "my-game",
      game,
      submitLabel: game ? "Salvar alterações" : "Lançar jogo",
      mediaDeleteAttribute: "data-my-game-delete-media",
    })}`;
  dialog.showModal();
  const form = content.querySelector("form");
  updateGamePreview(form);
  form.querySelector("input")?.focus();
}

async function submitGameForm(form) {
  const data = new FormData(form);
  const id = form.dataset.resourceId;
  const error = form.querySelector(".admin-form-error");
  const submit = form.querySelector('button[type="submit"]');
  submit.disabled = true;
  error.classList.add("hidden");
  try {
    const payload = {
      titulo: data.get("titulo"),
      descricao_longa: data.get("descricao_longa"),
      preco: Number(data.get("preco")),
      release_date: data.get("data_lancamento") || null,
      status: data.get("status"),
      tags: String(data.get("tags") || "").split(",").map((tag) => tag.trim()).filter(Boolean),
      updates: [],
      categoria_ids: [],
    };
    await saveGameWithMedia(MyGamesService, id, payload, form);
    document.getElementById("my-games-dialog").close();
    window.dispatchEvent(new CustomEvent("rerender"));
  } catch (requestError) {
    error.textContent = requestError.message;
    error.classList.remove("hidden");
    submit.disabled = false;
  }
}

export function afterRender() {
  bindSidebarLogout();

  document.querySelector("[data-my-games-dialog-close]")?.addEventListener("click", () => {
    document.getElementById("my-games-dialog")?.close();
  });

  document.querySelector(".my-games-page")?.addEventListener("click", async (event) => {
    const create = event.target.closest("[data-my-game-create]");
    if (create) openGameDialog();

    const edit = event.target.closest("[data-my-game-edit]");
    if (edit) openGameDialog(myGames.find((game) => String(game.id) === edit.dataset.myGameEdit));

    const remove = event.target.closest("[data-my-game-delete]");
    if (remove) {
      const game = myGames.find((item) => String(item.id) === remove.dataset.myGameDelete);
      if (window.confirm(`Excluir o jogo ${game.titulo}? Esta ação não pode ser desfeita.`)) {
        try {
          await MyGamesService.deleteGame(game.id);
          window.dispatchEvent(new CustomEvent("rerender"));
        } catch (error) {
          showToast(error.message, true);
        }
      }
    }
  });

  const dialog = document.getElementById("my-games-dialog");

  dialog?.addEventListener("submit", (event) => {
    if (event.target.id !== "my-game-form") return;
    event.preventDefault();
    submitGameForm(event.target);
  });

  dialog?.addEventListener("change", (event) => {
    if (event.target.type === "file") selectMediaFiles(event.target.form, event.target);
    else if (event.target.form?.id === "my-game-form") updateGamePreview(event.target.form);
  });

  dialog?.addEventListener("input", (event) => {
    if (event.target.form?.id === "my-game-form") updateGamePreview(event.target.form);
  });

  dialog?.addEventListener("close", (event) => {
    cleanupSelectedMedia(event.currentTarget);
  });

  dialog?.addEventListener("click", async (event) => {
    const selectedMedia = event.target.closest("[data-remove-selected-media]");
    if (selectedMedia) {
      const form = selectedMedia.closest("form");
      removeSelectedMedia(form, selectedMedia.dataset.mediaType, Number(selectedMedia.dataset.mediaIndex));
      return;
    }

    const button = event.target.closest("[data-my-game-delete-media]");
    if (!button) return;
    button.disabled = true;
    try {
      await MyGamesService.deleteGameMedia(button.dataset.gameId, button.dataset.myGameDeleteMedia);
      button.closest("[data-existing-media]")?.remove();
      renderSelectedMedia(button.form);
      showToast("Mídia removida.");
    } catch (error) {
      button.disabled = false;
      showToast(error.message, true);
    }
  });
}
