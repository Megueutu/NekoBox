import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import LibraryPage, { afterRender } from "../pages/library/LibraryPage";
import { AccountService } from "../services/account/account.service";
import { Store } from "../store/store";

vi.mock("../services/account/account.service", () => ({
  AccountService: {
    getLibrary: vi.fn(),
    redeemGameCode: vi.fn(),
  },
}));

vi.mock("../services/auth/auth.service", () => ({
  AuthService: { logout: vi.fn() },
}));

const initialState = Store.getState();

beforeEach(() => {
  window.history.replaceState({}, "", "/conta/biblioteca");
  localStorage.setItem("access_token", "friend-token");
  AccountService.getLibrary.mockResolvedValue([]);
});

afterEach(() => {
  vi.restoreAllMocks();
  localStorage.clear();
  sessionStorage.clear();
  Store.setState(initialState);
  document.body.innerHTML = "";
});

describe("Game gift code redemption", () => {
  it("should require a code before sending the redemption request", async () => {
    document.body.innerHTML = await LibraryPage();
    afterRender();

    document.getElementById("game-code-form").dispatchEvent(
      new Event("submit", { bubbles: true, cancelable: true })
    );

    expect(document.getElementById("game-code-status").textContent).toBe(
      "Informe o código que você recebeu."
    );
  });

  it("should redeem a valid code and refresh the library", async () => {
    AccountService.redeemGameCode.mockResolvedValue({ title: "Celeste" });
    AccountService.getLibrary
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([{ id: "7", title: "Celeste" }]);
    document.body.innerHTML = await LibraryPage();
    afterRender();

    document.getElementById("game-code-input").value =
      "NEKO-GAME-ABCD-EFGH-JKLM";
    document.getElementById("game-code-form").dispatchEvent(
      new Event("submit", { bubbles: true, cancelable: true })
    );

    await vi.waitFor(() => {
      expect(AccountService.redeemGameCode).toHaveBeenCalledWith(
        "NEKO-GAME-ABCD-EFGH-JKLM"
      );
      expect(sessionStorage.getItem("game-code-redemption-message")).toBe(
        "Celeste foi adicionado à sua biblioteca."
      );
    });
  });
});
