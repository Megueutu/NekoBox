import { Store } from "../store/store";
import { Icon, icons } from "./ui/Icon";
import { ChatbotService } from "../services/chatbot.service";

const SESSION_KEY = "nekobox_chatbot_session";
const PANEL_TRANSITION_MS = 180;

function getSessionId() {
  const storedSessionId = localStorage.getItem(SESSION_KEY);
  if (storedSessionId) return storedSessionId;

  const sessionId = globalThis.crypto?.randomUUID?.() || `chat-${Date.now()}`;
  localStorage.setItem(SESSION_KEY, sessionId);
  return sessionId;
}

export function renderChatbot() {
  return `
    <aside class="chatbot" aria-label="Assistente GameBot" data-chatbot>
      <button class="chatbot__trigger" type="button" aria-expanded="false" aria-controls="chatbot-panel" data-chatbot-toggle>
        ${Icon(icons.messageCircle, { className: "w-5 h-5" })}
        <span class="sr-only">Abrir assistente GameBot</span>
      </button>
      <button class="chatbot__backdrop" type="button" data-chatbot-close aria-label="Fechar conversa" hidden></button>
      <section id="chatbot-panel" class="chatbot__panel" aria-label="Conversa com o GameBot" aria-hidden="true" hidden tabindex="-1">
        <header class="chatbot__header">
          <div class="chatbot__identity">
            <span class="chatbot__avatar" aria-hidden="true">${Icon(icons.gamepad, { className: "w-5 h-5" })}</span>
            <div><p class="chatbot__eyebrow">Assistente NekoBox</p><h2>GameBot <span>online</span></h2></div>
          </div>
          <button class="chatbot__close" type="button" data-chatbot-close aria-label="Fechar assistente">${Icon(icons.x, { className: "w-4 h-4" })}</button>
        </header>
        <div class="chatbot__messages" data-chatbot-messages role="log" aria-live="polite" aria-relevant="additions"></div>
        <form class="chatbot__form" data-chatbot-form>
          <label class="sr-only" for="chatbot-input">Mensagem para o GameBot</label>
          <input id="chatbot-input" name="message" rows="1" maxlength="2000" placeholder="Pergunte sobre jogos..." required></input>
          <button class="chatbot__send" type="submit">${Icon(icons.arrowLeft, { className: "w-4 h-4 chatbot__send-icon" })}</button>
        </form>
      </section>
    </aside>`;
}

function appendMessage(messages, content, type) {
  const message = document.createElement("p");
  message.className = `chatbot__message chatbot__message--${type}`;
  message.textContent = content;
  messages.append(message);
  messages.scrollTop = messages.scrollHeight;
}

export function setupChatbot() {
  let triggerBeforeOpen = null;
  let closeTimer = null;

  const getElements = () => ({ panel: document.getElementById("chatbot-panel"), trigger: document.querySelector("[data-chatbot-toggle]"), backdrop: document.querySelector(".chatbot__backdrop"), input: document.getElementById("chatbot-input") });
  const close = ({ restoreFocus = true } = {}) => {
    const { panel, trigger, backdrop } = getElements();
    if (!panel || !trigger || panel.hidden || panel.dataset.state === "closing") return;
    panel.dataset.state = "closing";
    backdrop.dataset.state = "closing";
    panel.setAttribute("aria-hidden", "true");
    trigger.setAttribute("aria-expanded", "false");
    closeTimer = window.setTimeout(() => {
      panel.hidden = true;
      backdrop.hidden = true;
      delete panel.dataset.state;
      delete backdrop.dataset.state;
      closeTimer = null;
    }, PANEL_TRANSITION_MS);
    if (restoreFocus) (triggerBeforeOpen || trigger).focus();
  };
  const open = () => {
    const { panel, trigger, backdrop, input } = getElements();
    if (!panel || !trigger) return;
    if (closeTimer) {
      window.clearTimeout(closeTimer);
      closeTimer = null;
    }
    triggerBeforeOpen = document.activeElement;
    panel.hidden = false;
    backdrop.hidden = false;
    panel.dataset.state = "opening";
    backdrop.dataset.state = "opening";
    panel.setAttribute("aria-hidden", "false");
    trigger.setAttribute("aria-expanded", "true");
    window.requestAnimationFrame(() => {
      panel.dataset.state = "open";
      backdrop.dataset.state = "open";
    });
    input?.focus();
  };
  const onClick = (event) => {
    if (event.target.closest("[data-chatbot-toggle]")) {
      const { panel } = getElements();
      if (panel?.hidden) open(); else close();
    }
    if (event.target.closest("[data-chatbot-close]")) close();
  };
  const onKeydown = (event) => { if (event.key === "Escape") close(); };
  const onSubmit = async (event) => {
    const form = event.target.closest("[data-chatbot-form]");
    if (!form) return;
    event.preventDefault();
    const input = form.elements.message;
    const message = input.value.trim();
    const messages = document.querySelector("[data-chatbot-messages]");
    const submitButton = form.querySelector("button[type='submit']");

    if (!message || !messages || !submitButton) return;
    
    appendMessage(messages, message, "user");
    input.value = "";
    submitButton.disabled = true;
    
    
    try {
      const user = Store.getState().user;
      const response = await ChatbotService.sendMessage({ message, sessionId: getSessionId(), userId: user?.id ?? user?.id_usuario ?? null });
      appendMessage(messages, response.response, "bot");
    }
    
    catch {
      appendMessage(messages, "Não consegui responder agora. Tente novamente em instantes.", "bot");
    }
    
    finally {
      submitButton.disabled = false;
      input.focus();
    }
  };
  document.addEventListener("click", onClick);
  document.addEventListener("keydown", onKeydown);
  document.addEventListener("submit", onSubmit);
  return () => {
    if (closeTimer) window.clearTimeout(closeTimer);
    document.removeEventListener("click", onClick);
    document.removeEventListener("keydown", onKeydown);
    document.removeEventListener("submit", onSubmit);
  };
}
