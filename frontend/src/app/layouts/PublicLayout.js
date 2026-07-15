import { Navbar } from "../../components/layout/Navbar";
import { Footer } from "../../components/layout/Footer";

export function PublicLayout(content) {
  return `
    <div class="min-h-screen flex flex-col">
      ${Navbar()}
      <main class="flex-1 bg-transparent">
        ${content}
      </main>
      ${Footer()}
    </div>
  `;
}
