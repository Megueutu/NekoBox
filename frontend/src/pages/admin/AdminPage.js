import { AdminLayout } from "../../app/layouts/AdminLayout";
import { navigate } from "../../app/router/navigate";
import { Icon, icons } from "../../components/ui/Icon";
import { GameResourceForm } from "../../components/GameResourceForm";
import { AdminService } from "../../services/admin.service";
import { AuthService } from "../../services/auth.service";
import { escapeHtml } from "../../utils/escape";
import { formatPrice } from "../../utils/format";
import { formatDate, money } from "./admin-format";
import {
  cleanupSelectedMedia,
  getSelectedMediaUploads,
  removeSelectedMedia,
  renderSelectedMedia,
  selectMediaFiles,
  updateGamePreview,
} from "./admin-game-preview";

let activeSection = "users";
let adminState = { users: [], games: [] };

function emptyRow(columns, message) {
  return `<tr><td colspan="${columns}" class="admin-empty">${message}</td></tr>`;
}

function pageHeader(title, description, action = "") {
  return `
    <header class="admin-page-header">
      <div>
        <h1>${title}</h1>
        <span>${description}</span>
      </div>
      ${action}
    </header>
  `;
}

function usersSection(users) {
  const action = `<button type="button" class="button-primary admin-header-action" data-admin-create="user">${Icon(icons.plus, { className: "w-4 h-4" })} Novo usuário</button>`;
  return `
    <section class="admin-section ${activeSection === "users" ? "" : "hidden"}" data-admin-panel="users">
      ${pageHeader("Usuários", "Gerencie contas e saldos sem alterar o papel do administrador único.", action)}
      <article class="admin-panel">
        <div class="admin-panel__heading"><div><p>Base de usuários</p><h2>${users.length} contas</h2></div></div>
        <div class="admin-table-wrap"><table class="admin-table">
          <thead><tr><th>Usuário</th><th>E-mail</th><th>Saldo</th><th>Papel</th><th>Criado em</th><th><span class="sr-only">Ações</span></th></tr></thead>
          <tbody>
            ${users.map((user) => `
              <tr>
                <td><strong>${escapeHtml(user.nome_usuario)}</strong><small class="admin-cell-meta">#${user.id}</small></td>
                <td>${escapeHtml(user.email)}</td><td>${money.format(user.saldo)}</td>
                <td><span class="admin-status admin-status--${user.papel === "ADMIN" ? "brand" : "muted"}">${user.papel}</span></td>
                <td>${formatDate(user.criado_em)}</td>
                <td><div class="admin-row-actions">
                  <button type="button" data-admin-edit-user="${user.id}" aria-label="Editar ${escapeHtml(user.nome_usuario)}">${Icon(icons.pencil, { className: "w-4 h-4" })}</button>
                  ${user.papel === "ADMIN" ? "" : `<button type="button" class="admin-danger" data-admin-delete-user="${user.id}" aria-label="Excluir ${escapeHtml(user.nome_usuario)}">${Icon(icons.trash, { className: "w-4 h-4" })}</button>`}
                </div></td>
              </tr>
            `).join("") || emptyRow(6, "Nenhum usuário cadastrado.")}
          </tbody>
        </table></div>
      </article>
    </section>
  `;
}

