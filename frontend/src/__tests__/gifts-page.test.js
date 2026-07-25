import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import GiftsPage, { afterRender } from "../pages/gifts/GiftsPage";
import { AccountService } from "../services/account/account.service";
import { Store } from "../store/store";

vi.mock("../services/account/account.service", () => ({
  AccountService: {
    getGameGiftCodes: vi.fn(),
  },
}));

vi.mock("../services/auth/auth.service", () => ({
  AuthService: { logout: vi.fn() },
}));

const initialState = Store.getState();

beforeEach(() => {
  window.history.replaceState({}, "", "/conta/presentes");
  localStorage.setItem("access_token", "buyer-token");
  Store.setState({
    ...initialState,
    user: { id: "2", username: "buyer", email: "buyer@example.com", role: "USER" },
  });
});

afterEach(() => {
  vi.restoreAllMocks();
  localStorage.clear();
  Store.setState(initialState);
  document.body.innerHTML = "";
});

describe("Game gifts page", () => {
  it("should show each game code and whether it was redeemed", async () => {
    AccountService.getGameGiftCodes.mockResolvedValue([
      {
        id: "1",
        productId: "8",
        gameTitle: "Celeste",
        code: "NEKO-GAME-ABCD-EFGH-JKLM",
        redeemed: false,
        createdAt: "2026-07-24T10:00:00",
        redeemedAt: null,
      },
      {
        id: "2",
        productId: "9",
        gameTitle: "Stardew Valley",
        code: "NEKO-GAME-NPQR-STUV-WXYZ",
        redeemed: true,
        createdAt: "2026-07-23T10:00:00",
        redeemedAt: "2026-07-24T11:00:00",
      },
    ]);

    document.body.innerHTML = await GiftsPage();

    expect(document.querySelectorAll(".gift-code-card")).toHaveLength(2);
    expect(document.body.textContent).toContain("NEKO-GAME-ABCD-EFGH-JKLM");
    expect(document.body.textContent).toContain("Utilizado");
    expect(document.querySelector('.account-nav a[href="/conta/presentes"][aria-current="page"]')).not.toBeNull();
  });

  it("should render an empty state when the buyer has no gift codes", async () => {
    AccountService.getGameGiftCodes.mockResolvedValue([]);

    document.body.innerHTML = await GiftsPage();

    expect(document.body.textContent).toContain("Nenhum presente comprado");
  });

  it("should explain when a legacy gift code cannot be recovered", async () => {
    AccountService.getGameGiftCodes.mockResolvedValue([
      {
        id: "1",
        productId: "8",
        gameTitle: "Celeste",
        code: "",
        redeemed: false,
        createdAt: "2026-07-20T10:00:00",
        redeemedAt: null,
      },
    ]);

    document.body.innerHTML = await GiftsPage();

    expect(document.body.textContent).toContain("Código antigo indisponível");
    expect(document.body.textContent).toContain("Indisponível");
  });

  it("should copy an available gift code and announce the result", async () => {
    AccountService.getGameGiftCodes.mockResolvedValue([
      {
        id: "1",
        productId: "8",
        gameTitle: "Celeste",
        code: "NEKO-GAME-ABCD-EFGH-JKLM",
        redeemed: false,
        createdAt: "2026-07-24T10:00:00",
        redeemedAt: null,
      },
    ]);
    const writeText = vi.fn().mockResolvedValue();
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: { writeText },
    });
    document.body.innerHTML = await GiftsPage();
    afterRender();

    document.querySelector("[data-copy-gift-code]").click();

    await vi.waitFor(() => {
      expect(writeText).toHaveBeenCalledWith("NEKO-GAME-ABCD-EFGH-JKLM");
      expect(document.getElementById("gift-copy-status").textContent).toBe("Código copiado.");
    });
  });
});
