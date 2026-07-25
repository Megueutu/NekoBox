import { describe, expect, it } from "vitest";
import { renderAuthPage, resolvePostLoginTarget } from "../pages/auth/LoginPage";

describe("Authentication page", () => {
  it("should render login as a centered semantic form", () => {
    const container = document.createElement("div");

    container.innerHTML = renderAuthPage("login");

    expect(container.querySelector(".auth-stage #login-form")).not.toBeNull();
  });

  it("should render an accessible password visibility control", () => {
    const container = document.createElement("div");

    container.innerHTML = renderAuthPage("login");

    const toggle = container.querySelector('[data-password-toggle="input-password"]');
    expect(toggle?.getAttribute("type")).toBe("button");
    expect(toggle?.getAttribute("aria-label")).toBe("Mostrar senha");
    expect(toggle?.getAttribute("aria-pressed")).toBe("false");
  });

  it("should render registration with password guidance", () => {
    const container = document.createElement("div");

    container.innerHTML = renderAuthPage("register");

    const hints = [...container.querySelectorAll("#register-form .auth-form__hint")];
    expect(hints[0]?.textContent).toContain("sem espaços");
    expect(hints[1]?.textContent).toContain("minúscula");
    expect(container.querySelector("#input-reg-password")?.getAttribute("autocomplete")).toBe("new-password");
    expect(container.querySelector("#input-reg-username")?.getAttribute("autocomplete")).toBe("username");
  });

  it("should render password recovery with a registered email field", () => {
    const container = document.createElement("div");

    container.innerHTML = renderAuthPage("forgot");

    expect(container.querySelector('#forgot-form input[type="email"]')).not.toBeNull();
  });

  it("should always send admins to the admin dashboard", () => {
    expect(resolvePostLoginTarget({ role: "ADMIN" }, "/conta/perfil")).toBe("/admin");
  });

  it("should preserve a valid redirect target for regular users", () => {
    expect(resolvePostLoginTarget({ role: "USER" }, "/conta/biblioteca")).toBe("/conta/biblioteca");
  });
});
