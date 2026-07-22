import { PrivateLayout } from "../../app/layouts/PrivateLayout";
import { Store } from "../../store/store";
import { Actions } from "../../store/actions";
import { navigate } from "../../app/router/navigate";
import { AuthService } from "../../services/auth/auth.service";
import { PageHeader } from "../../components/ui/PageHeader";
import { Icon, icons } from "../../components/ui/Icon";
import { AccountService } from "../../services/account/account.service";

export default async function ProfilePage() {
  const user = await AccountService.getProfile();
  Store.setState((state) => ({ ...state, user }));

  const content = `
    <div class="space-y-8">
      ${PageHeader({
        title: "Meu Perfil",
        subtitle: "Gerencie seus dados cadastrais e preferências de conta.",
      })}

      <!-- Formulário de Perfil -->
      <div class="panel p-4 sm:p-7">
        <h2 class="font-display font-semibold text-base mb-6 border-b border-[var(--color-border)] pb-4">Informações Pessoais</h2>

        <div class="flex flex-col sm:flex-row items-start gap-7 mb-7">
          <!-- Preview do Avatar -->
          <div>
            <div id="avatar-preview"
                 class="w-20 h-20 rounded-full bg-cover bg-center bg-[var(--color-surface-2)] border-2 border-[var(--color-brand-500)]/50"
                 role="img" aria-label="Pré-visualização do avatar de ${user?.username || "usuário"}"
                 style="background-image: url('${user?.avatar_url || "https://picsum.photos/seed/defaultavatar/150/150"}'); box-shadow: 0 0 16px -3px rgba(147,51,234,0.6);"></div>
            <p class="text-xs text-[var(--color-muted-2)] mt-2 text-center">Avatar</p>
          </div>

          <!-- Campo URL do Avatar -->
          <div class="flex-1 w-full">
            <label for="input-avatar-url" class="block text-sm font-medium text-muted mb-1.5">URL do Avatar</label>
            <input id="input-avatar-url" name="avatar_url" type="url"
                   value="${user?.avatar_url || ""}"
                   placeholder="https://..."
                   class="w-full px-3 py-2.5 bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-lg text-sm text-[var(--color-ink)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-500)] focus:border-transparent"/>
            <p class="text-xs text-[var(--color-muted-2)] mt-1.5">Cole a URL de uma imagem para usar como foto de perfil.</p>
          </div>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-5">
          <div>
            <label for="input-username" class="block text-sm font-medium text-muted mb-1.5">Nome de Usuário</label>
            <input id="input-username" name="username" type="text"
                   value="${user?.username || ""}"
                   placeholder="seu_usuario"
                   class="w-full px-3 py-2.5 bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-lg text-sm text-[var(--color-ink)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-500)]"/>
          </div>
          <div>
            <label for="input-profile-email" class="block text-sm font-medium text-muted mb-1.5">E-mail</label>
            <input id="input-profile-email" name="email" type="email" value="${user?.email || ""}" disabled
                   class="w-full px-3 py-2.5 bg-[var(--color-surface-2)]/50 border border-[var(--color-border)] rounded-lg text-sm text-[var(--color-muted-2)] cursor-not-allowed"/>
            <p class="text-xs text-[var(--color-muted-2)] mt-1.5">O e-mail não pode ser alterado.</p>
          </div>
        </div>

        <div class="mb-6">
          <label for="input-bio" class="block text-sm font-medium text-muted mb-1.5">Bio</label>
          <textarea id="input-bio" name="bio" rows="3"
                    placeholder="Fale um pouco sobre você..."
                    class="w-full px-3 py-2.5 bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-lg text-sm text-[var(--color-ink)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-500)] resize-none">${user?.bio || ""}</textarea>
        </div>

        <div class="flex items-center gap-3">
          <button id="btn-save-profile"
                  class="button-primary px-5 py-2.5 text-sm">
            Salvar Alterações
          </button>
          <p id="profile-msg" class="text-[var(--color-accent-400)] text-sm hidden items-center gap-1.5">${Icon(icons.circleCheck, { className: "w-4 h-4" })} Perfil atualizado com sucesso!</p>
        </div>
      </div>

      <!-- Zona de Perigo -->
      <div class="panel border-red-500/30 p-4 sm:p-7">
        <h2 class="font-display font-semibold text-base mb-2 text-red-400">Zona de Perigo</h2>
        <p class="text-muted text-sm mb-5">Ações irreversíveis de conta.</p>
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
  document.getElementById("btn-save-profile")?.addEventListener("click", async () => {
    const username = document.getElementById("input-username")?.value || "";
    const bio = document.getElementById("input-bio")?.value || "";
    const avatarUrl = document.getElementById("input-avatar-url")?.value || "";
    await Actions.atualizarDadosPerfil(username, bio, avatarUrl);

    const msg = document.getElementById("profile-msg");
    if (msg) {
      msg.classList.remove("hidden");
      msg.classList.add("flex");
      setTimeout(() => {
        msg.classList.add("hidden");
        msg.classList.remove("flex");
      }, 3000);
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
