import { Icon, icons } from "../../components/ui/Icon";

export function AdminLayout(content, activeSection = "users") {
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
        <a href="/admin" data-link class="admin-brand" aria-label="NekoBox Admin">
          <img src="/cat.svg" class="admin-brand__mark" alt="" aria-hidden="true" />
          <img src="/logo.svg" class="admin-brand__logo" alt="NekoBox" />
        </a>
        <nav class="admin-nav" aria-label="Administração">
          ${item("users", "Usuários", icons.users)}
          ${item("games", "Jogos", icons.gamepad)}
        </nav>
        <div class="admin-sidebar__actions">
          <button id="admin-logout" type="button">${Icon(icons.logOut, { className: "w-4 h-4" })} Sair</button>
        </div>
      </aside>
      <main id="admin-content" tabindex="-1" class="admin-main">
        ${content}
      </main>
    </div>
  `;
}
