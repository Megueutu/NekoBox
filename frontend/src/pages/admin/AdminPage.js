import { AdminLayout } from "../../app/layouts/AdminLayout";
import { navigate } from "../../app/router/navigate";
import { Icon, icons } from "../../components/ui/Icon";
import { AdminService } from "../../services/admin/admin.service";
import { AuthService } from "../../services/auth/auth.service";
import { escapeHtml } from "../../utils/escape";

let activeSection = "dashboard";
let adminState = { dashboard: null, giftCards: [], users: [], games: [] };

const money = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });
const compactDate = new Intl.DateTimeFormat("pt-BR", { dateStyle: "short" });
const dateTime = new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short" });

function formatDate(value, formatter = compactDate) {
  if (!value) return "—";
  const normalized = /^\d{4}-\d{2}-\d{2}$/.test(value) ? `${value}T00:00:00` : value;
  return formatter.format(new Date(normalized));
}

function emptyRow(columns, message) {
  return `<tr><td colspan="${columns}" class="admin-empty">${message}</td></tr>`;
}

function pageHeader(eyebrow, title, description, action = "") {
  return `
    <header class="admin-page-header">
      <div>
        <p>${eyebrow}</p>
        <h1>${title}</h1>
        <span>${description}</span>
      </div>
      ${action}
    </header>
  `;
}

function dashboardSection(dashboard) {
  const evolution = dashboard.evolucao || [];
  const maxRevenue = Math.max(...evolution.map((item) => Number(item.receita)), 1);
  return `
    <section class="admin-section ${activeSection === "dashboard" ? "" : "hidden"}" data-admin-panel="dashboard">
      ${pageHeader("Visão geral", "Dashboard de vendas", "Acompanhe a operação e identifique os jogos com maior tração.")}
      <div class="admin-kpis">
        <article><span>Receita aprovada</span><strong>${money.format(dashboard.receita || 0)}</strong><small>${dashboard.vendas} vendas</small></article>
        <article><span>Ticket médio</span><strong>${money.format(dashboard.ticket_medio || 0)}</strong><small>${dashboard.compradores} compradores</small></article>
        <article><span>Usuários</span><strong>${dashboard.usuarios}</strong><small>contas cadastradas</small></article>
        <article><span>Catálogo ativo</span><strong>${dashboard.jogos_ativos}</strong><small>jogos publicados</small></article>
      </div>
      <div class="admin-dashboard-grid">
        <article class="admin-panel admin-chart-panel">
          <div class="admin-panel__heading"><div><p>Receita por dia</p><h2>Evolução das vendas</h2></div><span>Pagamentos aprovados</span></div>
          ${
            evolution.length
              ? `<ol class="admin-chart">
                  ${evolution.map((item) => {
                    const height = Math.max((Number(item.receita) / maxRevenue) * 100, 8);
                    return `<li style="--bar-height:${height}%">
                      <span class="sr-only">${formatDate(item.data)}: ${money.format(item.receita)}, ${item.vendas} vendas</span>
                      <i aria-hidden="true"></i><small>${formatDate(item.data)}</small>
                    </li>`;
                  }).join("")}
                </ol>`
              : '<div class="admin-placeholder">As vendas aprovadas aparecerão aqui.</div>'
          }
        </article>
        <article class="admin-panel">
          <div class="admin-panel__heading"><div><p>Top 5</p><h2>Jogos mais vendidos</h2></div></div>
          <ol class="admin-ranking">
            ${(dashboard.mais_vendidos || []).map((game, index) => `
              <li><span>${String(index + 1).padStart(2, "0")}</span><div><strong>${escapeHtml(game.titulo)}</strong><small>${game.vendas} vendas</small></div><b>${money.format(game.receita)}</b></li>
            `).join("") || '<li class="admin-placeholder">Nenhuma venda aprovada.</li>'}
          </ol>
        </article>
      </div>
      <article class="admin-panel">
        <div class="admin-panel__heading"><div><p>Atividade</p><h2>Vendas recentes</h2></div></div>
        <div class="admin-table-wrap"><table class="admin-table">
          <thead><tr><th>Data</th><th>Cliente</th><th>Jogo</th><th>Valor</th></tr></thead>
          <tbody>
            ${(dashboard.vendas_recentes || []).map((sale) => `
              <tr><td>${formatDate(sale.criado_em, dateTime)}</td><td>${escapeHtml(sale.usuario)}</td><td>${escapeHtml(sale.jogo)}</td><td><strong>${money.format(sale.valor)}</strong></td></tr>
            `).join("") || emptyRow(4, "Nenhuma venda aprovada.")}
          </tbody>
        </table></div>
      </article>
    </section>
  `;
}

