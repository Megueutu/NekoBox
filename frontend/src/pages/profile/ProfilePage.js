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
        <h1 class="text-2xl font-black">Meu Perfil</h1>
        <p class="text-zinc-500 text-sm mt-1">Gerencie seus dados cadastrais e preferências de conta.</p>
      </div>

      <!-- Formulário de Perfil -->
      <div class="bg-white border border-zinc-200 rounded-lg p-6">
        <h2 class="font-bold text-base mb-5 border-b border-zinc-100 pb-3">Informações Pessoais</h2>

        <div class="flex flex-col sm:flex-row items-start gap-6 mb-6">
          <!-- Preview do Avatar -->
          <div>
            <div id="avatar-preview"
                 class="w-20 h-20 rounded-full bg-cover bg-center bg-zinc-200 border-2 border-zinc-300"
                 style="background-image: url('${user?.avatar_url || "https://picsum.photos/seed/defaultavatar/150/150"}')"></div>
            <p class="text-xs text-zinc-400 mt-2 text-center">Avatar</p>
          </div>

          <!-- Campo URL do Avatar -->
          <div class="flex-1 w-full">
            <label class="block text-sm font-medium text-zinc-700 mb-1">URL do Avatar</label>
            <input id="input-avatar-url" type="url"
                   value="${user?.avatar_url || ""}"
                   placeholder="https://..."
                   class="w-full px-3 py-2.5 border border-zinc-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900"/>
            <p class="text-xs text-zinc-400 mt-1">Cole a URL de uma imagem para usar como foto de perfil.</p>
          </div>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <div>
            <label class="block text-sm font-medium text-zinc-700 mb-1">Nome de Usuário</label>
            <input id="input-username" type="text"
                   value="${user?.username || ""}"
                   placeholder="seu_usuario"
                   class="w-full px-3 py-2.5 border border-zinc-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900"/>
          </div>
          <div>
            <label class="block text-sm font-medium text-zinc-700 mb-1">E-mail</label>
            <input type="email" value="${user?.email || ""}" disabled
                   class="w-full px-3 py-2.5 border border-zinc-200 rounded text-sm bg-zinc-50 text-zinc-400 cursor-not-allowed"/>
            <p class="text-xs text-zinc-400 mt-1">O e-mail não pode ser alterado.</p>
          </div>
        </div>

        <div class="mb-5">
          <label class="block text-sm font-medium text-zinc-700 mb-1">Bio</label>
          <textarea id="input-bio" rows="3"
                    placeholder="Fale um pouco sobre você..."
                    class="w-full px-3 py-2.5 border border-zinc-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900 resize-none">${user?.bio || ""}</textarea>
        </div>

        <div class="flex items-center gap-3">
          <button id="btn-save-profile"
                  class="px-5 py-2.5 bg-zinc-900 text-white font-bold text-sm rounded hover:bg-zinc-700 transition-colors">
            Salvar Alterações
          </button>
          <p id="profile-msg" class="text-green-600 text-sm hidden">✓ Perfil atualizado com sucesso!</p>
        </div>
      </div>

      <!-- Zona de Perigo -->
      <div class="bg-white border border-red-200 rounded-lg p-6">
        <h2 class="font-bold text-base mb-1 text-red-600">Zona de Perigo</h2>
        <p class="text-zinc-500 text-sm mb-4">Ações irreversíveis de conta.</p>
        <button id="btn-logout-profile"
                class="px-5 py-2.5 border-2 border-red-400 text-red-600 font-bold text-sm rounded hover:bg-red-600 hover:text-white transition-colors">
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