function gamesSection(games) {
  const action = `<button type="button" class="button-primary admin-header-action" data-admin-create="game">${Icon(icons.plus, { className: "w-4 h-4" })} Novo jogo</button>`;
  return `
    <section class="admin-section ${activeSection === "games" ? "" : "hidden"}" data-admin-panel="games">
      ${pageHeader("Jogos", "Crie, publique e arquive títulos em nosso marketplace.", action)}
      <article class="admin-panel">
        <div class="admin-panel__heading"><div><p>Catálogo completo</p><h2>${games.length} jogos</h2></div></div>
        <div class="admin-table-wrap"><table class="admin-table admin-games-table">
          <tbody>
            ${games.map((game) => {
              const posterUrl = game.midias?.find((item) => (item.tipo || item.type) === "poster")?.url || "";
              return `
              <tr>
                <td><div class="admin-game-cell"><div class="admin-game-cover admin-game-cover--square" ${posterUrl ? `style="background-image:url('${escapeHtml(posterUrl)}')"` : ""}>${posterUrl ? "" : Icon(icons.gamepad, { className: "w-5 h-5" })}</div><div><strong>${escapeHtml(game.titulo)}</strong><small>${escapeHtml(game.slug)}</small></div></div></td>
                <td>${formatPrice(game.preco)}</td><td><span class="admin-status admin-status--${game.status === "published" ? "success" : game.status === "archived" ? "muted" : "warning"}">${escapeHtml(game.status)}</span></td>
                <td>${formatDate(game.data_lancamento)}</td>
                <td><div class="admin-row-actions">
                  <button type="button" data-admin-edit-game="${game.id}" aria-label="Editar ${escapeHtml(game.titulo)}">${Icon(icons.pencil, { className: "w-4 h-4" })}</button>
                  <button type="button" class="admin-danger" data-admin-delete-game="${game.id}" aria-label="Excluir ${escapeHtml(game.titulo)}">${Icon(icons.trash, { className: "w-4 h-4" })}</button>
                </div></td>
              </tr>
            `;
            }).join("") || emptyRow(5, "Nenhum jogo cadastrado.")}
          </tbody>
        </table></div>
      </article>
    </section>
  `;
}

function adminDialog() {
  return `
    <dialog id="admin-dialog" class="admin-dialog" aria-labelledby="admin-dialog-title">
      <div class="admin-dialog__frame">
        <button type="button" class="admin-dialog__close" data-admin-dialog-close aria-label="Fechar">${Icon(icons.x, { className: "w-5 h-5" })}</button>
        <div id="admin-dialog-content"></div>
      </div>
    </dialog>
    <p id="admin-toast" class="admin-toast hidden" role="status" aria-live="polite"></p>
  `;
}

export default async function AdminPage() {
  const [users, games] = await Promise.all([
    AdminService.getUsers(),
    AdminService.getGames(),
  ]);
  adminState = { users, games };
  const content = `
    ${usersSection(users)}
    ${gamesSection(games)}
    ${adminDialog()}
  `;
  return AdminLayout(content, activeSection);
}

function setSection(section) {
  activeSection = section;
  document.querySelectorAll("[data-admin-panel]").forEach((panel) => {
    panel.classList.toggle("hidden", panel.dataset.adminPanel !== section);
  });
  document.querySelectorAll("[data-admin-section]").forEach((button) => {
    const active = button.dataset.adminSection === section;
    button.classList.toggle("admin-nav__item--active", active);
    if (active) button.setAttribute("aria-current", "page");
    else button.removeAttribute("aria-current");
  });
  document.querySelector(`[data-admin-panel="${section}"] h1`)?.focus?.();
}

function showToast(message, error = false) {
  const toast = document.getElementById("admin-toast");
  toast.textContent = message;
  toast.classList.toggle("admin-toast--error", error);
  toast.classList.remove("hidden");
  window.setTimeout(() => toast.classList.add("hidden"), 4200);
}

function openUserDialog(user = null) {
  const dialog = document.getElementById("admin-dialog");
  const content = document.getElementById("admin-dialog-content");
  dialog.dataset.variant = "user";
  content.innerHTML = `
    <header><p>${user ? "Editar conta" : "Nova conta"}</p><h2 id="admin-dialog-title">${user ? escapeHtml(user.nome_usuario) : "Criar usuário"}</h2></header>
    <form id="admin-resource-form" data-kind="user" data-resource-id="${user?.id || ""}" class="admin-resource-form">
      <label>Nome de usuário <span class="field-required" aria-hidden="true">*</span><input class="ui-control" name="nome_usuario" minlength="3" maxlength="50" value="${escapeHtml(user?.nome_usuario || "")}" required></label>
      <label>E-mail <span class="field-required" aria-hidden="true">*</span><input class="ui-control" name="email" type="email" value="${escapeHtml(user?.email || "")}" required></label>
      <label>${user ? "Nova senha (opcional)" : 'Senha <span class="field-required" aria-hidden="true">*</span>'}<input class="ui-control" name="senha" type="password" ${user ? "" : "required"} autocomplete="new-password"></label>
      <label>Saldo <span class="field-required" aria-hidden="true">*</span><input class="ui-control" name="saldo" type="number" min="0" step="0.01" value="${user?.saldo ?? "1000.00"}" required></label>
      <button class="button-primary admin-form-wide" type="submit">${user ? "Salvar alterações" : "Criar usuário"}</button>
      <p class="admin-form-error admin-form-wide hidden" role="alert"></p>
    </form>`;
  dialog.showModal();
  content.querySelector("input")?.focus();
}

