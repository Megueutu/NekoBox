import { Icon, icons } from "../../components/ui/Icon";

export function AdminLayout(content, activeSection = "dashboard") {
  const item = (section, label, icon) => `
    <button type="button" class="admin-nav__item ${activeSection === section ? "admin-nav__item--active" : ""}"
            data-admin-section="${section}" ${activeSection === section ? 'aria-current="page"' : ""}>
      ${Icon(icon, { className: "w-4 h-4" })}
      <span>${label}</span>
    </button>
  `;

  return `
    <div class="admin-shell">
      <a href="#admin-content" class="skip-link">Pular para o conteúdo</a>
      <aside class="admin-sidebar">
        <a href="/admin" data-link class="admin-brand" aria-label="NexusPlay Admin — início">
          <span>${Icon(icons.shieldCheck, { className: "w-5 h-5" })}</span>
          <strong>NEXUS<em>ADMIN</em></strong>
        </a>
        <nav class="admin-nav" aria-label="Administração">
          ${item("dashboard", "Dashboard", icons.dashboard)}
          ${item("gift-cards", "Gift cards", icons.gift)}
          ${item("users", "Usuários", icons.users)}
          ${item("games", "Jogos", icons.gamepad)}
        </nav>
        <div class="admin-sidebar__footer">
          <a href="/hub" data-link>${Icon(icons.arrowLeft, { className: "w-4 h-4" })} Voltar à loja</a>
          <button id="admin-logout" type="button">${Icon(icons.logOut, { className: "w-4 h-4" })} Sair</button>
        </div>
      </aside>
      <main id="admin-content" tabindex="-1" class="admin-main">
        ${content}
      </main>
    </div>
  `;
}
