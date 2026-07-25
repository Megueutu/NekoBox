import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import CartPage, { afterRender } from "../pages/cart/CartPage";
import { validateCheckout } from "../pages/cart/checkout-validation";
import { AccountService } from "../services/account/account.service";
import { Actions } from "../store/actions";
import { Store } from "../store/store";

vi.mock("../services/account/account.service", () => ({
  AccountService: {
    getCart: vi.fn(),
    getLibrary: vi.fn(),
  },
}));

vi.mock("../services/auth/auth.service", () => ({
  AuthService: { logout: vi.fn() },
}));

const game = {
  id: "7",
  slug: "celeste",
  title: "Celeste",
  price: 36.9,
  quantity: 1,
  categories: ["Plataforma"],
  publisher: { name: "NekoBox Studios" },
  media: [],
};

const initialState = Store.getState();

beforeEach(() => {
  window.history.replaceState({}, "", "/conta/carrinho");
  localStorage.setItem("access_token", "user-token");
  Store.setState(() => ({
    ...initialState,
    user: { username: "player", email: "player@example.com", role: "USER" },
  }));
  AccountService.getCart.mockResolvedValue([
    { ...game, for_gift: false },
    { ...game, for_gift: true, quantity: 2 },
  ]);
});

afterEach(() => {
  vi.restoreAllMocks();
  localStorage.clear();
  sessionStorage.clear();
  Store.setState(initialState);
  document.body.innerHTML = "";
});

describe("Gift cart and checkout", () => {
  it("should expose quantity controls only for gift codes", async () => {
    document.body.innerHTML = await CartPage();

    expect(document.querySelectorAll("[data-quantity-input]")).toHaveLength(1);
    expect(document.body.textContent).toContain("Código para presente");
    expect(document.body.textContent).toContain("Para minha biblioteca");
  });

  it("should update the number of gift codes from the step control", async () => {
    vi.spyOn(Actions, "atualizarQuantidadeCarrinho").mockResolvedValue();
    document.body.innerHTML = await CartPage();
    afterRender();

    document.querySelector('[data-quantity-step="1"]').click();
    await vi.waitFor(() => {
      expect(Actions.atualizarQuantidadeCarrinho).toHaveBeenCalledWith("7", 3);
    });
  });

  it("should reject checkout when confirmation is missing", () => {
    const result = validateCheckout({
      name: "Player One",
      email: "player@example.com",
      paymentMethod: "balance",
      termsAccepted: false,
    });

    expect(result.errors.termsAccepted).toBe(
      "Confirme que esta é uma compra de demonstração."
    );
  });

  it("should show generated gift codes after a valid checkout", async () => {
    vi.spyOn(Actions, "finalizarCheckoutCarrinho").mockResolvedValue({
      payments: [
        { para_presente: false },
        { para_presente: true },
      ],
      giftCodes: [
        {
          titulo_produto: "Celeste",
          codigo: "NEKO-GAME-ABCD-EFGH-JKLM",
        },
      ],
    });
    document.body.innerHTML = await CartPage();
    afterRender();

    document.getElementById("checkout-name").value = "Player One";
    document.getElementById("checkout-email").value = "player@example.com";
    document.getElementById("checkout-terms").checked = true;
    document.getElementById("checkout-form").dispatchEvent(
      new Event("submit", { bubbles: true, cancelable: true })
    );

    await vi.waitFor(() => {
      expect(document.getElementById("checkout-confirmation").hidden).toBe(false);
    });
    expect(document.getElementById("checkout-gift-code-list").textContent).toContain(
      "NEKO-GAME-ABCD-EFGH-JKLM"
    );
  });
});
