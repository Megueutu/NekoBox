import { Navbar } from "../../components/layout/Navbar";
import { Footer } from "../../components/layout/Footer";

export function PublicLayout(content) {
  return `
    <div class="app-shell app-shell--public min-h-screen flex flex-col">
      <div class="app-ambient" aria-hidden="true">
        <span class="app-ambient__blob app-ambient__blob--one"></span>
        <span class="app-ambient__blob app-ambient__blob--two"></span>
        <span class="app-ambient__grid"></span>
      </div>
      <a href="#main-content" class="skip-link">Pular para o conteúdo</a>
      ${Navbar()}
      <main id="main-content" tabindex="-1" class="flex-1 bg-transparent">
        ${content}
      </main>
      ${Footer()}
    </div>
  `;
}
