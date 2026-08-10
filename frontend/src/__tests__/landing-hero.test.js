import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import LandingPage, {
  afterRender,
  LANDING_HERO_INTERVAL_MS,
} from "../pages/landing/LandingPage";
import { GamesService } from "../services/games/games.service";

const gameCategories = ["Ação", "Aventura", "RPG", "Mundo Aberto", "Fantasia", "Roguelike", "Indie"];

const games = [
  "Cyberpunk 2077",
  "The Witcher 3: Wild Hunt",
  "Red Dead Redemption 2",
  "Elden Ring",
  "Hollow Knight",
  "Hades",
].map((title, index) => ({
  id: String(index + 1),
  title,
  slug: `game-${index + 1}`,
  price: 50 + index,
  categories: gameCategories,
  media: [{ type: "banner", url: `https://example.com/banner-${index + 1}.jpg` }],
}));

vi.mock("../services/games/games.service", () => ({
  GamesService: { getAll: vi.fn() },
}));

beforeEach(() => {
  vi.useFakeTimers();
  localStorage.clear();
  GamesService.getAll.mockResolvedValue(games);
  window.matchMedia = vi.fn(() => ({ matches: false }));
  window.requestAnimationFrame = vi.fn((callback) => callback());
  window.IntersectionObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
});

afterEach(() => {
  window.dispatchEvent(new CustomEvent("rerender"));
  vi.useRealTimers();
  vi.restoreAllMocks();
  document.body.innerHTML = "";
});

describe("Landing hero rotation", () => {
  it("should render five unique games in the hero rotation", async () => {
    document.body.innerHTML = await LandingPage();
    afterRender();

    const titles = [document.getElementById("landing-title").textContent];
    for (let i = 0; i < 4; i += 1) {
      await vi.advanceTimersByTimeAsync(LANDING_HERO_INTERVAL_MS);
      titles.push(document.getElementById("landing-title").textContent);
    }

    expect(new Set(titles).size).toBe(5);
  });

  it("should advance the featured game and loop automatically", async () => {
    document.body.innerHTML = await LandingPage();
    afterRender();
    const initialTitle = document.getElementById("landing-title").textContent;

    await vi.advanceTimersByTimeAsync(LANDING_HERO_INTERVAL_MS);
    const nextTitle = document.getElementById("landing-title").textContent;
    await vi.advanceTimersByTimeAsync(LANDING_HERO_INTERVAL_MS * 4);

    expect(nextTitle).not.toBe(initialTitle);
    expect(document.getElementById("landing-title").textContent).toBe(initialTitle);
  });

  it("should keep the hero static when reduced motion is requested", async () => {
    window.matchMedia = vi.fn(() => ({ matches: true }));
    document.body.innerHTML = await LandingPage();
    afterRender();
    const initialTitle = document.getElementById("landing-title").textContent;

    await vi.advanceTimersByTimeAsync(LANDING_HERO_INTERVAL_MS);

    expect(document.getElementById("landing-title").textContent).toBe(initialTitle);
  });

  it("should show up to five category tags for the featured game", async () => {
    document.body.innerHTML = await LandingPage();
    afterRender();

    const tags = [...document.querySelectorAll("[data-hero-categories] .chip")].map(
      (chip) => chip.textContent
    );

    expect(tags).toEqual(gameCategories.slice(0, 5));
  });
});

describe("Landing navigation background", () => {
  it("should stay transparent until the user scrolls", async () => {
    Object.defineProperty(window, "scrollY", { configurable: true, value: 0, writable: true });
    document.body.innerHTML = await LandingPage();
    afterRender();

    const nav = document.querySelector(".site-nav--landing");
    expect(nav.classList.contains("site-nav--scrolled")).toBe(false);

    window.scrollY = 24;
    window.dispatchEvent(new Event("scroll"));

    expect(nav.classList.contains("site-nav--scrolled")).toBe(true);
  });
});

describe("Landing membership call to action", () => {
  it("should pair the account invitation with decorative catalog artwork", async () => {
    document.body.innerHTML = await LandingPage();

    const membership = document.querySelector(".landing-membership");

    expect({
      hidden: membership?.querySelector(".content-hero__backdrop")?.getAttribute("aria-hidden"),
      imageAlt: membership?.querySelector(".content-hero__image")?.getAttribute("alt"),
    }).toEqual({ hidden: "true", imageAlt: "" });
  });

  it("should preserve the account and catalog destinations", async () => {
    document.body.innerHTML = await LandingPage();

    const destinations = [...document.querySelectorAll(".landing-membership .content-hero__actions a")]
      .map((link) => link.getAttribute("href"));

    expect(destinations).toEqual(["/login", "/hub"]);
  });
});
