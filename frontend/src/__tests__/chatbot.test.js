import { afterEach, describe, expect, it, vi } from "vitest";
import { renderChatbot, setupChatbot } from "../components/Chatbot";
import { ChatbotService } from "../services/chatbot.service";
import { PublicLayout } from "../app/layouts/PublicLayout";

afterEach(() => { document.body.innerHTML = ""; localStorage.clear(); vi.restoreAllMocks(); });

describe("GameBot chat interface", () => {
  it("should only render when a public page explicitly enables it", () => {
    expect(PublicLayout("<p>Conteúdo</p>")).not.toContain("data-chatbot");
    expect(PublicLayout("<p>Conteúdo</p>", { showChatbot: true })).toContain("data-chatbot");
  });

  it("should render a collapsed, accessible chat control", () => {
    document.body.innerHTML = renderChatbot();
    expect(document.querySelector("[data-chatbot-toggle]")?.getAttribute("aria-expanded")).toBe("false");
    expect(document.getElementById("chatbot-panel")?.hidden).toBe(true);
    expect(document.querySelector(".chatbot__backdrop")?.hidden).toBe(true);
  });

  it("should open, send a message and close with Escape", async () => {
    vi.spyOn(ChatbotService, "sendMessage").mockResolvedValue({ response: "Hades é uma ótima escolha." });
    document.body.innerHTML = renderChatbot();
    const cleanup = setupChatbot();
    document.querySelector("[data-chatbot-toggle]").click();
    expect(document.getElementById("chatbot-panel")?.hidden).toBe(false);
    expect(document.querySelector(".chatbot__backdrop")?.hidden).toBe(false);
    const input = document.getElementById("chatbot-input");
    input.value = "Me recomende um roguelike";
    document.querySelector("[data-chatbot-form]").dispatchEvent(new Event("submit", { bubbles: true, cancelable: true }));
    await vi.waitFor(() => expect(ChatbotService.sendMessage).toHaveBeenCalledOnce());
    expect(document.querySelector("[data-chatbot-messages]").textContent).toContain("Hades é uma ótima escolha.");
    document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));
    await vi.waitFor(() => expect(document.getElementById("chatbot-panel")?.hidden).toBe(true));
    cleanup();
  });
});
