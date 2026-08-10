import { ApiClient } from "./api.client";
import { AccountService } from "./account.service";
import { Actions } from "../store/actions";

export const USERNAME_PATTERN = /^[a-zA-Z0-9_]{3,50}$/;
export const PASSWORD_PATTERN = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

async function persistSession(session) {
  localStorage.setItem("access_token", session.access_token);

  if (session.user?.role === "ADMIN") {
    Actions.hydrateAccount({
      user: session.user,
      cart: [],
      wishlist: [],
      library: [],
    });
    return session.user;
  }

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
  async loginComEmail(email, password) {
    if (!email || !password) throw new Error("E-mail e senha são obrigatórios.");
    const session = await ApiClient.post("/api/auth/login", { email, senha: password });
    return persistSession(session);
  },

  async registrar(username, email, password) {
    if (!username || !email || !password) throw new Error("Todos os campos são obrigatórios.");
    const normalizedUsername = username.trim();
    const normalizedEmail = email.trim();

    if (!USERNAME_PATTERN.test(normalizedUsername)) {
      throw new Error("O nome de usuário deve ter de 3 a 50 letras, números ou _, sem espaços.");
    }
    if (!PASSWORD_PATTERN.test(password)) {
      throw new Error("A senha deve ter 8 ou mais caracteres, com maiúscula, minúscula, número e um símbolo: @ $ ! % * ? &.");
    }

    await ApiClient.post("/api/usuarios", {
      nome_usuario: normalizedUsername,
      email: normalizedEmail,
      senha: password,
    });
    return this.loginComEmail(normalizedEmail, password);
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
    localStorage.removeItem("access_token");
    localStorage.removeItem("redirect_target");
    Actions.logout();
  },
};
