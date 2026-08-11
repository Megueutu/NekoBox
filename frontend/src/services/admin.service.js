import { ApiClient, toResourceId } from "./api.client";

export const AdminService = {
  getUsers: () => ApiClient.get("/api/admin/usuarios"),
  createUser: (user) => ApiClient.post("/api/admin/usuarios", user),
  updateUser: (id, user) => ApiClient.put(`/api/admin/usuarios/${toResourceId(id)}`, user),
  deleteUser: (id) => ApiClient.delete(`/api/admin/usuarios/${toResourceId(id)}`),
  getGames: () => ApiClient.get("/api/admin/jogos"),
  createGame: (game) => ApiClient.post("/api/admin/jogos", game),
  updateGame: (id, game) => ApiClient.put(`/api/admin/jogos/${toResourceId(id)}`, game),
  deleteGame: (id) => ApiClient.delete(`/api/admin/jogos/${toResourceId(id)}`),
  uploadGameMedia: (id, type, file) =>
    ApiClient.uploadMedia(`/api/admin/jogos/${toResourceId(id)}/midias`, type, file),
  deleteGameMedia: (gameId, mediaId) =>
    ApiClient.delete(`/api/admin/jogos/${toResourceId(gameId)}/midias/${toResourceId(mediaId)}`),
};
