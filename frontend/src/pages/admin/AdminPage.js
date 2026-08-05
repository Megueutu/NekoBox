import { AdminLayout } from "../../app/layouts/AdminLayout";
import { navigate } from "../../app/router/navigate";
import { Icon, icons } from "../../components/ui/Icon";
import { AdminService } from "../../services/admin/admin.service";
import { AuthService } from "../../services/auth/auth.service";
import { escapeHtml } from "../../utils/escape";
import { dateTime, formatDate, money } from "./admin-format";
import {
  cleanupSelectedMedia,
  getSelectedMediaUploads,
  removeSelectedMedia,
  renderSelectedMedia,
  selectMediaFiles,
  updateGamePreview,
} from "./admin-game-preview";

let activeSection = "dashboard";
let adminState = { dashboard: null, giftCards: [], users: [], games: [] };

function fieldLabel(id, label, { help = "", required = false } = {}) {
  return `<span class="admin-field__label"><label for="${id}">${label}${required ? '<span class="field-required" aria-hidden="true">*</span>' : ""}</label>${help ? `<button class="field-tooltip" type="button" aria-label="${label}: ${help}" data-tooltip="${help}">${Icon(icons.help, { className: "w-3.5 h-3.5" })}</button>` : ""}</span>`;
}

function emptyRow(columns, message) {
  return `<tr><td colspan="${columns}" class="admin-empty">${message}</td></tr>`;
}

