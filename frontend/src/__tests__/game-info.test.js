import { describe, expect, it } from "vitest";
import { renderAboutGame } from "../pages/games/game/GamePage";

describe("Game information sections", () => {
  it("should render the description inside a scrollable container", () => {
    const container = document.createElement("div");

    container.innerHTML = renderAboutGame("Uma aventura épica.", []);

    expect(container.querySelector("[data-game-description]")?.textContent).toContain(
      "Uma aventura épica."
    );
  });

  it("should render game tags as hashtags without spaces", () => {
    const container = document.createElement("div");

    container.innerHTML = renderAboutGame("Uma aventura épica.", [
      "Fantasia",
      "Mundo aberto",
    ]);

    expect(container.querySelector('[aria-label="Hashtags do jogo"]')?.parentElement).toBe(
      container
    );
    const hashtags = [...container.querySelectorAll(".game-hashtag")].map((el) => el.textContent);
    expect(hashtags).toEqual(["#Fantasia", "#Mundoaberto"]);
  });

  it("should show a publisher and release date credit line when provided", () => {
    const container = document.createElement("div");

    container.innerHTML = renderAboutGame("Uma aventura épica.", [], "CD PROJEKT RED", "2020-12-10");

    expect(container.textContent).toContain("Publicado por CD PROJEKT RED em");
  });

  it("should omit the credit line when publisher and release date are missing", () => {
    const container = document.createElement("div");

    container.innerHTML = renderAboutGame("Uma aventura épica.", []);

    expect(container.textContent).not.toContain("Publicado por");
  });
});
