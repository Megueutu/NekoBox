import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import CartPage, { afterRender } from "../pages/games/cart/CartPage";
import { validateCheckout } from "../pages/games/cart/checkout-validation";
import { Store } from "../store/store";
import { Actions } from "../store/actions";

const { cart } = vi.hoisted(() => ({
  cart: [
    {
      id: "7",
      title: "Quantity Quest",
      slug: "quantity-quest",
      price: 49.9,
      quantity: 1,
      categories: ["RPG"],
      tags: [],
      media: [],
      publisher: { id: "2", name: "NekoBox Studios" },
    },
  ],
}));

vi.mock("../services/account.service", () => ({
  AccountService: {
    getCart: vi.fn().mockResolvedValue(cart),
  },
}));

vi.mock("../services/auth.service", () => ({
  AuthService: { logout: vi.fn() },
}));

const initialState = Store.getState();

beforeEach(() => {
  window.history.replaceState({}, "", "/conta/carrinho");
  Store.setState((state) => ({
    ...state,
    user: {
      id: "3",
      username: "buyer_user",
      email: "buyer@example.com",
      role: "USER",
    },
    cart,
  }));
  vi.spyOn(Actions, "removerDoCarrinho").mockResolvedValue();
  vi.spyOn(Actions, "finalizarCheckoutCarrinho").mockResolvedValue({
    payments: [
      {
        id: 10,
        produto_id: 7,
        valor: 49.9,
      },
    ],
  });
});

afterEach(() => {
  vi.restoreAllMocks();
  Store.setState(initialState);
  document.body.innerHTML = "";
  localStorage.clear();
  window.history.replaceState({}, "", "/");
});

describe("Cart page", () => {
  it("should render one direct purchase and calculate its line total", async () => {
    document.body.innerHTML = await CartPage();

    expect(document.querySelector(".cart-layout")).not.toBeNull();
    expect(document.querySelector("[data-quantity-input]")).toBeNull();
    expect(document.querySelector(".cart-item__subtotal").textContent).toContain("49,90");
  });

  it("should focus the first invalid checkout field", async () => {
    document.body.innerHTML = await CartPage();
    afterRender();
    document.getElementById("checkout-payment-method").value = "";

    document.getElementById("checkout-form").dispatchEvent(
      new Event("submit", { bubbles: true, cancelable: true })
    );

    expect(document.activeElement).toBe(document.getElementById("checkout-payment-method"));
    expect(document.getElementById("checkout-payment-method").getAttribute("aria-invalid")).toBe("true");
    expect(Actions.finalizarCheckoutCarrinho).not.toHaveBeenCalled();
  });

  it("should show an accessible confirmation after checkout", async () => {
    document.body.innerHTML = await CartPage();
    afterRender();

    document.getElementById("checkout-form").dispatchEvent(
      new Event("submit", { bubbles: true, cancelable: true })
    );

    await vi.waitFor(() => {
      expect(document.getElementById("checkout-confirmation").hidden).toBe(false);
    });
    expect(document.getElementById("checkout-form").hidden).toBe(true);
    expect(document.activeElement).toBe(document.getElementById("checkout-confirmation"));
    expect(document.getElementById("checkout-confirmation-description").textContent).toContain("1 jogo adicionado");
  });

  it("should keep the checkout form available when the API rejects the purchase", async () => {
    Actions.finalizarCheckoutCarrinho.mockRejectedValueOnce(new Error("Saldo insuficiente."));
    document.body.innerHTML = await CartPage();
    afterRender();

    document.getElementById("checkout-form").dispatchEvent(
      new Event("submit", { bubbles: true, cancelable: true })
    );

    await vi.waitFor(() => {
      expect(document.getElementById("checkout-form-error").hidden).toBe(false);
    });
    expect(document.getElementById("checkout-form-error").textContent).toBe("Saldo insuficiente.");
  });
});

describe("Checkout validation", () => {
  it("should accept a valid payment method", () => {
    const result = validateCheckout({ paymentMethod: "balance" });

    expect(result).toMatchObject({
      isValid: true,
      values: { paymentMethod: "balance" },
    });
  });

  it("should reject a missing payment method", () => {
    const result = validateCheckout({ paymentMethod: "" });

    expect(result.errors.paymentMethod).toBe("Selecione uma forma de pagamento válida.");
  });
});
