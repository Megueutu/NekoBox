import { Navbar } from "../../components/layout/Navbar";
import { Footer } from "../../components/layout/Footer";
import { SidebarAccount } from "../../components/layout/SidebarAccount";

export function PrivateLayout(content) {
  return `
    <div class="app-shell app-shell--private min-h-screen flex flex-col">
      <div class="app-ambient" aria-hidden="true">
        <span class="app-ambient__blob app-ambient__blob--one"></span>
        <span class="app-ambient__blob app-ambient__blob--two"></span>
        <span class="app-ambient__grid"></span>
      </div>
      <a href="#main-content" class="skip-link">Pular para o conteúdo</a>
      ${Navbar()}
      <main id="main-content" tabindex="-1" class="flex-1 bg-transparent">
        <div class="site-container account-shell">
          <div class="account-sidebar">
            ${SidebarAccount()}
          </div>
          <div class="account-content">
            ${content}
          </div>
        </div>
      </main>
      ${Footer()}
    </div>
  `;
}
