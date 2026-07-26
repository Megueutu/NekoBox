import { afterEach, describe, expect, it, vi } from "vitest";
import { setupKeyboardNavigation } from "../app/accessibility/keyboard";

let cleanup;

afterEach(() => {
  cleanup?.();
  cleanup = undefined;
  document.body.innerHTML = "";
});

describe("Keyboard navigation", () => {
  it("should move focus to the skip link target", () => {
    document.body.innerHTML = `
      <a class="skip-link" href="#main-content">Pular para o conteúdo</a>
      <main id="main-content" tabindex="-1"></main>
    `;
    const skipLink = document.querySelector(".skip-link");
    const main = document.querySelector("main");
    cleanup = setupKeyboardNavigation();

    skipLink.click();

    expect(document.activeElement).toBe(main);
  });

  it("should select the next radio option with ArrowRight", () => {
    document.body.innerHTML = `
      <div role="radiogroup">
        <button role="radio">Todos</button>
        <button role="radio">RPG</button>
      </div>
    `;
    const [first, second] = document.querySelectorAll('[role="radio"]');
    const click = vi.spyOn(second, "click");
    cleanup = setupKeyboardNavigation();

    first.focus();
    first.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowRight", bubbles: true }));

    expect(click).toHaveBeenCalledOnce();
  });

  it("should wrap to the last tab with ArrowLeft", () => {
    document.body.innerHTML = `
      <div role="tablist">
        <button role="tab">Login</button>
        <button role="tab">Cadastro</button>
      </div>
    `;
    const [first, last] = document.querySelectorAll('[role="tab"]');
    cleanup = setupKeyboardNavigation();

    first.focus();
    first.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowLeft", bubbles: true }));

    expect(document.activeElement).toBe(last);
  });

  it("should move to the first option with Home", () => {
    document.body.innerHTML = `
      <div role="radiogroup">
        <button role="radio">Todos</button>
        <button role="radio">RPG</button>
      </div>
    `;
    const [first, last] = document.querySelectorAll('[role="radio"]');
    cleanup = setupKeyboardNavigation();

    last.focus();
    last.dispatchEvent(new KeyboardEvent("keydown", { key: "Home", bubbles: true }));

    expect(document.activeElement).toBe(first);
  });

  it("should close an open menu and restore focus with Escape", () => {
    document.body.innerHTML = `
      <details open>
        <summary>Menu</summary>
        <a href="/hub">Catálogo</a>
      </details>
    `;
    const details = document.querySelector("details");
    const summary = document.querySelector("summary");
    const link = document.querySelector("a");
    cleanup = setupKeyboardNavigation();

    link.focus();
    link.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));

    expect(details.open).toBe(false);
    expect(document.activeElement).toBe(summary);
  });
});
