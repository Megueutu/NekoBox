const CHATBOT_API_URL = (import.meta.env.VITE_CHATBOT_API_URL || "http://localhost:8000").replace(/\/$/, "");

export const ChatbotService = {
  async sendMessage({ message, sessionId, userId }) {
    const response = await fetch(`${CHATBOT_API_URL}/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ message, session_id: sessionId, usuario_id: userId }),
    });
    const payload = await response.json().catch(() => null);
    if (!response.ok || !payload?.response) throw new Error(payload?.detail || "Não foi possível enviar a mensagem.");
    return payload;
  },
};
