import { ApiClient } from "./api.client";
import { normalizeGame, normalizeGames } from "./games/game.normalizer";
import { escapeHtml } from "../utils/escape";

const productId = (id) => encodeURIComponent(String(id));
const payloadProductId = (id) =>
  import.meta.env.MODE === "development" && Boolean(import.meta.env.VITE_USE_MOCK_API) ? String(id) : Number(id);
const normalizeUser = (user) => ({
  ...user,
  id: String(user.id),
  username: escapeHtml(user.username),
  email: escapeHtml(user.email),
  avatar_url: user.avatar_url || "",
  bio: escapeHtml(user.bio),
  role: user.role || "USER",
});

export const AccountService = {
  async getProfile() {
    return normalizeUser(await ApiClient.get("/api/usuarios/me"));
  },

  async getWallet() {
    const wallet = await ApiClient.get("/api/carteira");
    return { saldo: Number(wallet.saldo) };
  },

  async addBalance(valor) {
    const result = await ApiClient.post("/api/carteira/recargas", { valor: Number(valor) });
    return {
      valor_adicionado: Number(result.valor_adicionado),
      saldo: Number(result.saldo),
    };
  },

  async updateProfile(username, bio, avatarUrl) {
    return normalizeUser(await ApiClient.put("/api/usuarios/me", { username, bio, avatar_url: avatarUrl }));
  },

  async getCart() {
    const response = await ApiClient.get("/api/carrinho");
    return normalizeGames(response.items);
  },

  async addToCart(id) {
    const response = await ApiClient.post("/api/carrinho/itens", { produto_id: payloadProductId(id) });
    return normalizeGames(response.items);
  },

  async removeFromCart(id) {
    await ApiClient.delete(`/api/carrinho/itens/${productId(id)}`);
    return this.getCart();
  },

  async getWishlist() {
    return normalizeGames(await ApiClient.get("/api/wishlist"));
  },

  async addToWishlist(id) {
    return normalizeGame(await ApiClient.post(`/api/wishlist/${productId(id)}`));
  },

  async removeFromWishlist(id) {
    await ApiClient.delete(`/api/wishlist/${productId(id)}`);
  },

  async getLibrary() {
    return normalizeGames(await ApiClient.get("/api/biblioteca"));
  },

  async acquireFreeLicense(id) {
    return normalizeGame(await ApiClient.post(`/api/biblioteca/licencas-gratuitas/${productId(id)}`));
  },

  async checkout() {
    const result = await ApiClient.post("/api/pagamentos/checkout");
    const library = await this.getLibrary();
    return {
      payments: result.pagamentos || [],
      library,
    };
  },
};
