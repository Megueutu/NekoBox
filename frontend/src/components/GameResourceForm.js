import { Icon, icons } from "./ui/Icon";
import { fieldTooltip } from "./ui/field-tooltip";
import { escapeHtml } from "../utils/escape";

function fieldLabel(id, label, { help = "", required = false } = {}) {
  return `<span class="admin-field__label"><label for="${id}">${label}${required ? '<span class="field-required" aria-hidden="true">*</span>' : ""}</label>${fieldTooltip(label, help)}</span>`;
}

function mediaLabel(type, position) {
  if (type === "screenshot") return `Screenshot ${position || ""}`.trim();
  return { cover: "Capa", banner: "Banner", poster: "Capa de grid" }[type] || type;
}

export function GameResourceForm({
  formId,
  idPrefix,
  game = null,
  submitLabel,
  mediaDeleteAttribute,
}) {
  const releaseDate = game?.data_lancamento || game?.release_date || "";
  const media = game?.midias || [];

  return `
    <form id="${formId}" data-kind="game" data-resource-id="${game?.id || ""}" class="admin-resource-form admin-game-resource-form">
      <div class="admin-form-section-heading admin-form-wide">
      </div>
      <section class="admin-form-group admin-form-wide" aria-labelledby="${idPrefix}-content-title">
        <div class="admin-form-grid">
          <div class="admin-field admin-field--wide">
            ${fieldLabel(`${idPrefix}-title`, "Título", { required: true, help: "Use o nome pelo qual o jogo é conhecido." })}
            <input id="${idPrefix}-title" class="ui-control" name="titulo" maxlength="255" value="${escapeHtml(game?.titulo || "")}" placeholder="Ex.: Hades II" required>
          </div>
          <div class="admin-field admin-field--wide">
            ${fieldLabel(`${idPrefix}-long-description`, "Descrição completa", { help: "Explique a experiência para ajudar na decisão de compra." })}
            <textarea id="${idPrefix}-long-description" class="ui-control ui-control--area" name="descricao_longa" rows="5" placeholder="Apresente a proposta, mecânicas e o que torna o jogo especial.">${escapeHtml(game?.descricao_longa || "")}</textarea>
          </div>
        </div>
      </section>
      <section class="admin-form-group admin-form-wide" aria-labelledby="${idPrefix}-publication-title">
        <div class="admin-form-grid">
          <div class="admin-field">
            ${fieldLabel(`${idPrefix}-price`, "Preço", { required: true, help: "Se o valor for inferior a zero, ele será disponibilizado gratuitamente." })}
            <span class="admin-input-prefix">${Icon(icons.circleDollar, { className: "w-4 h-4" })}<input id="${idPrefix}-price" class="ui-control" name="preco" type="number" min="0" step="0.01" inputmode="decimal" value="${game?.preco ?? ""}" placeholder="0,00" required></span>
          </div>
          <div class="admin-field">
            ${fieldLabel(`${idPrefix}-release-date`, "Data de lançamento", { help: "Opcional. Você pode definir essa data depois." })}
            <input id="${idPrefix}-release-date" class="ui-control" name="data_lancamento" type="date" value="${releaseDate}">
          </div>
          <div class="admin-field">
            ${fieldLabel(`${idPrefix}-status`, "Status", { help: "Rascunhos não aparecem na vitrine." })}
            <select id="${idPrefix}-status" class="ui-control" name="status"><option value="draft" ${game?.status === "draft" ? "selected" : ""}>Rascunho</option><option value="published" ${game?.status === "published" ? "selected" : ""}>Publicado</option><option value="archived" ${game?.status === "archived" ? "selected" : ""}>Arquivado</option></select>
          </div>
          <div class="admin-field">
            ${fieldLabel(`${idPrefix}-tags`, "Tags", { help: "Separe os termos por vírgula." })}
            <input id="${idPrefix}-tags" class="ui-control" name="tags" value="${escapeHtml((game?.tags || []).join(", "))}" placeholder="RPG, Ação, Indie">
          </div>
        </div>
      </section>
      <fieldset class="admin-media-fields admin-form-wide">
        <div class="admin-media-inputs">
          ${["cover", "banner", "poster"].map((type) => `<label class="admin-media-picker" data-media-picker data-media-type="${type}"><input name="${type}" type="file" accept=".jpg,.jpeg,.png,.gif,image/jpeg,image/png,image/gif"><span class="admin-media-picker__icon" data-media-picker-icon>${Icon(icons.upload, { className: "w-4 h-4" })}</span><span><strong>${mediaLabel(type)}</strong><small>${type === "poster" ? "Imagem quadrada usada na grade \"Todos os jogos\"" : "Enviar imagem ou arraste aqui"}</small></span><span class="admin-media-picker__action" data-media-picker-action>Selecionar</span></label>`).join("")}
          <label class="admin-media-picker admin-media-picker--screenshots" data-media-picker data-media-type="screenshots"><input name="screenshots" type="file" accept=".jpg,.jpeg,.png,.gif,image/jpeg,image/png,image/gif" multiple><span class="admin-media-picker__icon" data-media-picker-icon>${Icon(icons.upload, { className: "w-4 h-4" })}</span><span><strong>Capturas de tela</strong><small>Selecione ou arraste várias imagens</small></span><output class="admin-media-picker__count" data-screenshot-count>0 / 10 capturas</output></label>
        </div>
        <div class="admin-media-preview" data-media-preview aria-live="polite">
          ${media.map((item) => { const type = item.tipo || item.type; return `<figure class="admin-media-item" data-existing-media="${item.id}" data-media-type="${type}"><img src="${escapeHtml(item.url)}" alt=""><figcaption><span>${mediaLabel(type, item.posicao || item.position)}</span><button type="button" ${mediaDeleteAttribute}="${item.id}" data-game-id="${game?.id || ""}" aria-label="Remover ${mediaLabel(type, item.posicao || item.position)}">${Icon(icons.trash, { className: "w-4 h-4" })}</button></figcaption></figure>`; }).join("")}
        </div>
      </fieldset>
      <section class="admin-game-preview admin-form-wide" data-game-preview aria-labelledby="${idPrefix}-preview-title">
        <div class="admin-game-preview__heading"><div><p>Espiando o layout...</p><h3 id="${idPrefix}-preview-title">Como o jogo estará nas páginas</h3></div></div>
        <div class="admin-game-preview__stage">
          <article class="admin-game-preview__hero"><div class="admin-game-preview__hero-media" data-preview-banner><img data-preview-image alt=""><div data-preview-placeholder>${Icon(icons.gamepad, { className: "w-5 h-5" })}<span>Banner do jogo</span></div></div><div class="admin-game-preview__hero-shade" aria-hidden="true"></div><div class="admin-game-preview__hero-content"><h4 data-preview-title>Título do jogo</h4><div class="flex flex-wrap gap-2 items-center mt-2" data-preview-tags></div><strong data-preview-price>Gratuito</strong></div></article>
          <article class="admin-game-preview__card"><div class="game-card__media w-full bg-[var(--color-surface-3)] relative overflow-hidden" data-preview-cover><img data-preview-image alt=""><div data-preview-placeholder>${Icon(icons.gamepad, { className: "w-5 h-5" })}<span>Capa</span></div><div class="game-card__overlay"><p class="game-card__title type-card-title line-clamp-2" data-preview-card-title>Título do jogo</p><p class="type-caption text-muted truncate" data-preview-card-description>Jogo digital</p><span class="type-card-title text-[var(--color-accent-400)]" data-preview-card-price>Gratuito</span></div></div></article>
        </div>
        <div class="admin-game-preview__screenshots"><span>Capturas de tela</span><div data-preview-screenshots></div></div>
      </section>
      <button class="button-primary admin-form-wide" type="submit">${submitLabel}</button>
      <p class="admin-form-error admin-form-wide hidden" role="alert"></p>
    </form>`;
}
