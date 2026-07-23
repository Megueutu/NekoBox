import { describe, expect, it } from "vitest";
import { renderLoadError } from "../app/router/router";

describe("Load error page", () => {
  it("should render a full-screen retry action with accessible semantics", () => {
    const container = document.createElement("div");

    container.innerHTML = renderLoadError();

    expect(container.querySelector("main.error-page")).not.toBeNull();
    expect(container.querySelector('[aria-labelledby="error-page-title"]')).not.toBeNull();
    expect(container.querySelector("#btn-retry-page")?.textContent).toContain("Tentar novamente");
    expect(container.querySelector("#btn-retry-page svg")).not.toBeNull();
  });
});
