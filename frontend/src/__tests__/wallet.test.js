import { afterEach, describe, expect, it, vi } from "vitest";
import { WalletDialog, setupWalletDialog } from "../components/WalletDialog";
import { AccountService } from "../services/account.service";

let cleanup;

afterEach(() => {
  cleanup?.();
  cleanup = undefined;
  vi.restoreAllMocks();
  document.body.innerHTML = "";
});

const renderWallet = () => {
  document.body.innerHTML = `
    <button type="button" data-wallet-trigger>Carteira</button>
    ${WalletDialog()}
  `;
  const dialog = document.getElementById("wallet-dialog");
  dialog.showModal = vi.fn(() => dialog.setAttribute("open", ""));
  dialog.close = vi.fn(() => {
    dialog.removeAttribute("open");
    dialog.dispatchEvent(new Event("close"));
  });
  cleanup = setupWalletDialog();
  return dialog;
};

describe("Wallet dialog", () => {
  it("should load and display the authenticated account balance", async () => {
    vi.spyOn(AccountService, "getWallet").mockResolvedValue({ saldo: 1025 });
    const dialog = renderWallet();

    document.querySelector("[data-wallet-trigger]").click();
    await vi.waitFor(() => expect(document.getElementById("wallet-balance-value").textContent).toBe("R$ 1.025,00"));

    expect(dialog.showModal).toHaveBeenCalledOnce();
  });

  it("should add a freely chosen amount and announce the updated balance", async () => {
    vi.spyOn(AccountService, "getWallet").mockResolvedValue({ saldo: 1000 });
    vi.spyOn(AccountService, "addBalance").mockResolvedValue({ valor_adicionado: 50, saldo: 1050 });
    renderWallet();
    document.querySelector("[data-wallet-trigger]").click();
    const form = document.getElementById("wallet-topup-form");
    form.elements.valor.value = "50";

    form.dispatchEvent(new SubmitEvent("submit", { bubbles: true, cancelable: true }));

    await vi.waitFor(() => expect(document.getElementById("wallet-status").textContent).toContain("R$ 50,00"));
  });

  it("should expose a positive-value field for a free-form top-up", () => {
    renderWallet();

    const valueInput = document.getElementById("wallet-topup-value");

    expect(valueInput.min).toBe("0.01");
    expect(valueInput.step).toBe("0.01");
    expect(document.getElementById("wallet-dialog").getAttribute("aria-describedby")).toBe("wallet-description");
    expect(document.querySelector(".wallet-dialog__title-icon svg")).not.toBeNull();
  });
});
