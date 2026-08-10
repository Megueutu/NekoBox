import { describe, expect, it, vi } from "vitest";
import { routes } from "../app/router/routes";
import { Footer } from "../components/layout/Footer";
import PrivacyPage from "../pages/info/legal/PrivacyPage";
import TermsPage from "../pages/info/legal/TermsPage";
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

  it.each([
    ["Terms", TermsPage],
    ["Privacy", PrivacyPage],
  ])("should render a decorative game banner on the %s page", async (_, renderPage) => {
    const container = document.createElement("div");

    container.innerHTML = await renderPage();

    const hero = container.querySelector(".content-hero");
    expect(hero?.querySelector(".content-hero__image")?.getAttribute("alt")).toBe("");
    expect(hero?.querySelector(".content-hero__image")?.getAttribute("src")).toBe("https://example.com/hades.jpg");
    expect(hero?.querySelector(".content-hero__backdrop")?.getAttribute("aria-hidden")).toBe("true");
  });

  it("should keep the local banner when the catalog is unavailable", async () => {
    GamesService.getAll.mockRejectedValueOnce(new Error("offline"));
    const container = document.createElement("div");

    container.innerHTML = await TermsPage();

    expect(container.querySelector(".content-hero__image")?.getAttribute("src"))
      .toBe("/mocks/callofduty.png");
  });
});
