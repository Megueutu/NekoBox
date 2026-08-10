import { describe, expect, it } from "vitest";
import { renderErrorPage } from "../pages/error/ErrorPage";

describe("Error page", () => {
  it("should render a full-screen retry action with accessible semantics for load errors", () => {
    const container = document.createElement("div");

    container.innerHTML = renderErrorPage("load-error");

    expect(container.querySelector("main.error-page")).not.toBeNull();
    expect(container.querySelector('[aria-labelledby="error-page-title"]')).not.toBeNull();
    expect(container.querySelector("#btn-retry-page")?.textContent).toContain("Tentar novamente");
    expect(container.querySelector("#btn-retry-page svg")).not.toBeNull();
  });

  it("should render a not-found action pointing back to the hub", () => {
    const container = document.createElement("div");

    container.innerHTML = renderErrorPage("not-found");

    expect(container.querySelector("main.error-page")).not.toBeNull();
    expect(container.querySelector("#error-page-title")?.textContent).toContain("não encontrada");
    expect(container.querySelector('a[href="/hub"]')?.textContent).toContain("Retornar ao Hub");
  });
});
