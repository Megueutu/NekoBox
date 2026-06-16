import { auth, googleProvider } from "../../core/firebase/firebase";
import { signInWithPopup, signOut as fbSignOut } from "firebase/auth";
import { Actions } from "../../store/actions";

export const AuthService = {
  async loginComGoogle() {
    // Modo Firebase: usa autenticação real se as chaves estiverem configuradas
    if (auth && googleProvider) {
      try {
        const result = await signInWithPopup(auth, googleProvider);
        const fbUser = result.user;
        const mappedUser = {
          id: fbUser.uid,
          username: fbUser.email.split("@")[0],
          email: fbUser.email,
          avatar_url:
            fbUser.photoURL || "https://picsum.photos/seed/avatar/150/150",
          bio: "Autenticado via Google Auth Provider.",
          is_developer: false,
        };
        localStorage.setItem("access_token", fbUser.accessToken);
        Actions.setUser(mappedUser);
        return mappedUser;
      } catch (err) {
        console.error("Falha no login via Firebase:", err);
        throw err;
      }
    }

    // Modo Fallback Mock: login automático sem Firebase configurado
    return new Promise((resolve) => {
      const mockUser = {
        id: "usr_mock_sandbox_99",
        username: "jogador_sandbox",
        email: "sandbox@gamestore.com",
        avatar_url: "https://picsum.photos/seed/avatar99/150/150",
        bio: "Perfil de teste — ambiente de desenvolvimento local.",
        is_developer: false,
      };
      localStorage.setItem(
        "access_token",
        "eyJhbGciOiJIUzI1NiIs.mockTokenActive.dev"
      );
      Actions.setUser(mockUser);
      setTimeout(() => resolve(mockUser), 150);
    });
  },

  async loginComEmail(email, password) {
    // Mock de login por email — sem validação real
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (!email || !password) {
          reject(new Error("E-mail e senha são obrigatórios."));
          return;
        }
        const mockUser = {
          id: `usr_email_${Date.now()}`,
          username: email.split("@")[0],
          email,
          avatar_url: "https://picsum.photos/seed/emailuser/150/150",
          bio: "Usuário autenticado via e-mail.",
          is_developer: false,
        };
        localStorage.setItem("access_token", `mock_email_token_${Date.now()}`);
        Actions.setUser(mockUser);
        resolve(mockUser);
      }, 200);
    });
  },

  async registrar(username, email, password) {
    // Mock de registro — simula criação de conta
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (!username || !email || !password) {
          reject(new Error("Todos os campos são obrigatórios."));
          return;
        }
        if (password.length < 6) {
          reject(new Error("Senha deve ter ao menos 6 caracteres."));
          return;
        }
        const newUser = {
          id: `usr_new_${Date.now()}`,
          username,
          email,
          avatar_url: "https://picsum.photos/seed/newuser/150/150",
          bio: "Novo usuário cadastrado.",
          is_developer: false,
        };
        localStorage.setItem("access_token", `mock_register_token_${Date.now()}`);
        Actions.setUser(newUser);
        resolve(newUser);
      }, 250);
    });
  },

  async enviarRedefinicaoSenha(email) {
    // Mock de redefinição de senha
    return new Promise((resolve) => {
      setTimeout(() => {
        console.log(`[Mock] E-mail de redefinição enviado para: ${email}`);
        resolve({ success: true });
      }, 200);
    });
  },

  async logout() {
    if (auth) {
      try {
        await fbSignOut(auth);
      } catch (err) {
        console.warn("Erro ao deslogar do Firebase:", err);
      }
    }
    localStorage.removeItem("access_token");
    localStorage.removeItem("redirect_target");
    Actions.logout();
  },
};
