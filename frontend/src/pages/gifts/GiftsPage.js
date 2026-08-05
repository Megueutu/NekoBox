import { PrivateLayout } from "../../app/layouts/PrivateLayout";
import { navigate } from "../../app/router/navigate";
import { AuthService } from "../../services/auth/auth.service";
import { AccountService } from "../../services/account/account.service";
import { EmptyState } from "../../components/ui/EmptyState";
import { PageHeader } from "../../components/ui/PageHeader";
import { Icon, icons } from "../../components/ui/Icon";
import { escapeHtml } from "../../utils/escape";
import { formatDate } from "../../utils/format";

function GiftCodeCard(gift) {
  const codeAvailable = Boolean(gift.code);
  const statusLabel = !codeAvailable ? "Indisponível" : gift.redeemed ? "Utilizado" : "Disponível";
  const statusClass = gift.redeemed || !codeAvailable
    ? "gift-code-card__status--used"
    : "gift-code-card__status--available";
  const code = codeAvailable ? escapeHtml(gift.code) : "Código antigo indisponível";

  return `
    <article class="gift-code-card">
      <div class="gift-code-card__heading">
        <span class="gift-code-card__icon">${Icon(icons.gift, { className: "w-5 h-5" })}</span>
        <div>
          <p>Presente digital</p>
          <h2>${escapeHtml(gift.gameTitle)}</h2>
        </div>
        <span class="gift-code-card__status ${statusClass}">
          ${Icon(!codeAvailable ? icons.cloudOff : gift.redeemed ? icons.check : icons.gift, { className: "w-3.5 h-3.5" })}
          ${statusLabel}
        </span>
      </div>

      <div class="gift-code-card__code">
        <span>Código do jogo</span>
        <div>
          <code>${code}</code>
          ${
            codeAvailable
              ? `<button type="button" data-copy-gift-code="${code}" aria-label="Copiar código de ${escapeHtml(gift.gameTitle)}">
                   ${Icon(icons.copy, { className: "w-4 h-4" })} Copiar
                 </button>`
              : ""
          }
        </div>
      </div>

      <dl class="gift-code-card__meta">
        <div><dt>Gerado em</dt><dd>${gift.createdAt ? formatDate(gift.createdAt) : "Data indisponível"}</dd></div>
        <div>
          <dt>Situação</dt>
          <dd>${gift.redeemed && gift.redeemedAt ? `Utilizado em ${formatDate(gift.redeemedAt)}` : statusLabel}</dd>
        </div>
      </dl>

      ${
        codeAvailable
          ? ""
          : `<p class="gift-code-card__legacy">Este código foi criado antes do histórico de presentes e não pode ser recuperado.</p>`
      }
    </article>
  `;
}

export default async function GiftsPage() {
  const gifts = await AccountService.getGameGiftCodes();
  const availableCount = gifts.filter((gift) => gift.code && !gift.redeemed).length;

  const content = `
    <div class="gifts-page space-y-6">
      ${PageHeader({
        title: "Presentes",
        subtitle: gifts.length
          ? `${availableCount} código${availableCount === 1 ? "" : "s"} disponível${availableCount === 1 ? "" : "is"} para enviar.`
          : "Seus códigos de jogos para presentear amigos.",
      })}

      <section class="gifts-intro panel" aria-labelledby="gifts-intro-title">
        <span>${Icon(icons.gift, { className: "w-5 h-5" })}</span>
        <div>
          <p>Seus presentes</p>
          <h2 id="gifts-intro-title">Envie o código para quem vai receber o jogo</h2>
          <small>Somente você pode consultar estes códigos. Cada um funciona uma única vez.</small>
        </div>
      </section>

      <p id="gift-copy-status" class="sr-only" role="status" aria-live="polite"></p>

      ${
        gifts.length === 0
          ? EmptyState({
              icon: icons.gift,
              title: "Nenhum presente comprado",
              description: "Abra um jogo no catálogo e use a opção “Presentear este jogo”.",
              ctaHref: "/hub",
              ctaLabel: "Explorar jogos",
            })
          : `<section class="gift-code-grid" aria-label="Códigos de presente">
               ${gifts.map(GiftCodeCard).join("")}
             </section>`
      }
    </div>
  `;

  return PrivateLayout(content);
}

export function afterRender() {
  document.querySelectorAll("[data-copy-gift-code]").forEach((button) => {
    button.addEventListener("click", async () => {
      const status = document.getElementById("gift-copy-status");
      try {
        await navigator.clipboard.writeText(button.dataset.copyGiftCode);
        button.lastChild.textContent = " Copiado";
        status.textContent = "Código copiado.";
      } catch {
        status.textContent = "Não foi possível copiar o código.";
      }
    });
  });

  document.getElementById("btn-sidebar-logout")?.addEventListener("click", async () => {
    await AuthService.logout();
    navigate("/hub");
  });
}