function dashboardEmptyState(title, description, icon = icons.dashboard) {
  return `<div class="admin-empty-state"><span>${Icon(icon, { className: "w-5 h-5" })}</span><div><strong>${title}</strong><p>${description}</p></div></div>`;
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
              : dashboardEmptyState("A evolução começa na primeira venda", "Quando um pagamento for aprovado, a receita diária aparecerá aqui.")
          }
        </article>
        <article class="admin-panel">
          <div class="admin-panel__heading"><div><p>Top 5</p><h2>Jogos mais vendidos</h2></div></div>
          <ol class="admin-ranking">
            ${(dashboard.mais_vendidos || []).map((game, index) => `
              <li><span>${String(index + 1).padStart(2, "0")}</span><div><strong>${escapeHtml(game.titulo)}</strong><small>${game.vendas} vendas</small></div><b>${money.format(game.receita)}</b></li>
            `).join("") || `<li class="admin-ranking__empty">${dashboardEmptyState("O ranking será montado aqui", "Os jogos com mais compras aprovadas aparecem neste espaço.", icons.gamepad)}</li>`}
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
            `).join("") || `<tr><td colspan="4">${dashboardEmptyState("Ainda não há vendas recentes", "As compras aprovadas aparecerão nesta lista assim que acontecerem.", icons.circleCheck)}</td></tr>`}
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
            <div class="admin-money-input"><span>R$</span><input id="gift-card-value" class="ui-control" name="valor" type="number" min="1" max="10000" step="0.01" value="50.00" required></div>
            <button class="button-primary" type="submit">${Icon(icons.gift, { className: "w-4 h-4" })} Gerar código</button>
          </form>
          <div id="gift-card-result" class="admin-generated-code hidden" role="status" aria-live="polite"></div>
        </article>
        <aside class="admin-panel admin-security-note">
          ${Icon(icons.shieldCheck, { className: "w-5 h-5" })}
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
    <header><p>${game ? "Editar catálogo" : "Novo catálogo"}</p><h2 id="admin-dialog-title">${game ? escapeHtml(game.titulo) : "Cadastrar jogo"}</h2></header>
    <form id="admin-resource-form" data-kind="game" data-resource-id="${game?.id || ""}" class="admin-resource-form">
      <div class="admin-form-section-heading admin-form-wide">
        <p>Cadastro do catálogo</p>
        <h3>Dados do jogo</h3>
        <span>Comece pelo conteúdo que aparece para quem está navegando pela loja.</span>
      </div>
      <section class="admin-form-group admin-form-wide" aria-labelledby="admin-game-content-title">
        <div class="admin-form-group__heading">
          <span>01</span>
          <div><h3 id="admin-game-content-title">Conteúdo do catálogo</h3><p>É o que vai apresentar o jogo na loja.</p></div>
        </div>
        <div class="admin-form-grid">
          <div class="admin-field admin-field--wide">
            ${fieldLabel("admin-game-title", "Título", { required: true, help: "Use o nome pelo qual o jogo é conhecido." })}
            <input id="admin-game-title" class="ui-control" name="titulo" maxlength="255" value="${escapeHtml(game?.titulo || "")}" placeholder="Ex.: Hades II" required>
          </div>
          <div class="admin-field admin-field--wide">
            ${fieldLabel("admin-game-short-description", "Descrição curta", { help: "Resumo exibido nos cards e nos resultados de busca." })}
            <input id="admin-game-short-description" class="ui-control" name="descricao_curta" maxlength="300" value="${escapeHtml(game?.descricao_curta || "")}" placeholder="Uma frase que desperta interesse no catálogo">
          </div>
          <div class="admin-field admin-field--wide">
            ${fieldLabel("admin-game-long-description", "Descrição completa", { help: "Explique a experiência para ajudar na decisão de compra." })}
            <textarea id="admin-game-long-description" class="ui-control ui-control--area" name="descricao_longa" rows="5" placeholder="Apresente a proposta, mecânicas e o que torna o jogo especial.">${escapeHtml(game?.descricao_longa || "")}</textarea>
          </div>
        </div>
      </section>
      <section class="admin-form-group admin-form-wide" aria-labelledby="admin-game-publication-title">
        <div class="admin-form-group__heading">
          <span>02</span>
          <div><h3 id="admin-game-publication-title">Publicação e descoberta</h3><p>Defina preço, disponibilidade e como o jogo será encontrado.</p></div>
        </div>
        <div class="admin-form-grid">
          <div class="admin-field">
            ${fieldLabel("admin-game-price", "Preço", { required: true, help: "Informe 0 para disponibilizar o jogo gratuitamente." })}
            <span class="admin-input-prefix">${Icon(icons.circleDollar, { className: "w-4 h-4" })}<input id="admin-game-price" class="ui-control" name="preco" type="number" min="0" step="0.01" inputmode="decimal" value="${game?.preco ?? ""}" placeholder="0,00" required></span>
          </div>
          <div class="admin-field">
            ${fieldLabel("admin-game-release-date", "Data de lançamento", { help: "Opcional. Você pode definir essa data depois." })}
            <input id="admin-game-release-date" class="ui-control" name="data_lancamento" type="date" value="${game?.data_lancamento || ""}">
          </div>
          <div class="admin-field">
            ${fieldLabel("admin-game-status", "Status", { help: "Rascunhos não aparecem na vitrine." })}
            <select id="admin-game-status" class="ui-control" name="status"><option value="draft" ${game?.status === "draft" ? "selected" : ""}>Rascunho</option><option value="published" ${game?.status === "published" ? "selected" : ""}>Publicado</option><option value="archived" ${game?.status === "archived" ? "selected" : ""}>Arquivado</option></select>
          </div>
          <div class="admin-field">
            ${fieldLabel("admin-game-tags", "Tags", { help: "Separe os termos por vírgula." })}
            <input id="admin-game-tags" class="ui-control" name="tags" value="${escapeHtml((game?.tags || []).join(", "))}" placeholder="RPG, Ação, Indie">
          </div>
        </div>
      </section>
      <fieldset class="admin-media-fields admin-form-wide">
        <legend>Mídias do jogo</legend>
        <p>JPG, JPEG, PNG ou GIF de até 10 MB. Capa, banner e pôster substituem a imagem atual; inclua até 10 capturas.</p>
        <div class="admin-media-inputs">
          <label class="admin-media-picker">
            <input name="cover" type="file" accept=".jpg,.jpeg,.png,.gif,image/jpeg,image/png,image/gif">
            <span class="admin-media-picker__icon">${Icon(icons.upload, { className: "w-4 h-4" })}</span>
            <span><strong>Capa</strong><small>Enviar imagem</small></span>
            <span class="admin-media-picker__action">Selecionar</span>
          </label>
          <label class="admin-media-picker">
            <input name="banner" type="file" accept=".jpg,.jpeg,.png,.gif,image/jpeg,image/png,image/gif">
            <span class="admin-media-picker__icon">${Icon(icons.upload, { className: "w-4 h-4" })}</span>
            <span><strong>Banner</strong><small>Enviar imagem</small></span>
            <span class="admin-media-picker__action">Selecionar</span>
          </label>
          <label class="admin-media-picker">
            <input name="poster" type="file" accept=".jpg,.jpeg,.png,.gif,image/jpeg,image/png,image/gif">
            <span class="admin-media-picker__icon">${Icon(icons.upload, { className: "w-4 h-4" })}</span>
            <span><strong>Pôster</strong><small>Imagem quadrada do catálogo</small></span>
            <span class="admin-media-picker__action">Selecionar</span>
          </label>
          <label class="admin-media-picker admin-media-picker--screenshots">
            <input name="screenshots" type="file" accept=".jpg,.jpeg,.png,.gif,image/jpeg,image/png,image/gif" multiple>
            <span class="admin-media-picker__icon">${Icon(icons.upload, { className: "w-4 h-4" })}</span>
            <span><strong>Capturas de tela</strong><small>Selecione várias imagens</small></span>
            <output class="admin-media-picker__count" data-screenshot-count>0 / 10 capturas</output>
          </label>
        </div>
        <p class="admin-media-selection-status" data-media-selection-status role="status" aria-live="polite"></p>
        <div class="admin-media-preview" data-media-preview aria-live="polite">
          ${(game?.midias || []).map((media) => `
            <figure class="admin-media-item" data-existing-media="${media.id}" data-media-type="${media.tipo}">
              <img src="${escapeHtml(media.url)}" alt="">
              <figcaption><span>${media.tipo === "screenshot" ? `Screenshot ${media.posicao}` : media.tipo}</span>
                <button type="button" data-admin-delete-media="${media.id}" data-game-id="${game.id}" aria-label="Remover ${media.tipo}">${Icon(icons.trash, { className: "w-4 h-4" })}</button>
              </figcaption>
            </figure>
          `).join("")}
        </div>
      </fieldset>
      <section class="admin-game-preview admin-form-wide" data-game-preview aria-labelledby="admin-game-preview-title">
        <div class="admin-game-preview__heading">
          <div>
            <p>Prévia ao vivo</p>
            <h3 id="admin-game-preview-title">Como o jogo vai aparecer</h3>
          </div>
          <span data-preview-status>Rascunho</span>
        </div>
        <div class="admin-game-preview__stage">
          <article class="admin-game-preview__hero">
            <div class="admin-game-preview__hero-media" data-preview-banner>
              <img data-preview-image alt="">
              <div data-preview-placeholder>${Icon(icons.gamepad, { className: "w-5 h-5" })}<span>Banner do jogo</span></div>
            </div>
            <div class="admin-game-preview__hero-shade" aria-hidden="true"></div>
            <div class="admin-game-preview__hero-content">
              <span data-preview-release>Data a definir</span>
              <h4 data-preview-title>Título do jogo</h4>
              <p data-preview-description>Uma breve descrição vai aparecer aqui.</p>
              <div data-preview-tags></div>
              <strong data-preview-price>Gratuito</strong>
            </div>
          </article>
          <article class="admin-game-preview__card">
            <div class="admin-game-preview__poster" data-preview-poster>
              <img data-preview-image alt="">
              <div data-preview-placeholder>${Icon(icons.gamepad, { className: "w-5 h-5" })}<span>Pôster do jogo</span></div>
            </div>
            <div class="admin-game-preview__card-body">
              <span>Prévia do catálogo</span>
              <h4 data-preview-card-title>Título do jogo</h4>
              <p data-preview-card-description>Jogo digital</p>
              <strong data-preview-card-price>Gratuito</strong>
            </div>
          </article>
        </div>
        <div class="admin-game-preview__screenshots">
          <span>Capturas de tela</span>
          <div data-preview-screenshots></div>
        </div>
      </section>
      <button class="button-primary admin-form-wide" type="submit">${game ? "Salvar alterações" : "Cadastrar jogo"}</button>
      <p class="admin-form-error admin-form-wide hidden" role="alert"></p>
    </form>`;
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
        descricao_curta: data.get("descricao_curta"),
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
