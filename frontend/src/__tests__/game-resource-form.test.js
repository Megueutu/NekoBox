import { describe, expect, it } from "vitest";
import { GameResourceForm } from "../components/game/GameResourceForm";

describe("GameResourceForm", () => {
  it("should render a reusable catalog form with responsive field groups", () => {
    const container = document.createElement("div");

    container.innerHTML = GameResourceForm({
      formId: "game-form",
      idPrefix: "game",
      game: { id: "game-1", titulo: "Hades II", preco: 89.9, status: "draft", tags: ["RPG"], midias: [] },
      submitLabel: "Salvar",
      introEyebrow: "Catálogo",
      introDescription: "Dados da vitrine.",
      mediaDeleteAttribute: "data-delete-media",
    });

    expect(container.querySelector(".admin-game-resource-form")).not.toBeNull();
    expect(container.querySelector(".admin-form-grid input[name='titulo']")?.value).toBe("Hades II");
    expect(container.querySelector("input[name='data_lancamento']")).not.toBeNull();
    expect(container.querySelector("input[name='poster']")).not.toBeNull();
    expect(container.querySelector("[data-game-preview]")).not.toBeNull();
  });
});
