import { describe, expect, it } from "vitest";
import { renderScreenshotGallery } from "../pages/game/GamePage";

const screenshots = (count) =>
  Array.from({ length: count }, (_, index) => ({
    type: "screenshot",
    position: index + 1,
    url: `https://example.com/screenshot-${index + 1}.jpg`,
  }));

describe("Game screenshot gallery", () => {
  it("should render an empty state when screenshots are unavailable", () => {
    const container = document.createElement("div");

    container.innerHTML = renderScreenshotGallery("Hades", []);

    expect(container.querySelector(".screenshot-empty")?.textContent).toContain(
      "Sem imagens disponíveis deste jogo."
    );
  });

  it("should render up to four screenshots as a grid", () => {
    const container = document.createElement("div");

    container.innerHTML = renderScreenshotGallery("Hades", screenshots(4));

    expect(container.querySelectorAll(".screenshot-grid .screenshot-card")).toHaveLength(4);
  });

  it("should render five or more screenshots as a horizontal carousel", () => {
    const container = document.createElement("div");

    container.innerHTML = renderScreenshotGallery("Hades", screenshots(5));

    expect(container.querySelector("[data-screenshot-carousel]")).not.toBeNull();
  });

  it("should display no more than ten screenshots", () => {
    const container = document.createElement("div");

    container.innerHTML = renderScreenshotGallery("Hades", screenshots(12));

    expect(container.querySelectorAll(".screenshot-card")).toHaveLength(10);
  });
});
