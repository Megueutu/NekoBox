import { auth, googleProvider } from "../../core/firebase/firebase";
import { signInWithPopup, signOut as fbSignOut } from "firebase/auth";
import { ApiClient } from "../api/api.client";
import { AccountService } from "../account/account.service";
import { Actions } from "../../store/actions";

async function persistSession(session) {
  localStorage.setItem("access_token", session.access_token);

  const [user, cart, wishlist, library] = await Promise.all([
    AccountService.getProfile(),
    AccountService.getCart(),
    AccountService.getWishlist(),
    AccountService.getLibrary(),
  ]);
  Actions.hydrateAccount({ user, cart, wishlist, library });
  return user;
}

export const AuthService = {
  async loginComGoogle() {
    if (!auth || !googleProvider) {
      throw new Error("Login com Google não está configurado neste ambiente.");
    }
    const result = await signInWithPopup(auth, googleProvider);
    const idToken = await result.user.getIdToken();
    const session = await ApiClient.post("/api/auth/firebase", { id_token: idToken });
    return persistSession(session);
  },

  async loginComEmail(email, password) {
    if (!email || !password) throw new Error("E-mail e senha são obrigatórios.");
    const session = await ApiClient.post("/api/auth/login", { email, senha: password });
    return persistSession(session);
  },

  async registrar(username, email, password) {
    if (!username || !email || !password) throw new Error("Todos os campos são obrigatórios.");
    await ApiClient.post("/api/usuarios", { nome_usuario: username, email, senha: password });
    return this.loginComEmail(email, password);
  },

  async enviarRedefinicaoSenha() {
    throw new Error("A recuperação de senha ainda não está disponível.");
  },

  async logout() {
    try {
      await ApiClient.post("/api/auth/logout");
    } catch {
      // A sessão local também precisa ser encerrada quando o token já expirou.
    }
    if (auth) {
      try {
        await fbSignOut(auth);
      } catch {
        // O logout da aplicação não depende da sessão opcional do Firebase.
      }
    }
    localStorage.removeItem("access_token");
    localStorage.removeItem("redirect_target");
    Actions.logout();
  },
};
