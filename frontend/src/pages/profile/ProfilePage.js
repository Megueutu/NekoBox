import { PrivateLayout } from "../../app/layouts/PrivateLayout";
import { Store } from "../../store/store";
import { Actions } from "../../store/actions";
import { navigate } from "../../app/router/navigate";
import { AuthService } from "../../services/auth/auth.service";

export default function ProfilePage() {
  const { user } = Store.getState();

  const content = `
    <div class="space-y-6">
      <div>
        <h1 class="font-display text-2xl font-bold">Meu Perfil</h1>
        <p class="text-muted text-sm mt-1">Gerencie seus dados cadastrais e preferências de conta.</p>
      </div>

      <!-- Formulário de Perfil -->
      <div class="bg-surface border border-[var(--color-border)] rounded-xl p-6">
        <h2 class="font-display font-semibold text-base mb-5 border-b border-[var(--color-border)] pb-3">Informações Pessoais</h2>

        <div class="flex flex-col sm:flex-row items-start gap-6 mb-6">
          <!-- Preview do Avatar -->
          <div>
            <div id="avatar-preview"
                 class="w-20 h-20 rounded-full bg-cover bg-center bg-[var(--color-surface-2)] border-2 border-[var(--color-brand-500)]/50"
                 style="background-image: url('${user?.avatar_url || "https://picsum.photos/seed/defaultavatar/150/150"}'); box-shadow: 0 0 16px -3px rgba(147,51,234,0.6);"></div>
            <p class="text-xs text-[var(--color-muted-2)] mt-2 text-center">Avatar</p>
          </div>

          <!-- Campo URL do Avatar -->
          <div class="flex-1 w-full">
            <label class="block text-sm font-medium text-muted mb-1">URL do Avatar</label>
            <input id="input-avatar-url" type="url"
                   value="${user?.avatar_url || ""}"
                   placeholder="https://..."
                   class="w-full px-3 py-2.5 bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-lg text-sm text-[var(--color-ink)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-500)] focus:border-transparent"/>
            <p class="text-xs text-[var(--color-muted-2)] mt-1">Cole a URL de uma imagem para usar como foto de perfil.</p>
          </div>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <div>
            <label class="block text-sm font-medium text-muted mb-1">Nome de Usuário</label>
            <input id="input-username" type="text"
                   value="${user?.username || ""}"
                   placeholder="seu_usuario"
                   class="w-full px-3 py-2.5 bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-lg text-sm text-[var(--color-ink)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-500)]"/>
          </div>
          <div>
            <label class="block text-sm font-medium text-muted mb-1">E-mail</label>
            <input type="email" value="${user?.email || ""}" disabled
                   class="w-full px-3 py-2.5 bg-[var(--color-surface-2)]/50 border border-[var(--color-border)] rounded-lg text-sm text-[var(--color-muted-2)] cursor-not-allowed"/>
            <p class="text-xs text-[var(--color-muted-2)] mt-1">O e-mail não pode ser alterado.</p>
          </div>
        </div>

        <div class="mb-5">
          <label class="block text-sm font-medium text-muted mb-1">Bio</label>
          <textarea id="input-bio" rows="3"
                    placeholder="Fale um pouco sobre você..."
                    class="w-full px-3 py-2.5 bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-lg text-sm text-[var(--color-ink)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-500)] resize-none">${user?.bio || ""}</textarea>
        </div>

        <div class="flex items-center gap-3">
          <button id="btn-save-profile"
                  class="px-5 py-2.5 bg-gradient-to-r from-[var(--color-brand-500)] to-[var(--color-brand-700)] text-white font-bold text-sm rounded-lg hover:brightness-110 transition-all glow-brand">
            Salvar Alterações
          </button>
          <p id="profile-msg" class="text-[var(--color-accent-400)] text-sm hidden">✓ Perfil atualizado com sucesso!</p>
        </div>
      </div>

      <!-- Zona de Perigo -->
      <div class="bg-surface border border-red-500/30 rounded-xl p-6">
        <h2 class="font-display font-semibold text-base mb-1 text-red-400">Zona de Perigo</h2>
        <p class="text-muted text-sm mb-4">Ações irreversíveis de conta.</p>
        <button id="btn-logout-profile"
                class="px-5 py-2.5 border-2 border-red-400/60 text-red-400 font-bold text-sm rounded-lg hover:bg-red-500 hover:text-white hover:border-red-500 transition-colors">
          Sair da Conta
        </button>
      </div>
    </div>
  `;

  return PrivateLayout(content);
}

export async function afterRender() {
  // Preview do avatar em tempo real
  const avatarInput = document.getElementById("input-avatar-url");
  const avatarPreview = document.getElementById("avatar-preview");
  avatarInput?.addEventListener("input", (e) => {
    if (avatarPreview && e.target.value) {
      avatarPreview.style.backgroundImage = `url('${e.target.value}')`;
    }
  });

  // Salvar perfil
  document.getElementById("btn-save-profile")?.addEventListener("click", () => {
    const username = document.getElementById("input-username")?.value || "";
    const bio = document.getElementById("input-bio")?.value || "";
    const avatarUrl = document.getElementById("input-avatar-url")?.value || "";
    Actions.atualizarDadosPerfil(username, bio, avatarUrl);

    const msg = document.getElementById("profile-msg");
    if (msg) {
      msg.classList.remove("hidden");
      setTimeout(() => msg.classList.add("hidden"), 3000);
    }
  });

  // Logout
  document.getElementById("btn-logout-profile")?.addEventListener("click", async () => {
    await AuthService.logout();
    navigate("/hub");
  });

  // Logout da sidebar
  document.getElementById("btn-sidebar-logout")?.addEventListener("click", async () => {
    await AuthService.logout();
    navigate("/hub");
  });
}
