import { describe, expect, it } from "vitest";
import {
  renderAboutGame,
  renderLanguages,
  renderSystemRequirements,
} from "../pages/games/game/GamePage";
import { Icon, icons } from "../components/ui/Icon";

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

  it("should render system requirements with semantic labels and breakable values", () => {
    const container = document.createElement("div");

    container.innerHTML = renderSystemRequirements(
      {
        os: "Windows 10 64-bit",
        cpu: "Processador com um nome excepcionalmente longo",
        ram: "12 GB",
        gpu: "GTX 780",
        storage: "70 GB SSD",
      },
      null
    );

    expect(container.querySelector("dl dt")?.textContent).toBe("Sistema operacional");
    expect(container.querySelector(".game-requirement-card")?.textContent).toContain("70 GB SSD");
  });

  it("should render language availability with Lucide icons instead of check characters", () => {
    const container = document.createElement("div");

    container.innerHTML = renderLanguages([
      {
        name: "Português (Brasil)",
        interface: true,
        subtitles: true,
        audio: false,
      },
    ]);

    const checkIcon = Icon(icons.check, { className: "w-4 h-4", strokeWidth: 2.5 });
    const unavailableIcon = Icon(icons.x, { className: "w-4 h-4", strokeWidth: 2.5 });

    expect(container.innerHTML.split(checkIcon)).toHaveLength(3);
    expect(container.innerHTML).toContain(unavailableIcon);
    expect(container.textContent).not.toContain("✓");
  });

  it("should expose language support as readable text alongside icons", () => {
    const container = document.createElement("div");

    container.innerHTML = renderLanguages([
      { name: "Inglês", interface: true, subtitles: false, audio: true },
    ]);

    expect(container.querySelector("ul")?.getAttribute("aria-label")).toBe(
      "Recursos disponíveis em Inglês"
    );
    expect(container.textContent).toContain("Indisponível");
  });
});
