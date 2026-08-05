import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../services/api/api.client", () => ({
  ApiClient: {
    post: vi.fn(),
  },
}));

vi.mock("../services/account/account.service", () => ({
  AccountService: {
    getProfile: vi.fn(),
    getCart: vi.fn(),
    getWishlist: vi.fn(),
    getLibrary: vi.fn(),
  },
}));

vi.mock("../store/actions", () => ({
  Actions: {
    hydrateAccount: vi.fn(),
  },
}));

import { AuthService } from "../services/auth/auth.service";
import { ApiClient } from "../services/api/api.client";
import { AccountService } from "../services/account/account.service";
import { Actions } from "../store/actions";

describe("Admin session isolation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it("should hydrate an admin without loading customer account resources", async () => {
    const admin = { id: "1", username: "admin", role: "ADMIN" };
    ApiClient.post.mockResolvedValue({
      access_token: "admin-token",
      user: admin,
    });

    await expect(AuthService.loginComEmail("admin@example.com", "secret")).resolves.toEqual(admin);

    expect(AccountService.getProfile).not.toHaveBeenCalled();
    expect(AccountService.getCart).not.toHaveBeenCalled();
    expect(AccountService.getWishlist).not.toHaveBeenCalled();
    expect(AccountService.getLibrary).not.toHaveBeenCalled();
    expect(Actions.hydrateAccount).toHaveBeenCalledWith({
      user: admin,
      cart: [],
      wishlist: [],
      library: [],
    });
  });
});

describe("Registration validation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it("should reject an invalid username before calling the API", async () => {
    await expect(
      AuthService.registrar("Davi Alves", "davi@example.com", "Secure1!Pass"),
    ).rejects.toThrow("sem espaços");

    expect(ApiClient.post).not.toHaveBeenCalled();
  });

  it("should normalize the registration payload accepted by the API", async () => {
    ApiClient.post
      .mockResolvedValueOnce({})
      .mockResolvedValueOnce({
        access_token: "user-token",
        user: { id: "2", username: "davi_alves", role: "USER" },
      });
    AccountService.getProfile.mockResolvedValue({ id: "2", username: "davi_alves", role: "USER" });
    AccountService.getCart.mockResolvedValue([]);
    AccountService.getWishlist.mockResolvedValue([]);
    AccountService.getLibrary.mockResolvedValue([]);

    await AuthService.registrar("  davi_alves  ", "  davi@example.com  ", "Secure1!Pass");

    expect(ApiClient.post).toHaveBeenNthCalledWith(1, "/api/usuarios", {
      nome_usuario: "davi_alves",
      email: "davi@example.com",
      senha: "Secure1!Pass",
    });
  });
});
