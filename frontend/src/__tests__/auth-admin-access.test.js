import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../core/firebase/firebase", () => ({
  auth: null,
  googleProvider: null,
}));

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
