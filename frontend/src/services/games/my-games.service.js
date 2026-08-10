import { ApiClient } from "../api.client";

const resourceId = (id) => encodeURIComponent(String(id));

export const MyGamesService = {
  getMine: () => ApiClient.get("/api/produtos/meus"),
  createGame: (produto) => ApiClient.post("/api/produtos", produto),
  updateGame: (id, produto) => ApiClient.put(`/api/produtos/${resourceId(id)}`, produto),
  deleteGame: (id) => ApiClient.delete(`/api/produtos/${resourceId(id)}`),
  uploadGameMedia(id, type, file) {
    const body = new FormData();
    body.append("tipo", type);
    body.append("arquivo", file);
    return ApiClient.postForm(`/api/produtos/${resourceId(id)}/fotos`, body);
  },
  deleteGameMedia: (produtoId, fotoId) =>
    ApiClient.delete(`/api/produtos/${resourceId(produtoId)}/fotos/${resourceId(fotoId)}`),
};
