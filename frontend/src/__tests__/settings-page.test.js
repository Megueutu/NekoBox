import { afterEach, beforeEach, describe, expect, it } from "vitest";
import SettingsPage, { afterRender } from "../pages/settings/SettingsPage";
import { defaultPreferences, getPreferences } from "../app/preferences/preferences";
import { Store } from "../store/store";

const initialState = Store.getState();

beforeEach(() => {
  window.history.replaceState({}, "", "/conta/configuracoes");
  localStorage.setItem("access_token", "user-token");
  Store.setState({
    ...initialState,
    user: { id: "2", username: "player", email: "player@example.com", role: "USER" },
    cart: [],
    wishlist: [],
    library: [],
  });
});

afterEach(() => {
  window.history.replaceState({}, "", "/");
  localStorage.clear();
  Store.setState(initialState);
  document.body.innerHTML = "";
});

describe("Settings account page", () => {
  it("should use the authenticated account layout without decorative previews", () => {
    document.body.innerHTML = SettingsPage();

    expect(document.querySelector(".app-shell--private")).not.toBeNull();
    expect(document.querySelector(".account-sidebar-panel")).not.toBeNull();
    expect(document.querySelector('.account-sidebar-panel a[href="/conta/configuracoes"][aria-current="page"]')).not.toBeNull();
    expect(document.querySelector(".settings-preview")).toBeNull();
    expect(document.querySelector(".settings-summary__sample")).toBeNull();
    expect(document.querySelectorAll(".settings-section")).toHaveLength(2);
  });

  it("should keep applying preferences and restore their defaults", () => {
    document.body.innerHTML = SettingsPage();
    afterRender();

    expect(document.querySelector('input[name="accent"]')).toBeNull();

    const midnight = document.querySelector('input[name="base"][value="midnight"]');
    midnight.checked = true;
    midnight.dispatchEvent(new Event("change", { bubbles: true }));

    expect(getPreferences().base).toBe("midnight");

    document.getElementById("reset-settings").click();

    expect(getPreferences()).toEqual(defaultPreferences);
  });
});
