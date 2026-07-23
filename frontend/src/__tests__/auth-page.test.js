import { describe, expect, it } from "vitest";
import { renderAuthPage } from "../pages/auth/LoginPage";

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

    expect(container.querySelector("#register-form .auth-form__hint")?.textContent).toContain("8 ou mais");
    expect(container.querySelector("#input-reg-password")?.getAttribute("autocomplete")).toBe("new-password");
  });

  it("should render password recovery with a registered email field", () => {
    const container = document.createElement("div");

    container.innerHTML = renderAuthPage("forgot");

    expect(container.querySelector('#forgot-form input[type="email"]')).not.toBeNull();
  });
});
