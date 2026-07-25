import { afterEach, describe, expect, it, vi } from "vitest";
import { ApiClient } from "../services/api/api.client";
import { Store } from "../store/store";

const initialState = Store.getState();

afterEach(() => {
  vi.unstubAllGlobals();
  localStorage.clear();
  Store.setState(initialState);
});

describe("API session expiration", () => {
  it("should clear both token and persisted user after an unauthorized response", async () => {
    localStorage.setItem("access_token", "expired-token");
    Store.setState({
      ...initialState,
      user: { username: "admin", role: "ADMIN" },
      cart: [],
      wishlist: [],
      library: [],
    });
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
      ok: false,
      status: 401,
      headers: new Headers({ "content-type": "application/json" }),
      json: async () => ({ mensagem: "Sessão expirada." }),
    }));

    await expect(ApiClient.get("/api/admin/dashboard")).rejects.toMatchObject({ status: 401 });

    expect(localStorage.getItem("access_token")).toBeNull();
    expect(Store.getState().user).toBeNull();
  });
});
