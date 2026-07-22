import { describe, expect, it } from "vitest";
import { routes } from "../app/router/routes";
import { Footer } from "../components/layout/Footer";

describe("Legal pages navigation", () => {
  it.each(["/termos-de-uso", "/privacidade"])("should expose %s as a public route", (path) => {
    const route = routes.find((item) => item.path === path);

    expect(route?.private).toBe(false);
  });

  it("should link both legal pages from the footer", () => {
    const container = document.createElement("div");
    container.innerHTML = Footer();

    expect(container.querySelectorAll('a[href="/termos-de-uso"], a[href="/privacidade"]')).toHaveLength(2);
  });
});
