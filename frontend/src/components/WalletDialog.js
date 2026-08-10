import { AccountService } from "../services/account.service";
import { Store } from "../store/store";
import { formatPrice } from "../utils/format";
import { Icon, icons } from "./ui/Icon";

export function WalletDialog() {
  return `
    <dialog id="wallet-dialog" class="wallet-dialog" aria-labelledby="wallet-title" aria-describedby="wallet-description">
      <div class="wallet-dialog__header">
        <div class="wallet-dialog__title">
          <div>
            <p class="wallet-dialog__eyebrow">Carteira NekoBox</p>
            <h2 id="wallet-title">Adicionar saldo</h2>
          </div>
        </div>
        <button type="button" class="wallet-dialog__close" data-wallet-close aria-label="Fechar carteira">
          ${Icon(icons.x)}
        </button>
      </div>

      <section class="wallet-balance" aria-labelledby="wallet-balance-label">
        <div>
          <p id="wallet-balance-label">Saldo disponível</p>
          <strong id="wallet-balance-value">—</strong>
        </div>
        <span class="wallet-balance__icon" aria-hidden="true">${Icon(icons.wallet, { className: "w-5 h-5" })}</span>
      </section>

      <form id="wallet-topup-form" class="wallet-topup-form">
        <div class="wallet-topup-form__heading">
          <label for="wallet-topup-value">Valor da recarga</label>
          <p>O crédito é aplicado imediatamente à sua carteira.</p>
        </div>
        <div class="wallet-topup-form__controls">
          <div class="wallet-topup-form__input"><span>R$</span><input id="wallet-topup-value" class="ui-control" style="background: var(--color-surface)" name="valor" type="number" min="0.01" step="0.01" inputmode="decimal" placeholder="0,00" required /></div>
          <button type="submit" class="button-primary">Adicionar saldo</button>
        </div>
      </form>
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

    if (event.target.matches("#wallet-dialog")) closeWallet();
  };

  const onSubmit = async (event) => {
    if (event.target.id !== "wallet-topup-form") return;
    event.preventDefault();
    const form = event.target;
    const button = form.querySelector('button[type="submit"]');
    const valueInput = form.elements.valor;
    button.disabled = true;
    form.setAttribute("aria-busy", "true");
    setStatus("Adicionando saldo...");

    try {
      const result = await AccountService.addBalance(valueInput.value);
      const balance = document.getElementById("wallet-balance-value");
      if (balance) balance.textContent = formatPrice(result.saldo);
      Store.setState((state) => ({
        ...state,
        user: state.user ? { ...state.user, balance: result.saldo } : state.user,
      }));
      form.reset();
      setStatus(`${formatPrice(result.valor_adicionado)} adicionados à sua carteira.`);
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