function giftCardsSection(giftCards) {
  return `
    <section class="admin-section ${activeSection === "gift-cards" ? "" : "hidden"}" data-admin-panel="gift-cards">
      ${pageHeader("Créditos", "Gift cards", "Gere códigos de uso único. O código completo só é exibido no momento da criação.")}
      <div class="admin-gift-grid">
        <article class="admin-panel admin-gift-generator">
          <div class="admin-panel__heading"><div><p>Novo código</p><h2>Gerar gift card</h2></div></div>
          <form id="gift-card-form">
            <label for="gift-card-value">Valor do crédito</label>
            <div class="admin-money-input"><span>R$</span><input id="gift-card-value" name="valor" type="number" min="1" max="10000" step="0.01" value="50.00" required></div>
            <button class="button-primary" type="submit">${Icon(icons.gift, { className: "w-4 h-4" })} Gerar código</button>
          </form>
          <div id="gift-card-result" class="admin-generated-code hidden" role="status" aria-live="polite"></div>
        </article>
        <aside class="admin-panel admin-security-note">
          ${Icon(icons.shieldCheck, { className: "w-6 h-6" })}
          <div><h2>Armazenamento seguro</h2><p>O NexusPlay salva apenas o hash SHA-256. Copie o código antes de sair desta tela: ele não poderá ser recuperado depois.</p></div>
        </aside>
      </div>
      <article class="admin-panel">
        <div class="admin-panel__heading"><div><p>Histórico</p><h2>Códigos gerados</h2></div><span>${giftCards.length} registros</span></div>
        <div class="admin-table-wrap"><table class="admin-table">
          <thead><tr><th>ID</th><th>Valor</th><th>Status</th><th>Resgatado por</th><th>Criado em</th></tr></thead>
          <tbody id="gift-card-table-body">
            ${giftCards.map((card) => `
              <tr><td>#${card.id}</td><td><strong>${money.format(card.valor)}</strong></td><td><span class="admin-status admin-status--${card.resgatado ? "muted" : "success"}">${card.resgatado ? "Resgatado" : "Disponível"}</span></td><td>${escapeHtml(card.resgatado_por || "—")}</td><td>${formatDate(card.criado_em, dateTime)}</td></tr>
            `).join("") || emptyRow(5, "Nenhum gift card gerado.")}
          </tbody>
        </table></div>
      </article>
    </section>
  `;
}

function usersSection(users) {
  const action = `<button type="button" class="button-primary admin-header-action" data-admin-create="user">${Icon(icons.plus, { className: "w-4 h-4" })} Novo usuário</button>`;
  return `
    <section class="admin-section ${activeSection === "users" ? "" : "hidden"}" data-admin-panel="users">
      ${pageHeader("Acessos", "Usuários", "Gerencie contas e saldos sem alterar o papel do administrador único.", action)}
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
      ${pageHeader("Catálogo", "Jogos", "Crie, publique e arquive títulos do marketplace.", action)}
      <article class="admin-panel">
        <div class="admin-panel__heading"><div><p>Catálogo completo</p><h2>${games.length} jogos</h2></div></div>
        <div class="admin-table-wrap"><table class="admin-table admin-games-table">
          <thead><tr><th>Jogo</th><th>Preço</th><th>Status</th><th>Lançamento</th><th><span class="sr-only">Ações</span></th></tr></thead>
          <tbody>
            ${games.map((game) => `
              <tr>
                <td><div class="admin-game-cell"><div class="admin-game-cover" ${game.capa_url ? `style="background-image:url('${escapeHtml(game.capa_url)}')"` : ""}>${game.capa_url ? "" : Icon(icons.gamepad, { className: "w-5 h-5" })}</div><div><strong>${escapeHtml(game.titulo)}</strong><small>${escapeHtml(game.slug)}</small></div></div></td>
                <td>${money.format(game.preco)}</td><td><span class="admin-status admin-status--${game.status === "published" ? "success" : game.status === "archived" ? "muted" : "warning"}">${escapeHtml(game.status)}</span></td>
                <td>${formatDate(game.data_lancamento)}</td>
                <td><div class="admin-row-actions">
                  <button type="button" data-admin-edit-game="${game.id}" aria-label="Editar ${escapeHtml(game.titulo)}">${Icon(icons.pencil, { className: "w-4 h-4" })}</button>
                  <button type="button" class="admin-danger" data-admin-delete-game="${game.id}" aria-label="Excluir ${escapeHtml(game.titulo)}">${Icon(icons.trash, { className: "w-4 h-4" })}</button>
                </div></td>
              </tr>
            `).join("") || emptyRow(5, "Nenhum jogo cadastrado.")}
          </tbody>
        </table></div>
      </article>
    </section>
  `;
}

function adminDialog() {
  return `
    <dialog id="admin-dialog" class="admin-dialog">
      <div class="admin-dialog__frame">
        <button type="button" class="admin-dialog__close" data-admin-dialog-close aria-label="Fechar">${Icon(icons.x, { className: "w-5 h-5" })}</button>
        <div id="admin-dialog-content"></div>
      </div>
    </dialog>
    <p id="admin-toast" class="admin-toast hidden" role="status" aria-live="polite"></p>
  `;
}

