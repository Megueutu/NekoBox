import { afterEach, describe, expect, it } from "vitest";
import { Navbar } from "../components/layout/Navbar";
import { ACCOUNT_PATHS } from "../app/router/account-routes";
import { Store } from "../store/store";

const initialState = Store.getState();

afterEach(() => {
  localStorage.clear();
  Store.setState(initialState);
  document.body.innerHTML = "";
});

describe("Navbar authentication visibility", () => {
  it("should only expose public navigation and login to visitors", () => {
    localStorage.clear();
    Store.setState({ ...initialState, user: null, cart: [], wishlist: [], library: [] });
    document.body.innerHTML = Navbar();

    const privateTargets = [
      ACCOUNT_PATHS.library,
      ACCOUNT_PATHS.wishlist,
      ACCOUNT_PATHS.cart,
      ACCOUNT_PATHS.profile,
      "/admin",
    ];

    expect(privateTargets.some((href) => document.querySelector(`a[href="${href}"]`))).toBe(false);
    expect(document.querySelector('a[href="/"][aria-label="Início"] svg')).not.toBeNull();
    expect(document.querySelector('a[href="/hub"][aria-label="Catálogo"] svg')).not.toBeNull();
    expect(document.querySelector(".site-nav__link")).toBeNull();
    expect(document.querySelector('[data-wallet-trigger]')).toBeNull();
    expect(document.querySelector('a[href="/login"][aria-label="Entrar"]')).not.toBeNull();
  });

  it("should ignore a persisted admin when the access token is missing", () => {
    Store.setState({
      ...initialState,
      user: { username: "admin", avatar_url: "", role: "ADMIN" },
      cart: [],
      wishlist: [],
      library: [],
    });
    document.body.innerHTML = Navbar();

    expect(document.querySelector('a[href="/admin"]')).toBeNull();
    expect(document.querySelector(`a[href="${ACCOUNT_PATHS.library}"]`)).toBeNull();
    expect(document.querySelector('[data-wallet-trigger]')).toBeNull();
    expect(document.querySelector('a[href="/login"][aria-label="Entrar"]')).not.toBeNull();
  });

  it("should expose account actions to authenticated users", () => {
    localStorage.setItem("access_token", "user-token");
    Store.setState({
      ...initialState,
      user: { username: "player", avatar_url: "", role: "USER" },
      cart: [],
      wishlist: [],
      library: [],
    });
    document.body.innerHTML = Navbar();

    expect(document.querySelector(`a[href="${ACCOUNT_PATHS.profile}"]`)).not.toBeNull();
    expect(document.querySelector(`a[href="${ACCOUNT_PATHS.library}"][aria-label="Minha Biblioteca"] svg`)).not.toBeNull();
    expect(document.querySelector('[data-wallet-trigger]')).not.toBeNull();
    expect(document.querySelector('.nav-icon-link[data-wallet-trigger]').textContent.trim()).toBe("");
    expect(document.querySelector('a[href="/admin"]')).toBeNull();
    expect(document.querySelector('a[href="/login"]')).toBeNull();
  });

  it("should expose only the administration entry to authenticated admins", () => {
    localStorage.setItem("access_token", "admin-token");
    Store.setState({
      ...initialState,
      user: { username: "admin", avatar_url: "", role: "ADMIN" },
      cart: [],
      wishlist: [],
      library: [],
    });
    document.body.innerHTML = Navbar();

    expect(document.querySelector('a[href="/admin"]')).not.toBeNull();
    expect(document.querySelector('a[href="/admin"][aria-label="Administração"] svg')).not.toBeNull();
    expect(document.querySelector(`a[href="${ACCOUNT_PATHS.library}"]`)).toBeNull();
    expect(document.querySelector(`a[href="${ACCOUNT_PATHS.wishlist}"]`)).toBeNull();
    expect(document.querySelector(`a[href="${ACCOUNT_PATHS.cart}"]`)).toBeNull();
    expect(document.querySelector(`a[href="${ACCOUNT_PATHS.profile}"]`)).toBeNull();
    expect(document.querySelector('[data-wallet-trigger]')).toBeNull();
    expect(document.querySelector('a[href="/login"]')).toBeNull();
  });

  it("should fall back to a default picture when the customer has no avatar set", () => {
    localStorage.setItem("access_token", "user-token");
    Store.setState({
      ...initialState,
      user: { username: "player", avatar_url: "", role: "USER" },
      cart: [],
      wishlist: [],
      library: [],
    });
    document.body.innerHTML = Navbar();

    const avatar = document.querySelector(`a[href="${ACCOUNT_PATHS.profile}"] [role="img"]`);
    expect(avatar?.getAttribute("style")).not.toContain("url('')");
    expect(avatar?.getAttribute("style")).toContain("https://picsum.photos/seed/defaultavatar/150/150");
  });

  it("should render the customer's own avatar when one is set", () => {
    localStorage.setItem("access_token", "user-token");
    Store.setState({
      ...initialState,
      user: { username: "player", avatar_url: "https://example.com/avatar.jpg", role: "USER" },
      cart: [],
      wishlist: [],
      library: [],
    });
    document.body.innerHTML = Navbar();

    const avatar = document.querySelector(`a[href="${ACCOUNT_PATHS.profile}"] [role="img"]`);
    expect(avatar?.getAttribute("style")).toContain("https://example.com/avatar.jpg");
  });
});
