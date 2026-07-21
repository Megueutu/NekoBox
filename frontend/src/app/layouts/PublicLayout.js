import { Navbar } from "../../components/layout/Navbar";
import { Footer } from "../../components/layout/Footer";

export function PublicLayout(content) {
  return `
    <div class="min-h-screen flex flex-col">
      <a href="#main-content" class="skip-link">Pular para o conteúdo</a>
      ${Navbar()}
      <main id="main-content" tabindex="-1" class="flex-1 bg-transparent">
        ${content}
      </main>
      ${Footer()}
    </div>
  `;
}