function openGameDialog(game = null) {
  const dialog = document.getElementById("admin-dialog");
  const content = document.getElementById("admin-dialog-content");
  dialog.dataset.variant = "game";
  content.innerHTML = `
    <header><h2 id="admin-dialog-title">${game ? escapeHtml(game.titulo) : "Cadastrar jogo"}</h2></header>
    ${GameResourceForm({
      formId: "admin-resource-form",
      idPrefix: "admin-game",
      game,
      submitLabel: game ? "Salvar alterações" : "Cadastrar jogo",
      introDescription: "Comece pelo conteúdo que aparece para quem está navegando pela loja.",
      mediaDeleteAttribute: "data-admin-delete-media",
    })}`;
  dialog.showModal();
  const form = content.querySelector("form");
  updateGamePreview(form);
  form.querySelector("input")?.focus();
}

async function submitResourceForm(form) {
  const data = new FormData(form);
  const id = form.dataset.resourceId;
  const error = form.querySelector(".admin-form-error");
  const submit = form.querySelector('button[type="submit"]');
  submit.disabled = true;
  error.classList.add("hidden");
  try {
    if (form.dataset.kind === "user") {
      const payload = {
        nome_usuario: data.get("nome_usuario"),
        email: data.get("email"),
        senha: data.get("senha") || null,
        saldo: Number(data.get("saldo")),
      };
      if (id) await AdminService.updateUser(id, payload);
      else await AdminService.createUser(payload);
    } else {
      const current = adminState.games.find((game) => String(game.id) === id);
      const payload = {
        titulo: data.get("titulo"),
        descricao_longa: data.get("descricao_longa"),
        preco: Number(data.get("preco")),
        data_lancamento: data.get("data_lancamento") || null,
        status: data.get("status"),
        tags: String(data.get("tags") || "").split(",").map((tag) => tag.trim()).filter(Boolean),
        categoria_ids: current?.categoria_ids || [],
      };
      const savedGame = id
        ? await AdminService.updateGame(id, payload)
        : await AdminService.createGame(payload);
      const uploads = getSelectedMediaUploads(form);
      for (const upload of uploads) {
        await AdminService.uploadGameMedia(savedGame.id, upload.type, upload.file);
      }
    }
    document.getElementById("admin-dialog").close();
    window.dispatchEvent(new CustomEvent("rerender"));
  } catch (requestError) {
    error.textContent = requestError.message;
    error.classList.remove("hidden");
    submit.disabled = false;
  }
}

