import { afterEach, describe, expect, it, vi } from "vitest";
import {
  renderAuthPage,
  resolvePostLoginTarget,
  bindAuthInteractions,
} from "../pages/auth/LoginPage";
import { renderAuthDialog, setupAuthDialog } from "../components/AuthDialog";

afterEach(() => {
  document.body.innerHTML = "";
});

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

  it("should render registration guidance as accessible tooltips", () => {
    const container = document.createElement("div");

    container.innerHTML = renderAuthPage("register");

    const tooltips = [...container.querySelectorAll("#register-form .field-tooltip")];
    expect(tooltips[0]?.getAttribute("aria-label")).toContain("sem espaços");
    expect(tooltips[1]?.getAttribute("aria-label")).toContain("minúscula");
    expect(container.querySelector("#register-form .auth-form__hint")).toBeNull();
    expect(container.querySelector("#input-reg-username")?.getAttribute("pattern")).toBe("^[a-zA-Z0-9_]{3,50}$");
    expect(container.querySelector("#input-reg-password")?.getAttribute("minlength")).toBe("8");
    expect(container.querySelector("#input-reg-password")?.getAttribute("autocomplete")).toBe("new-password");
    expect(container.querySelector("#input-reg-username")?.getAttribute("autocomplete")).toBe("username");
  });

  it("should open and close the username tooltip on click, for touch devices without hover", () => {
    document.body.innerHTML = renderAuthPage("register");
    bindAuthInteractions();
    const tooltip = document.querySelector("#register-form .field-tooltip");

    tooltip.click();
    expect(tooltip.classList.contains("field-tooltip--open")).toBe(true);

    document.body.click();
    expect(tooltip.classList.contains("field-tooltip--open")).toBe(false);
  });

  it("should mark password confirmation invalid until both values match", () => {
    document.body.innerHTML = renderAuthPage("register");
    bindAuthInteractions();
    const password = document.querySelector("#input-reg-password");
    const confirmation = document.querySelector("#input-reg-confirm");

    password.value = "Secure1!Pass";
    confirmation.value = "Different1!Pass";
    confirmation.dispatchEvent(new Event("input", { bubbles: true }));

    expect(confirmation.validity.customError).toBe(true);

    confirmation.value = "Secure1!Pass";
    confirmation.dispatchEvent(new Event("input", { bubbles: true }));

    expect(confirmation.validity.valid).toBe(true);
  });

  it("should not render the removed authentication protection message", () => {
    expect(renderAuthPage("login")).not.toContain("Acesso protegido por autenticação");
    expect(renderAuthDialog()).not.toContain("Acesso protegido por autenticação");
  });

  it("should open the login dialog and restore focus when it closes", async () => {
    document.body.innerHTML = `
      <a href="/login" data-login-trigger>Entrar</a>
      ${renderAuthDialog()}
    `;
    const trigger = document.querySelector("[data-login-trigger]");
    const dialog = document.querySelector("#auth-dialog");
    dialog.showModal = vi.fn(() => dialog.setAttribute("open", ""));
    dialog.close = vi.fn(() => {
      dialog.removeAttribute("open");
      dialog.dispatchEvent(new Event("close"));
    });
    const cleanup = setupAuthDialog();

    trigger.focus();
    trigger.click();

    await vi.waitFor(() => expect(dialog.showModal).toHaveBeenCalledOnce());
    expect(dialog.hasAttribute("open")).toBe(true);
    expect(document.activeElement?.id).toBe("input-email");

    dialog.querySelector("[data-auth-close]").click();

    expect(dialog.close).toHaveBeenCalledOnce();
    expect(document.activeElement).toBe(trigger);
    cleanup();
  });

  it("should always send admins to the admin dashboard", () => {
    expect(resolvePostLoginTarget({ role: "ADMIN" }, "/conta/perfil")).toBe("/admin");
  });

  it("should preserve a valid redirect target for regular users", () => {
    expect(resolvePostLoginTarget({ role: "USER" }, "/conta/biblioteca")).toBe("/conta/biblioteca");
  });
});
