import { Store } from "../../store/store";
import { Icon, icons } from "../ui/Icon";
import { ChatbotService } from "../../services/chatbot/chatbot.service";

const SESSION_KEY = "nekobox_chatbot_session";

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
      <section id="chatbot-panel" class="chatbot__panel" aria-label="Conversa com o GameBot" aria-hidden="true" hidden>
        <header class="chatbot__header">
          <div><p class="chatbot__eyebrow">Assistente NekoBox</p><h2>GameBot</h2></div>
          <button class="chatbot__close" type="button" data-chatbot-close aria-label="Fechar assistente">${Icon(icons.x, { className: "w-4 h-4" })}</button>
        </header>
        <div class="chatbot__messages" data-chatbot-messages role="log" aria-live="polite" aria-relevant="additions">
          <p class="chatbot__message chatbot__message--bot">Oi! Posso ajudar a encontrar jogos, tirar dúvidas sobre o catálogo ou recomendar sua próxima aventura.</p>
        </div>
        <form class="chatbot__form" data-chatbot-form>
          <label class="sr-only" for="chatbot-input">Mensagem para o GameBot</label>
          <textarea id="chatbot-input" name="message" rows="2" maxlength="2000" placeholder="Pergunte sobre jogos..." required></textarea>
          <button class="button-primary chatbot__send" type="submit">Enviar</button>
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
  const getElements = () => ({ panel: document.getElementById("chatbot-panel"), trigger: document.querySelector("[data-chatbot-toggle]"), input: document.getElementById("chatbot-input") });
  const close = ({ restoreFocus = true } = {}) => {
    const { panel, trigger } = getElements();
    if (!panel || !trigger || panel.hidden) return;
    panel.hidden = true;
    panel.setAttribute("aria-hidden", "true");
    trigger.setAttribute("aria-expanded", "false");
    if (restoreFocus) (triggerBeforeOpen || trigger).focus();
  };
  const open = () => {
    const { panel, trigger, input } = getElements();
    if (!panel || !trigger) return;
    triggerBeforeOpen = document.activeElement;
    panel.hidden = false;
    panel.setAttribute("aria-hidden", "false");
    trigger.setAttribute("aria-expanded", "true");
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
    submitButton.textContent = "Enviando...";
    try {
      const user = Store.getState().user;
      const response = await ChatbotService.sendMessage({ message, sessionId: getSessionId(), userId: user?.id ?? user?.id_usuario ?? null });
      appendMessage(messages, response.response, "bot");
    } catch {
      appendMessage(messages, "Não consegui responder agora. Tente novamente em instantes.", "bot");
    } finally {
      submitButton.disabled = false;
      submitButton.textContent = "Enviar";
      input.focus();
    }
  };
  document.addEventListener("click", onClick);
  document.addEventListener("keydown", onKeydown);
  document.addEventListener("submit", onSubmit);
  return () => { document.removeEventListener("click", onClick); document.removeEventListener("keydown", onKeydown); document.removeEventListener("submit", onSubmit); };
}
