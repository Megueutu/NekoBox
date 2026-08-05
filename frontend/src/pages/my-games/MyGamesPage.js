import { PrivateLayout } from "../../app/layouts/PrivateLayout";
import { PageHeader } from "../../components/ui/PageHeader";
import { EmptyState } from "../../components/ui/EmptyState";
import { Icon, icons } from "../../components/ui/Icon";
import { MyGamesService } from "../../services/games/my-games.service";
import { escapeHtml } from "../../utils/escape";
import { formatDate, money } from "../admin/admin-format";
import {
  cleanupSelectedMedia,
  filesToUpload,
  renderSelectedMedia,
  updateGamePreview,
} from "./my-games-preview";

let myGames = [];

function dateInput(value) {
  if (!value) return "";
  return /^\d{4}-\d{2}-\d{2}/.test(value) ? value.slice(0, 10) : "";
}

function mediaLabel(tipo, index) {
  if (tipo === "screenshot") return `Screenshot ${index + 1}`;
  if (tipo === "cover") return "Capa";
  if (tipo === "banner") return "Banner";
  return tipo;
}

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
        <div></div>
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
    <form id="my-game-form" data-resource-id="${game?.id || ""}" class="admin-resource-form">
      <div class="admin-form-section-heading admin-form-wide">
        <p>Informações e mídias</p>
        <h3>Dados do jogo</h3>
        <span>Preencha os campos e acompanhe a apresentação no catálogo.</span>
      </div>
      <label>Título<input name="titulo" maxlength="255" value="${escapeHtml(game?.titulo || "")}" required></label>
      <label>Descrição curta<input name="descricao_curta" maxlength="300" value="${escapeHtml(game?.descricao_curta || "")}"></label>
      <label class="admin-form-wide">Descrição completa<textarea name="descricao_longa" rows="4">${escapeHtml(game?.descricao_longa || "")}</textarea></label>
      <label>Preço<input name="preco" type="number" min="0" step="0.01" value="${game?.preco ?? ""}" required></label>
      <label>Data de lançamento<input name="release_date" type="date" value="${dateInput(game?.release_date)}"></label>
      <label>Status<select name="status">
        <option value="draft" ${!game || game?.status === "draft" ? "selected" : ""}>Rascunho</option>
        <option value="published" ${game?.status === "published" ? "selected" : ""}>Publicado</option>
        <option value="archived" ${game?.status === "archived" ? "selected" : ""}>Arquivado</option>
      </select></label>
      <label>Tags<input name="tags" value="${escapeHtml((game?.tags || []).join(", "))}" placeholder="RPG, Ação, Indie"></label>
      <fieldset class="admin-media-fields admin-form-wide">
        <legend>Mídias do jogo</legend>
        <p>JPEG, PNG ou GIF de até 10 MB. Capa e banner substituem a imagem atual.</p>
        <div class="admin-media-inputs">
          <label>Capa<input name="cover" type="file" accept="image/jpeg,image/png,image/gif"></label>
          <label>Banner<input name="banner" type="file" accept="image/jpeg,image/png,image/gif"></label>
          <label>Capturas de tela<input name="screenshots" type="file" accept="image/jpeg,image/png,image/gif" multiple></label>
        </div>
        <div class="admin-media-preview" data-media-preview aria-live="polite">
          ${(game?.midias || []).map((media, index) => `
            <figure class="admin-media-item" data-existing-media="${media.id}" data-media-type="${media.tipo}">
              <img src="${escapeHtml(media.url)}" alt="">
              <figcaption><span>${mediaLabel(media.tipo, index)}</span>
                <button type="button" data-my-game-delete-media="${media.id}" data-game-id="${game.id}" aria-label="Remover ${mediaLabel(media.tipo, index)}">${Icon(icons.trash, { className: "w-4 h-4" })}</button>
              </figcaption>
            </figure>
          `).join("")}
        </div>
      </fieldset>
      <section class="admin-game-preview admin-form-wide" data-game-preview aria-labelledby="my-games-preview-title">
        <div class="admin-game-preview__heading">
          <div>
            <p>Prévia ao vivo</p>
            <h3 id="my-games-preview-title">Como o jogo vai aparecer</h3>
          </div>
          <span data-preview-status>Rascunho</span>
        </div>
        <div class="admin-game-preview__stage">
          <article class="admin-game-preview__hero">
            <div class="admin-game-preview__hero-media" data-preview-banner>
              <img data-preview-image alt="">
              <div data-preview-placeholder>${Icon(icons.gamepad, { className: "w-7 h-7" })}<span>Banner do jogo</span></div>
            </div>
            <div class="admin-game-preview__hero-shade" aria-hidden="true"></div>
            <div class="admin-game-preview__hero-content">
              <span data-preview-release>Data a definir</span>
              <h4 data-preview-title>Título do jogo</h4>
              <p data-preview-description>Uma breve descrição vai aparecer aqui.</p>
              <div data-preview-tags></div>
              <strong data-preview-price>R$ 0,00</strong>
            </div>
          </article>
          <article class="admin-game-preview__card">
            <div class="admin-game-preview__cover" data-preview-cover>
              <img data-preview-image alt="">
              <div data-preview-placeholder>${Icon(icons.gamepad, { className: "w-7 h-7" })}<span>Capa do jogo</span></div>
            </div>
            <div class="admin-game-preview__card-body">
              <span>Prévia do catálogo</span>
              <h4 data-preview-card-title>Título do jogo</h4>
              <p data-preview-card-description>Jogo digital</p>
              <strong data-preview-card-price>R$ 0,00</strong>
            </div>
          </article>
        </div>
        <div class="admin-game-preview__screenshots">
          <span>Capturas de tela</span>
          <div data-preview-screenshots></div>
        </div>
      </section>
      <button class="button-primary admin-form-wide" type="submit">${game ? "Salvar alterações" : "Lançar jogo"}</button>
      <p class="admin-form-error admin-form-wide hidden" role="alert"></p>
    </form>`;
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
    const current = myGames.find((game) => String(game.id) === id);
    const payload = {
      titulo: data.get("titulo"),
      descricao_curta: data.get("descricao_curta"),
      descricao_longa: data.get("descricao_longa"),
      preco: Number(data.get("preco")),
      release_date: data.get("release_date") || null,
      status: data.get("status"),
      tags: String(data.get("tags") || "").split(",").map((tag) => tag.trim()).filter(Boolean),
      system_requirements: [],
      languages: [],
      updates: [],
      categoria_ids: [],
    };
    const savedGame = id
      ? await MyGamesService.updateGame(id, payload)
      : await MyGamesService.createGame(payload);
    const uploads = [
      ...filesToUpload(data.get("cover"), "cover"),
      ...filesToUpload(data.get("banner"), "banner"),
      ...Array.from(data.getAll("screenshots")).flatMap((file) => filesToUpload(file, "screenshot")),
    ];
    for (const upload of uploads) {
      await MyGamesService.uploadGameMedia(savedGame.id, upload.type, upload.file);
    }
    document.getElementById("my-games-dialog").close();
    window.dispatchEvent(new CustomEvent("rerender"));
  } catch (requestError) {
    error.textContent = requestError.message;
    error.classList.remove("hidden");
    submit.disabled = false;
  }
}

export function afterRender() {
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
    if (event.target.type === "file") renderSelectedMedia(event.target.form);
    else if (event.target.form?.id === "my-game-form") updateGamePreview(event.target.form);
  });

  dialog?.addEventListener("input", (event) => {
    if (event.target.form?.id === "my-game-form") updateGamePreview(event.target.form);
  });

  dialog?.addEventListener("close", (event) => {
    cleanupSelectedMedia(event.currentTarget);
  });

  dialog?.addEventListener("click", async (event) => {
    const button = event.target.closest("[data-my-game-delete-media]");
    if (!button) return;
    button.disabled = true;
    try {
      await MyGamesService.deleteGameMedia(button.dataset.gameId, button.dataset.myGameDeleteMedia);
      button.closest("[data-existing-media]")?.remove();
      updateGamePreview(button.form);
      showToast("Mídia removida.");
    } catch (error) {
      button.disabled = false;
      showToast(error.message, true);
    }
  });
}
