import { ApiClient, toResourceId } from "../api.client";

export const MyGamesService = {
  getMine: () => ApiClient.get("/api/produtos/meus"),
  createGame: (produto) => ApiClient.post("/api/produtos", produto),
  updateGame: (id, produto) => ApiClient.put(`/api/produtos/${toResourceId(id)}`, produto),
  deleteGame: (id) => ApiClient.delete(`/api/produtos/${toResourceId(id)}`),
  uploadGameMedia: (id, type, file) =>
    ApiClient.uploadMedia(`/api/produtos/${toResourceId(id)}/fotos`, type, file),
  deleteGameMedia: (produtoId, fotoId) =>
    ApiClient.delete(`/api/produtos/${toResourceId(produtoId)}/fotos/${toResourceId(fotoId)}`),
};
