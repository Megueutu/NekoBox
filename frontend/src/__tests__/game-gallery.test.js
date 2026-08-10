import { describe, expect, it } from "vitest";
import { renderScreenshotGallery } from "../pages/games/game/game-gallery";
import { MISSING_MEDIA_URL, setupMediaFallbacks } from "../utils/media-fallback";

const screenshots = (count) =>
  Array.from({ length: count }, (_, index) => ({
    type: "screenshot",
    position: index + 1,
    url: `https://example.com/screenshot-${index + 1}.jpg`,
  }));

describe("Game screenshot gallery", () => {
  it("should render the missing media fallback with a Lucide icon and no text", () => {
    const fallback = decodeURIComponent(MISSING_MEDIA_URL);

    expect(fallback).toContain('data-lucide="cloud-off"');
    expect(fallback).not.toContain("<text");
  });

  it("should replace images that fail to load with the media fallback", () => {
    const image = document.createElement("img");
    image.src = "https://example.com/missing-cover.jpg";
    document.body.append(image);
    const cleanup = setupMediaFallbacks();

    image.dispatchEvent(new Event("error"));

    expect(image.src).toBe(MISSING_MEDIA_URL);
    cleanup();
    image.remove();
  });

  it("should render an empty state when screenshots are unavailable", () => {
    const container = document.createElement("div");

    container.innerHTML = renderScreenshotGallery("Hades", []);

    expect(container.querySelector(".screenshot-empty")?.textContent).toContain(
      "Sem imagens disponíveis deste jogo."
    );
  });

  it("should render up to four screenshots as a horizontal carousel", () => {
    const container = document.createElement("div");

    container.innerHTML = renderScreenshotGallery("Hades", screenshots(4));

    expect(container.querySelector("[data-screenshot-carousel]")).not.toBeNull();
    expect(container.querySelectorAll(".screenshot-carousel__rail .screenshot-card:not([data-clone])")).toHaveLength(4);
  });

  it("should render five or more screenshots as a horizontal carousel", () => {
    const container = document.createElement("div");

    container.innerHTML = renderScreenshotGallery("Hades", screenshots(5));

    expect(container.querySelector("[data-screenshot-carousel]")).not.toBeNull();
  });

  it("should display no more than ten screenshots", () => {
    const container = document.createElement("div");

    container.innerHTML = renderScreenshotGallery("Hades", screenshots(12));

    expect(container.querySelectorAll(".screenshot-card:not([data-clone])")).toHaveLength(10);
  });

  it("should surround the real screenshots with hidden looping clones on both sides", () => {
    const container = document.createElement("div");

    container.innerHTML = renderScreenshotGallery("Hades", screenshots(4));

    const clones = [...container.querySelectorAll(".screenshot-card[data-clone]")];
    expect(clones).toHaveLength(8);
    expect(clones.every((clone) => clone.getAttribute("aria-hidden") === "true")).toBe(true);
    expect(container.querySelectorAll('.screenshot-card[data-clone="leading"]')).toHaveLength(4);
    expect(container.querySelectorAll('.screenshot-card[data-clone="trailing"]')).toHaveLength(4);

    const rail = container.querySelector(".screenshot-carousel__rail");
    const order = [...rail.children].map((card) =>
      card.hasAttribute("data-clone") ? card.getAttribute("data-clone") : "real"
    );
    expect(order).toEqual([
      "leading", "leading", "leading", "leading",
      "real", "real", "real", "real",
      "trailing", "trailing", "trailing", "trailing",
    ]);
  });

  it("should not clone a single screenshot", () => {
    const container = document.createElement("div");

    container.innerHTML = renderScreenshotGallery("Hades", screenshots(1));

    expect(container.querySelectorAll(".screenshot-card[data-clone]")).toHaveLength(0);
  });
});