export function afterRender() {
  document.querySelectorAll("[data-admin-section]").forEach((button) => {
    button.addEventListener("click", () => setSection(button.dataset.adminSection));
  });

  document.getElementById("admin-logout")?.addEventListener("click", async () => {
    await AuthService.logout();
    navigate("/login");
  });

  document.querySelector("[data-admin-dialog-close]")?.addEventListener("click", () => {
    document.getElementById("admin-dialog")?.close();
  });

  document.getElementById("admin-content")?.addEventListener("click", async (event) => {
    const create = event.target.closest("[data-admin-create]");
    if (create?.dataset.adminCreate === "user") openUserDialog();
    if (create?.dataset.adminCreate === "game") openGameDialog();

    const editUser = event.target.closest("[data-admin-edit-user]");
    if (editUser) openUserDialog(adminState.users.find((user) => String(user.id) === editUser.dataset.adminEditUser));
    const editGame = event.target.closest("[data-admin-edit-game]");
    if (editGame) openGameDialog(adminState.games.find((game) => String(game.id) === editGame.dataset.adminEditGame));

    const deleteUser = event.target.closest("[data-admin-delete-user]");
    if (deleteUser) {
      const user = adminState.users.find((item) => String(item.id) === deleteUser.dataset.adminDeleteUser);
      if (window.confirm(`Excluir o usuário ${user.nome_usuario}? Esta ação não pode ser desfeita.`)) {
        try {
          await AdminService.deleteUser(user.id);
          window.dispatchEvent(new CustomEvent("rerender"));
        } catch (error) {
          showToast(error.message, true);
        }
      }
    }

    const deleteGame = event.target.closest("[data-admin-delete-game]");
    if (deleteGame) {
      const game = adminState.games.find((item) => String(item.id) === deleteGame.dataset.adminDeleteGame);
      if (window.confirm(`Excluir o jogo ${game.titulo}? Esta ação não pode ser desfeita.`)) {
        try {
          await AdminService.deleteGame(game.id);
          window.dispatchEvent(new CustomEvent("rerender"));
        } catch (error) {
          showToast(error.message, true);
        }
      }
    }
  }, { once: false });

  document.getElementById("admin-dialog")?.addEventListener("submit", (event) => {
    if (event.target.id !== "admin-resource-form") return;
    event.preventDefault();
    submitResourceForm(event.target);
  });

  document.getElementById("admin-dialog")?.addEventListener("change", (event) => {
    if (event.target.type === "file") selectMediaFiles(event.target.form, event.target);
    else if (event.target.form?.dataset.kind === "game") updateGamePreview(event.target.form);
  });

  document.getElementById("admin-dialog")?.addEventListener("input", (event) => {
    if (event.target.form?.dataset.kind === "game") updateGamePreview(event.target.form);
  });

  document.getElementById("admin-dialog")?.addEventListener("close", (event) => {
    cleanupSelectedMedia(event.currentTarget);
  });

  document.getElementById("admin-dialog")?.addEventListener("dragover", (event) => {
    const picker = event.target.closest("[data-media-picker]");
    if (!picker) return;
    event.preventDefault();
    picker.classList.add("admin-media-picker--dragover");
  });

  document.getElementById("admin-dialog")?.addEventListener("dragleave", (event) => {
    const picker = event.target.closest("[data-media-picker]");
    if (!picker || picker.contains(event.relatedTarget)) return;
    picker.classList.remove("admin-media-picker--dragover");
  });

  document.getElementById("admin-dialog")?.addEventListener("drop", (event) => {
    const picker = event.target.closest("[data-media-picker]");
    if (!picker) return;
    event.preventDefault();
    picker.classList.remove("admin-media-picker--dragover");
    const input = picker.querySelector("input[type=file]");
    if (!input || !event.dataTransfer?.files?.length) return;
    input.files = event.dataTransfer.files;
    selectMediaFiles(input.form, input);
  });

  document.getElementById("admin-dialog")?.addEventListener("click", async (event) => {
    const selectedMedia = event.target.closest("[data-remove-selected-media]");
    if (selectedMedia) {
      const form = selectedMedia.closest("form");
      removeSelectedMedia(form, selectedMedia.dataset.mediaType, Number(selectedMedia.dataset.mediaIndex));
      return;
    }

    const button = event.target.closest("[data-admin-delete-media]");
    if (!button) return;
    button.disabled = true;
    try {
      await AdminService.deleteGameMedia(button.dataset.gameId, button.dataset.adminDeleteMedia);
      button.closest("[data-existing-media]")?.remove();
      renderSelectedMedia(button.closest("form"));
      showToast("Mídia removida.");
    } catch (error) {
      button.disabled = false;
      showToast(error.message, true);
    }
  });
}
