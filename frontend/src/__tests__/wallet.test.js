import { afterEach, describe, expect, it, vi } from "vitest";
import { WalletDialog, setupWalletDialog } from "../components/wallet/WalletDialog";
import { AccountService } from "../services/account/account.service";

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

  it("should redeem a gift card and announce the credited value", async () => {
    vi.spyOn(AccountService, "getWallet").mockResolvedValue({ saldo: 1000 });
    vi.spyOn(AccountService, "redeemGiftCard").mockResolvedValue({ valor_creditado: 50, saldo: 1050 });
    renderWallet();
    document.querySelector("[data-wallet-trigger]").click();
    const form = document.getElementById("gift-card-form");
    form.elements.codigo.value = "NEKO-50-DEMO";

    form.dispatchEvent(new SubmitEvent("submit", { bubbles: true, cancelable: true }));

    await vi.waitFor(() => expect(document.getElementById("wallet-status").textContent).toContain("R$ 50,00"));
  });

  it("should explain why online payment is unavailable to keyboard users", () => {
    renderWallet();

    const paymentButton = document.querySelector("[data-wallet-payment]");

    expect(paymentButton.getAttribute("aria-describedby")).toBe("payment-unavailable-hint");
  });
});
