import { describe, expect, it, vi } from "vitest";
import AccessibilityPage from "../pages/accessibility/AccessibilityPage";
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

    const hero = container.querySelector(".accessibility-hero");
    expect(hero?.getAttribute("aria-labelledby")).toBe("accessibility-title");
    expect(hero?.querySelector(".accessibility-hero__backdrop")?.getAttribute("aria-hidden")).toBe("true");
    expect(hero?.querySelector(".accessibility-hero__image")?.getAttribute("alt")).toBe("");
    expect(hero?.querySelector("h1")?.textContent).toContain("experiências para todos");
  });

  it("should keep the page sections addressable from its shortcut navigation", async () => {
    const container = document.createElement("div");

    container.innerHTML = await AccessibilityPage();

    const targets = [...container.querySelectorAll(".accessibility-shortcuts a")]
      .map((link) => link.getAttribute("href"));

    expect(targets).toEqual(["#premissa", "#principios", "#normas", "#recursos", "#evolucao"]);
    expect(targets.every((target) => container.querySelector(target))).toBe(true);
  });

  it("should keep the local fallback when the catalog is unavailable", async () => {
    GamesService.getAll.mockRejectedValueOnce(new Error("offline"));

    const container = document.createElement("div");
    container.innerHTML = await AccessibilityPage();

    expect(container.querySelector(".accessibility-hero__image")?.getAttribute("src"))
      .toBe("/mocks/callofduty.png");
  });
});
