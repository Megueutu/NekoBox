import { AccountService } from "../../services/account/account.service";
import { Store } from "../../store/store";
import { formatPrice } from "../../utils/format";
import { Icon, icons } from "../ui/Icon";

export function WalletDialog() {
  return `
    <dialog id="wallet-dialog" class="wallet-dialog" aria-labelledby="wallet-title">
      <div class="wallet-dialog__header">
        <div>
          <p class="wallet-dialog__eyebrow">Carteira NEXUSPLAY</p>
          <h2 id="wallet-title">Adicionar saldo</h2>
        </div>
        <button type="button" class="wallet-dialog__close" data-wallet-close aria-label="Fechar carteira">
          ${Icon(icons.x)}
        </button>
      </div>

      <section class="wallet-balance" aria-labelledby="wallet-balance-label">
        <p id="wallet-balance-label">Saldo disponível</p>
        <strong id="wallet-balance-value">—</strong>
      </section>

      <div class="wallet-payment">
        <p>Pagamento online</p>
        <div class="wallet-disabled-action">
          <button type="button" data-wallet-payment aria-disabled="true" aria-describedby="payment-unavailable-hint">
            Efetuar pagamento
          </button>
          <span id="payment-unavailable-hint" role="tooltip">Função ainda não disponível neste projeto.</span>
        </div>
      </div>

      <form id="gift-card-form" class="gift-card-form">
        <label for="gift-card-code">Código do gift card</label>
        <div class="gift-card-form__controls">
          <input id="gift-card-code" name="codigo" type="text" maxlength="64" autocomplete="off"
                 autocapitalize="characters" spellcheck="false" placeholder="NEKO-XXXX-XXXX" required />
          <button type="submit" class="button-primary">Resgatar</button>
        </div>
        <p class="gift-card-form__hint">O valor do cartão será creditado imediatamente na sua conta.</p>
      </form>

      <p id="wallet-status" class="wallet-status" role="status" aria-live="polite"></p>
    </dialog>
  `;
}

export function setupWalletDialog() {
  let activeTrigger = null;

  const setStatus = (message, isError = false) => {
    const status = document.getElementById("wallet-status");
    if (!status) return;
    status.textContent = message;
    status.classList.toggle("wallet-status--error", isError);
  };

  const openWallet = async (trigger) => {
    const dialog = document.getElementById("wallet-dialog");
    if (!dialog) return;
    activeTrigger = trigger;
    setStatus("Carregando saldo...");
    if (typeof dialog.showModal === "function") dialog.showModal();
    else dialog.setAttribute("open", "");

    dialog.addEventListener("close", () => activeTrigger?.focus(), { once: true });
    try {
      const wallet = await AccountService.getWallet();
      const balance = document.getElementById("wallet-balance-value");
      if (balance) balance.textContent = formatPrice(wallet.saldo);
      setStatus("");
    } catch (error) {
      setStatus(error.message, true);
    }
  };

  const closeWallet = () => {
    const dialog = document.getElementById("wallet-dialog");
    if (!dialog) return;
    if (typeof dialog.close === "function") dialog.close();
    else dialog.removeAttribute("open");
  };

  const onClick = (event) => {
    const trigger = event.target.closest("[data-wallet-trigger]");
    if (trigger) {
      event.preventDefault();
      openWallet(trigger);
      return;
    }

    if (event.target.closest("[data-wallet-close]")) {
      closeWallet();
      return;
    }

    if (event.target.closest("[data-wallet-payment]")) {
      setStatus("O pagamento online ainda não está disponível.");
      return;
    }

    if (event.target.matches("#wallet-dialog")) closeWallet();
  };

  const onSubmit = async (event) => {
    if (event.target.id !== "gift-card-form") return;
    event.preventDefault();
    const form = event.target;
    const button = form.querySelector('button[type="submit"]');
    const codeInput = form.elements.codigo;
    button.disabled = true;
    form.setAttribute("aria-busy", "true");
    setStatus("Validando gift card...");

    try {
      const result = await AccountService.redeemGiftCard(codeInput.value);
      const balance = document.getElementById("wallet-balance-value");
      if (balance) balance.textContent = formatPrice(result.saldo);
      Store.setState((state) => ({
        ...state,
        user: state.user ? { ...state.user, balance: result.saldo } : state.user,
      }));
      form.reset();
      setStatus(`${formatPrice(result.valor_creditado)} adicionados à sua carteira.`);
    } catch (error) {
      setStatus(error.message, true);
    } finally {
      button.disabled = false;
      form.removeAttribute("aria-busy");
    }
  };

  document.addEventListener("click", onClick);
  document.addEventListener("submit", onSubmit);
  return () => {
    document.removeEventListener("click", onClick);
    document.removeEventListener("submit", onSubmit);
  };
}
