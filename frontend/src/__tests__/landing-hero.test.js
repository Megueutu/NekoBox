import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import LandingPage, {
  afterRender,
  LANDING_HERO_INTERVAL_MS,
} from "../pages/landing/LandingPage";
import { GamesService } from "../services/games/games.service";

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
  short_description: `Descrição ${index + 1}`,
  price: 50 + index,
  categories: ["Ação"],
  reviews: [],
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

    const controls = [...document.querySelectorAll("[data-hero-slide]")];
    const labels = controls.map((control) => control.getAttribute("aria-label"));

    expect(new Set(labels).size).toBe(5);
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

  it("should pause and resume automatic rotation", async () => {
    document.body.innerHTML = await LandingPage();
    afterRender();
    const pauseButton = document.querySelector("[data-hero-pause]");
    const initialTitle = document.getElementById("landing-title").textContent;

    pauseButton.click();
    await vi.advanceTimersByTimeAsync(LANDING_HERO_INTERVAL_MS);

    expect(document.getElementById("landing-title").textContent).toBe(initialTitle);
    expect(pauseButton.getAttribute("aria-pressed")).toBe("true");

    pauseButton.click();
    await vi.advanceTimersByTimeAsync(LANDING_HERO_INTERVAL_MS);

    expect(document.getElementById("landing-title").textContent).not.toBe(initialTitle);
  });

  it("should keep the hero static when reduced motion is requested", async () => {
    window.matchMedia = vi.fn(() => ({ matches: true }));
    document.body.innerHTML = await LandingPage();
    afterRender();
    const initialTitle = document.getElementById("landing-title").textContent;

    await vi.advanceTimersByTimeAsync(LANDING_HERO_INTERVAL_MS);

    expect(document.getElementById("landing-title").textContent).toBe(initialTitle);
  });
});
