import { ApiClient } from "../api/api.client";
import { normalizeGame, normalizeGames } from "../games/game.normalizer";
import { escapeHtml } from "../../utils/escape";

const productId = (id) => encodeURIComponent(String(id));
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

  async redeemGiftCard(codigo) {
    const result = await ApiClient.post("/api/carteira/gift-cards/resgates", { codigo });
    return {
      valor_creditado: Number(result.valor_creditado),
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

  async addToCart(id, forGift = false) {
    const response = await ApiClient.post("/api/carrinho/itens", {
      produto_id: Number(id),
      para_presente: Boolean(forGift),
    });
    return normalizeGames(response.items);
  },

  async removeFromCart(id, forGift = false) {
    await ApiClient.delete(
      `/api/carrinho/itens/${productId(id)}?paraPresente=${Boolean(forGift)}`
    );
    return this.getCart();
  },

  async updateCartQuantity(id, quantity) {
    const response = await ApiClient.patch(`/api/carrinho/itens/${productId(id)}`, {
      quantidade: Number(quantity),
    });
    return normalizeGames(response.items);
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

  async redeemGameCode(codigo) {
    return normalizeGame(await ApiClient.post("/api/biblioteca/resgates", { codigo }));
  },

  async getGameGiftCodes() {
    const codes = await ApiClient.get("/api/presentes");
    return codes.map((item) => ({
      id: String(item.id),
      productId: String(item.produto_id),
      gameTitle: item.titulo_produto || "Jogo digital",
      code: item.codigo || "",
      redeemed: Boolean(item.resgatado),
      createdAt: item.criado_em,
      redeemedAt: item.resgatado_em || null,
    }));
  },

  async checkout() {
    const result = await ApiClient.post("/api/pagamentos/checkout");
    const library = await this.getLibrary();
    return {
      payments: result.pagamentos || [],
      giftCodes: result.codigos_presente || [],
      library,
    };
  },
};
