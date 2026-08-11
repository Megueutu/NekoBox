import { PrivateLayout } from "../../app/layouts/PrivateLayout";
import { Store } from "../../store/store";
import { Actions } from "../../store/actions";
import { navigate } from "../../app/router/navigate";
import { AuthService } from "../../services/auth.service";
import { PageHeader } from "../../components/ui/PageHeader";
import { Icon, icons } from "../../components/ui/Icon";
import { AccountService } from "../../services/account.service";

export default async function ProfilePage() {
  const user = await AccountService.getProfile();
  Store.setState((state) => ({ ...state, user }));

  const content = `
    <div class="profile-page">
      ${PageHeader({
        title: "Meu Perfil",
        subtitle: "Cuide da sua identidade no NekoBox e mantenha suas informações atualizadas.",
      })}

      <form id="profile-form" class="profile-card panel">
        <div class="profile-card__heading">
          <h2 class="type-content-title">Informações pessoais</h2>
          <p>Altere sua biografia, foto de perfil e nome de usuário.</p>
        </div>

        <div class="profile-card__body">
          <div class="profile-avatar-editor">
            <div class="profile-avatar-editor__preview">
              <div id="avatar-preview"
                   class="profile-avatar"
                   role="img" aria-label="Pré-visualização do avatar de ${user?.username || "usuário"}"
                   style="background-image: url('${user?.avatar_url || "https://picsum.photos/seed/defaultavatar/150/150"}');"></div>
              <button id="btn-edit-avatar" type="button" class="profile-avatar__edit"
                      aria-label="Alterar URL do avatar" aria-expanded="false" aria-controls="avatar-url-editor">
                ${Icon(icons.pencil, { className: "w-4 h-4" })}
              </button>
            </div>

            <div class="profile-field">
              <label for="input-username">Nome de usuário</label>
              <input id="input-username" class="ui-control" name="username" type="text"
                     value="${user?.username || ""}"
                     placeholder="seu_usuario"/>
            </div>
          </div>

          <div id="avatar-url-editor" class="profile-avatar-url-editor" hidden>
            <div class="profile-field">
              <label for="input-avatar-url">URL do avatar</label>
              <input id="input-avatar-url" class="ui-control" name="avatar_url" type="url"
                     value="${user?.avatar_url || ""}"
                     placeholder="https://..."
                     aria-describedby="avatar-url-hint"/>
              <small id="avatar-url-hint">Cole a URL de uma imagem para visualizar antes de salvar.</small>
            </div>
          </div>

          <div class="profile-form__fields">
            <div class="profile-field">
              <label for="input-profile-email">E-mail</label>
              <input id="input-profile-email" class="ui-control" name="email" type="email" value="${user?.email || ""}" disabled
                     aria-describedby="profile-email-hint"/>
              <small id="profile-email-hint">O e-mail da conta não pode ser alterado.</small>
            </div>

            <div class="profile-field">
              <label for="input-bio">Biografia</label>
              <textarea id="input-bio" class="ui-control ui-control--area" name="bio" rows="4"
                        placeholder="Conte um pouco sobre seus jogos, gêneros e experiências favoritas.">${user?.bio || ""}</textarea>
            </div>
          </div>
        </div>

        <div class="profile-card__actions">
          <button id="btn-save-profile" type="submit" class="button-primary">
            Salvar alterações
          </button>
          <p id="profile-msg" class="profile-status" role="status" aria-live="polite" hidden>
            ${Icon(icons.circleCheck, { className: "w-4 h-4" })}
            Perfil atualizado com sucesso!
          </p>
        </div>
      </form>
    </div>
  `;

  return PrivateLayout(content);
}

export async function afterRender() {
  const avatarEditButton = document.getElementById("btn-edit-avatar");
  const avatarUrlEditor = document.getElementById("avatar-url-editor");
  const avatarInput = document.getElementById("input-avatar-url");
  const avatarPreview = document.getElementById("avatar-preview");

  avatarEditButton?.addEventListener("click", () => {
    const isExpanded = avatarEditButton.getAttribute("aria-expanded") === "true";
    avatarEditButton.setAttribute("aria-expanded", String(!isExpanded));
    avatarUrlEditor.hidden = isExpanded;
    if (!isExpanded) avatarInput?.focus();
  });

  avatarInput?.addEventListener("input", (event) => {
    if (avatarPreview && event.target.value) {
      avatarPreview.style.backgroundImage = `url('${event.target.value}')`;
    }
  });

  document.getElementById("profile-form")?.addEventListener("submit", async (event) => {
    event.preventDefault();
    const username = document.getElementById("input-username")?.value || "";
    const bio = document.getElementById("input-bio")?.value || "";
    const avatarUrl = document.getElementById("input-avatar-url")?.value || "";
    await Actions.atualizarDadosPerfil(username, bio, avatarUrl);

    const message = document.getElementById("profile-msg");
    if (message) {
      message.hidden = false;
      setTimeout(() => {
        message.hidden = true;
      }, 3000);
    }
  });

  document.getElementById("btn-delete-account")?.addEventListener("click", async () => {
    if (!window.confirm("Tem certeza que deseja excluir sua conta? Esta ação não pode ser desfeita.")) return;
    try {
      await AccountService.deleteAccount();
    } catch (error) {
      window.alert(error.message);
      return;
    }
    await AuthService.logout();
    navigate("/hub");
  });

  document.getElementById("btn-sidebar-logout")?.addEventListener("click", async () => {
    await AuthService.logout();
    navigate("/hub");
  });
}
