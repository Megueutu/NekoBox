import { Navbar } from "../../components/layout/Navbar";
import { Footer } from "../../components/layout/Footer";
import { renderAuthDialog } from "../../components/AuthDialog";
import { renderChatbot } from "../../components/Chatbot";

export function PublicLayout(content, { showChatbot = false } = {}) {
  return `
    <div class="app-shell app-shell--public min-h-screen flex flex-col">
      <a href="#main-content" class="skip-link">Pular para o conteúdo</a>
      ${Navbar()}
      <main id="main-content" tabindex="-1" class="flex-1 bg-transparent">
        ${content}
      </main>
      ${Footer()}
      ${renderAuthDialog()}
      ${showChatbot ? renderChatbot() : ""}
    </div>
  `;
}
