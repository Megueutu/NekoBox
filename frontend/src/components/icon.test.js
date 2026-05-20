import { describe, it, expect } from "vitest";
import { Icon } from "./icon.js";

describe("Icon", () => {
  it("retorna um elemento <img>", () => {
    const el = Icon("arrow");
    expect(el.tagName).toBe("IMG");
  });

  it("src aponta para o svg correto", () => {
    const el = Icon("arrow");
    expect(el.src).toContain("arrow.svg");
  });

  it("define alt quando label é passado", () => {
    const el = Icon("arrow", "Voltar");
    expect(el.alt).toBe("Voltar");
  });

  it("alt fica vazio quando label é null", () => {
    const el = Icon("arrow");
    expect(el.alt).toBe("");
  });

  it("lança TypeError se icon não for passado", () => {
    expect(() => Icon()).toThrow(TypeError);
  });
});
