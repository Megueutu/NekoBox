import { describe, it, expect, vi, beforeEach } from "vitest";
import { navigate } from "../app/router/navigate";

describe("navigate", () => {
  beforeEach(() => {
    window.history.pushState({}, "", "/hub");
    window.scrollTo = vi.fn();
  });

  it("Deve rolar a página para o topo ao navegar para uma nova rota", () => {
    navigate("/game/cyberpunk-2077");

    expect(window.scrollTo).toHaveBeenCalledWith({ top: 0, left: 0, behavior: "instant" });
  });

  it("Deve atualizar a URL via pushState", () => {
    navigate("/game/cyberpunk-2077");

    expect(window.location.pathname).toBe("/game/cyberpunk-2077");
  });

  it("Deve disparar o evento de rerender com o focusTarget informado", () => {
    const listener = vi.fn();
    window.addEventListener("rerender", listener, { once: true });

    navigate("/game/cyberpunk-2077");

    expect(listener).toHaveBeenCalledTimes(1);
    expect(listener.mock.calls[0][0].detail.focusTarget).toBe("#main-content");
  });
});
