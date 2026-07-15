import { Navbar } from "../../components/layout/Navbar";
import { Footer } from "../../components/layout/Footer";
import { SidebarAccount } from "../../components/layout/SidebarAccount";

export function PrivateLayout(content) {
  return `
    <div class="min-h-screen flex flex-col">
      ${Navbar()}
      <main class="flex-1 bg-transparent">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 py-8 grid grid-cols-1 md:grid-cols-4 gap-6">
          <div class="md:col-span-1">
            ${SidebarAccount()}
          </div>
          <div class="md:col-span-3">
            ${content}
          </div>
        </div>
      </main>
      ${Footer()}
    </div>
  `;
}
