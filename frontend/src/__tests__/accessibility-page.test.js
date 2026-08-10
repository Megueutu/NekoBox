import { describe, expect, it, vi } from "vitest";
import AccessibilityPage from "../pages/info/AccessibilityPage";
import { GamesService } from "../services/games/games.service";

vi.mock("../services/games/games.service", () => ({
  GamesService: {
    getAll: vi.fn().mockResolvedValue([
      {
        title: "Hades",
        media: [{ type: "banner", url: "https://example.com/hades.jpg" }],
      },
    ]),
  },
}));

describe("Accessibility page", () => {
  it("should render a semantic game hero without exposing decorative artwork", async () => {
    const container = document.createElement("div");

    container.innerHTML = await AccessibilityPage();

    const hero = container.querySelector(".content-hero");
    expect(hero?.getAttribute("aria-labelledby")).toBe("legal-title");
    expect(hero?.querySelector(".content-hero__backdrop")?.getAttribute("aria-hidden")).toBe("true");
    expect(hero?.querySelector(".content-hero__image")?.getAttribute("alt")).toBe("");
    expect(hero?.querySelector("h1")?.textContent).toContain("experiências para todos");
  });

  it("should keep the post-WCAG sections addressable from its sidebar index", async () => {
    const container = document.createElement("div");

    container.innerHTML = await AccessibilityPage();

    const targets = [...container.querySelectorAll(".legal-layout .legal-index a")]
      .map((link) => link.getAttribute("href"));

    expect(targets).toEqual(["#principios", "#normas", "#recursos"]);
    expect(targets.every((target) => container.querySelector(target))).toBe(true);
  });

  it("should structure the WCAG principles as ordered topics with practical examples", async () => {
    const container = document.createElement("div");

    container.innerHTML = await AccessibilityPage();

    const principles = container.querySelectorAll(".accessibility-principles > li");

    expect(principles).toHaveLength(4);
    expect([...principles].every((principle) => principle.querySelectorAll("ul > li").length === 3)).toBe(true);
    expect([...principles].map((principle) => principle.querySelector("h3 span")?.textContent))
      .toEqual(["1.1", "1.2", "1.3", "1.4"]);
  });

  it("should render the sections using the shared legal editorial layout", async () => {
    const container = document.createElement("div");

    container.innerHTML = await AccessibilityPage();

    expect(container.querySelectorAll(".legal-layout .legal-content > section")).toHaveLength(3);
  });

  it("should keep the local fallback when the catalog is unavailable", async () => {
    GamesService.getAll.mockRejectedValueOnce(new Error("offline"));

    const container = document.createElement("div");
    container.innerHTML = await AccessibilityPage();

    expect(container.querySelector(".content-hero__image")?.getAttribute("src"))
      .toBe("/mocks/callofduty.png");
  });
});
