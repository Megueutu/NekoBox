package com.example.marketplaceproject.Service;

import com.example.marketplaceproject.Entity.Avaliacao;
import com.example.marketplaceproject.Entity.Foto;
import com.example.marketplaceproject.Entity.Produto;
import tools.jackson.core.type.TypeReference;
import tools.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Component
@RequiredArgsConstructor
public class GameMapper {

    private final ProdutoService produtoService;
    private final FotoService fotoService;
    private final AvaliacaoService avaliacaoService;
    private final ObjectMapper objectMapper;

    public Map<String, Object> toGame(Produto produto) {
        Map<String, Object> game = new LinkedHashMap<>();
        game.put("id", produto.getId().toString());
        game.put("owner_id", produto.getUsuario().getId().toString());
        game.put("title", produto.getTitulo());
        game.put("slug", produto.getSlug());
        game.put("short_description", produto.getDescricaoCurta());
        game.put("long_description", produto.getDescricaoLonga());
        game.put("price", produto.getPreco());
        game.put("release_date", produto.getDataLancamento());
        game.put("status", produto.getStatus());
        game.put("media", fotoService.listarFotosDoProduto(produto.getId()).stream().map(this::toMedia).toList());
        game.put("categories", produtoService.listarCategoriasDoProduto(produto.getId()).stream()
                .map(categoria -> categoria.getNome()).toList());
        game.put("tags", parseList(produto.getTagsJson()));
        game.put("publisher", Map.of(
                "id", produto.getUsuario().getId().toString(),
                "name", produto.getUsuario().getNomeUsuario(),
                "logo_url", produto.getUsuario().getUrlAvatar() == null ? "" : produto.getUsuario().getUrlAvatar()));
        game.put("system_requirements", parseList(produto.getRequisitosJson()));
        game.put("languages", parseList(produto.getIdiomasJson()));
        game.put("updates", parseList(produto.getAtualizacoesJson()));
        game.put("reviews", avaliacaoService.listarPorProduto(produto.getId()).stream().map(this::toReview).toList());
        return game;
    }

    private Map<String, Object> toMedia(Foto foto) {
        Map<String, Object> media = new LinkedHashMap<>();
        media.put("id", foto.getId().toString());
        media.put("type", foto.getTipo().getValor());
        media.put("url", foto.getUrl());
        media.put("public_id", foto.getPublicId());
        media.put("position", foto.getPosicao());
        return media;
    }

    private Map<String, Object> toReview(Avaliacao avaliacao) {
        Map<String, Object> review = new LinkedHashMap<>();
        review.put("id", avaliacao.getId().toString());
        review.put("username", avaliacao.getUsuario().getNomeUsuario());
        review.put("recommended", avaliacao.getRecomenda());
        review.put("review_text", avaliacao.getTextoAvaliacao());
        review.put("created_at", avaliacao.getCriadoEm());
        review.put("votes", avaliacao.getVotosUteis());
        review.put("rating", avaliacao.getNota());
        return review;
    }

    private List<Object> parseList(String json) {
        try {
            return objectMapper.readValue(json == null ? "[]" : json, new TypeReference<>() { });
        } catch (Exception exception) {
            return List.of();
        }
    }
}