export default async function AdminPage() {
  const [dashboard, giftCards, users, games] = await Promise.all([
    AdminService.getDashboard(),
    AdminService.getGiftCards(),
    AdminService.getUsers(),
    AdminService.getGames(),
  ]);
  adminState = { dashboard, giftCards, users, games };
  const content = `
    ${dashboardSection(dashboard)}
    ${giftCardsSection(giftCards)}
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
  content.innerHTML = `
    <header><p>${user ? "Editar conta" : "Nova conta"}</p><h2>${user ? escapeHtml(user.nome_usuario) : "Criar usuário"}</h2></header>
    <form id="admin-resource-form" data-kind="user" data-resource-id="${user?.id || ""}" class="admin-resource-form">
      <label>Nome de usuário<input name="nome_usuario" minlength="3" maxlength="50" value="${escapeHtml(user?.nome_usuario || "")}" required></label>
      <label>E-mail<input name="email" type="email" value="${escapeHtml(user?.email || "")}" required></label>
      <label>${user ? "Nova senha (opcional)" : "Senha"}<input name="senha" type="password" ${user ? "" : "required"} autocomplete="new-password"></label>
      <label>Saldo<input name="saldo" type="number" min="0" step="0.01" value="${user?.saldo ?? "1000.00"}" required></label>
      <p class="admin-form-hint">Senha: 8+ caracteres, maiúscula, minúscula, número e símbolo.</p>
      <button class="button-primary" type="submit">${user ? "Salvar alterações" : "Criar usuário"}</button>
      <p class="admin-form-error hidden" role="alert"></p>
    </form>`;
  dialog.showModal();
  content.querySelector("input")?.focus();
}

function openGameDialog(game = null) {
  const dialog = document.getElementById("admin-dialog");
  const content = document.getElementById("admin-dialog-content");
  content.innerHTML = `
    <header><p>${game ? "Editar catálogo" : "Novo catálogo"}</p><h2>${game ? escapeHtml(game.titulo) : "Cadastrar jogo"}</h2></header>
    <form id="admin-resource-form" data-kind="game" data-resource-id="${game?.id || ""}" class="admin-resource-form">
      <label>Título<input name="titulo" maxlength="255" value="${escapeHtml(game?.titulo || "")}" required></label>
      <label>Descrição curta<input name="descricao_curta" maxlength="300" value="${escapeHtml(game?.descricao_curta || "")}"></label>
      <label class="admin-form-wide">Descrição completa<textarea name="descricao_longa" rows="4">${escapeHtml(game?.descricao_longa || "")}</textarea></label>
      <label>Preço<input name="preco" type="number" min="0" step="0.01" value="${game?.preco ?? ""}" required></label>
      <label>Data de lançamento<input name="data_lancamento" type="date" value="${game?.data_lancamento || ""}"></label>
      <label>Status<select name="status"><option value="draft" ${game?.status === "draft" ? "selected" : ""}>Rascunho</option><option value="published" ${game?.status === "published" ? "selected" : ""}>Publicado</option><option value="archived" ${game?.status === "archived" ? "selected" : ""}>Arquivado</option></select></label>
      <label>Tags<input name="tags" value="${escapeHtml((game?.tags || []).join(", "))}" placeholder="RPG, Ação, Indie"></label>
      <button class="button-primary admin-form-wide" type="submit">${game ? "Salvar alterações" : "Cadastrar jogo"}</button>
      <p class="admin-form-error admin-form-wide hidden" role="alert"></p>
    </form>`;
  dialog.showModal();
  content.querySelector("input")?.focus();
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
        descricao_curta: data.get("descricao_curta"),
        descricao_longa: data.get("descricao_longa"),
        preco: Number(data.get("preco")),
        data_lancamento: data.get("data_lancamento") || null,
        status: data.get("status"),
        tags: String(data.get("tags") || "").split(",").map((tag) => tag.trim()).filter(Boolean),
        categoria_ids: current?.categoria_ids || [],
      };
      if (id) await AdminService.updateGame(id, payload);
      else await AdminService.createGame(payload);
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

  document.getElementById("gift-card-form")?.addEventListener("submit", async (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    const button = form.querySelector("button");
    button.disabled = true;
    try {
      const result = await AdminService.generateGiftCard(Number(new FormData(form).get("valor")));
      const output = document.getElementById("gift-card-result");
      output.innerHTML = `<span>Código gerado</span><strong>${escapeHtml(result.codigo)}</strong><button type="button" data-copy-code="${escapeHtml(result.codigo)}">${Icon(icons.copy, { className: "w-4 h-4" })} Copiar</button><small>Este código não será exibido novamente.</small>`;
      output.classList.remove("hidden");
      output.querySelector("button").focus();
      adminState.giftCards.unshift({ ...result, resgatado: false, resgatado_por: null });
    } catch (error) {
      showToast(error.message, true);
    } finally {
      button.disabled = false;
    }
  });

  document.getElementById("admin-content")?.addEventListener("click", async (event) => {
    const copyButton = event.target.closest("[data-copy-code]");
    if (copyButton) {
      try {
        await navigator.clipboard.writeText(copyButton.dataset.copyCode);
        showToast("Código copiado.");
      } catch {
        showToast("Não foi possível copiar. Selecione o código manualmente.", true);
      }
      return;
    }

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
}
