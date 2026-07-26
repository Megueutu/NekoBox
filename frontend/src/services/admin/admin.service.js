import { ApiClient } from "../api/api.client";

const resourceId = (id) => encodeURIComponent(String(id));

export const AdminService = {
  getDashboard: () => ApiClient.get("/api/admin/dashboard"),
  getGiftCards: () => ApiClient.get("/api/admin/gift-cards"),
  generateGiftCard: (valor) => ApiClient.post("/api/admin/gift-cards", { valor }),
  getUsers: () => ApiClient.get("/api/admin/usuarios"),
  createUser: (user) => ApiClient.post("/api/admin/usuarios", user),
  updateUser: (id, user) => ApiClient.put(`/api/admin/usuarios/${resourceId(id)}`, user),
  deleteUser: (id) => ApiClient.delete(`/api/admin/usuarios/${resourceId(id)}`),
  getGames: () => ApiClient.get("/api/admin/jogos"),
  createGame: (game) => ApiClient.post("/api/admin/jogos", game),
  updateGame: (id, game) => ApiClient.put(`/api/admin/jogos/${resourceId(id)}`, game),
  deleteGame: (id) => ApiClient.delete(`/api/admin/jogos/${resourceId(id)}`),
};
