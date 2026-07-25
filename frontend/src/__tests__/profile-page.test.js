import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import styles from "../style.css?raw";
import ProfilePage, { afterRender } from "../pages/profile/ProfilePage";
import { Store } from "../store/store";
import { Actions } from "../store/actions";

vi.mock("../services/account/account.service", () => ({
  AccountService: {
    getProfile: vi.fn().mockResolvedValue({
      id: "2",
      username: "player",
      email: "player@example.com",
      avatar_url: "https://example.com/avatar.jpg",
      bio: "RPG e jogos cooperativos.",
      role: "USER",
    }),
  },
}));

vi.mock("../services/auth/auth.service", () => ({
  AuthService: { logout: vi.fn() },
}));

const initialState = Store.getState();

beforeEach(() => {
  window.history.replaceState({}, "", "/conta/perfil");
  localStorage.setItem("access_token", "user-token");
  vi.spyOn(Actions, "atualizarDadosPerfil").mockResolvedValue();
});

afterEach(() => {
  vi.restoreAllMocks();
  window.history.replaceState({}, "", "/");
  localStorage.clear();
  Store.setState(initialState);
  document.body.innerHTML = "";
});

describe("Profile account page", () => {
  it("should render the account navigation without the decorative sidebar pseudo-element", async () => {
    document.body.innerHTML = await ProfilePage();

    expect(document.querySelector(".profile-page")).not.toBeNull();
    expect(document.querySelector('.account-nav a[href="/conta/perfil"][aria-current="page"]')).not.toBeNull();
    expect(document.querySelector(".account-nav")?.getAttribute("aria-label")).toBe("Área da conta");
    expect(styles).not.toMatch(/\.account-sidebar-panel::before/);
  });

  it("should keep profile fields accessible and submit the existing profile update", async () => {
    document.body.innerHTML = await ProfilePage();
    afterRender();

    const username = document.getElementById("input-username");
    const bio = document.getElementById("input-bio");
    const avatar = document.getElementById("input-avatar-url");

    username.value = "updated_player";
    bio.value = "Nova bio";
    avatar.value = "https://example.com/new-avatar.jpg";
    document.getElementById("profile-form").dispatchEvent(new Event("submit", { bubbles: true, cancelable: true }));

    expect(document.querySelector('label[for="input-username"]')).not.toBeNull();
    expect(document.getElementById("profile-msg")?.getAttribute("aria-live")).toBe("polite");
    expect(Actions.atualizarDadosPerfil).toHaveBeenCalledWith(
      "updated_player",
      "Nova bio",
      "https://example.com/new-avatar.jpg"
    );
  });

  it("should reveal the avatar URL from the pencil button and keep email full width", async () => {
    document.body.innerHTML = await ProfilePage();
    afterRender();

    const editButton = document.getElementById("btn-edit-avatar");
    const avatarEditor = document.getElementById("avatar-url-editor");

    expect(avatarEditor.hidden).toBe(true);
    expect(document.getElementById("input-username")?.closest(".profile-avatar-editor")).not.toBeNull();
    expect(document.getElementById("input-profile-email")?.parentElement.classList.contains("profile-field--full")).toBe(true);

    editButton.click();

    expect(editButton.getAttribute("aria-expanded")).toBe("true");
    expect(avatarEditor.hidden).toBe(false);
    expect(document.activeElement).toBe(document.getElementById("input-avatar-url"));
  });
});
