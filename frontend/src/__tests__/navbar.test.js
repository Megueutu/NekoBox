import { afterEach, describe, expect, it } from "vitest";
import { Navbar } from "../components/layout/Navbar";
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

    const privateTargets = ["/library", "/wishlist", "/cart", "/profile", "/admin"];

    expect(privateTargets.some((href) => document.querySelector(`a[href="${href}"]`))).toBe(false);
    expect(document.querySelector('a[href="/configuracoes"]')).toBeNull();
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
    expect(document.querySelector('a[href="/library"]')).toBeNull();
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

    expect(document.querySelector('a[href="/profile"]')).not.toBeNull();
    expect(document.querySelector('a[href="/library"][aria-label="Minha Biblioteca"] svg')).not.toBeNull();
    expect(document.querySelector('.nav-icon-link[href="/configuracoes"]')).toBeNull();
    expect(document.querySelectorAll('a[href="/configuracoes"]')).toHaveLength(1);
    expect(document.querySelector('[data-wallet-trigger]')).not.toBeNull();
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
    expect(document.querySelector('a[href="/library"]')).toBeNull();
    expect(document.querySelector('a[href="/wishlist"]')).toBeNull();
    expect(document.querySelector('a[href="/cart"]')).toBeNull();
    expect(document.querySelector('a[href="/profile"]')).toBeNull();
    expect(document.querySelector('[data-wallet-trigger]')).toBeNull();
    expect(document.querySelector('a[href="/login"]')).toBeNull();
  });
});
