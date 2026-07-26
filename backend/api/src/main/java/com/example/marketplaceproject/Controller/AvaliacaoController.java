package com.example.marketplaceproject.Controller;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RestController;

import com.example.marketplaceproject.Entity.Avaliacao;
import com.example.marketplaceproject.Service.AvaliacaoService;
import com.example.marketplaceproject.Service.SessaoService;

import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
public class AvaliacaoController {

    private final AvaliacaoService avaliacaoService;
    private final SessaoService sessaoService;

    public record AvaliacaoRequest(double nota, Boolean recomenda, String textoAvaliacao) {
    }

    public record AvaliacaoResponse(
            Integer id, Integer usuarioId, String nomeUsuario, double nota, Boolean recomenda,
            String textoAvaliacao, LocalDateTime criadoEm) {
    }

    @GetMapping("/api/produtos/{produtoId}/avaliacoes")
    public ResponseEntity<List<AvaliacaoResponse>> listarPorProduto(@PathVariable Integer produtoId) {
        List<AvaliacaoResponse> avaliacoes = avaliacaoService.listarPorProduto(produtoId).stream()
                .map(this::paraResponse)
                .toList();
        return ResponseEntity.ok(avaliacoes);
    }

    @PostMapping("/api/produtos/{produtoId}/avaliacoes")
    public ResponseEntity<AvaliacaoResponse> criar(
            @RequestHeader("Authorization") String authorization,
            @PathVariable Integer produtoId,
            @RequestBody AvaliacaoRequest request) {
        Integer usuarioId = sessaoService.autenticar(authorization).getId();
        Avaliacao avaliacao = avaliacaoService.criarAvaliacao(
                usuarioId, produtoId, request.nota(), request.recomenda(), request.textoAvaliacao());
        return ResponseEntity.status(HttpStatus.CREATED).body(paraResponse(avaliacao));
    }

    @PutMapping("/api/avaliacoes/{id}")
    public ResponseEntity<AvaliacaoResponse> atualizar(
            @RequestHeader("Authorization") String authorization,
            @PathVariable Integer id,
            @RequestBody AvaliacaoRequest request) {
        verificarDono(sessaoService.autenticar(authorization).getId(), avaliacaoService.buscarPorId(id));
        Avaliacao avaliacao = avaliacaoService.atualizarAvaliacao(
                id, request.nota(), request.recomenda(), request.textoAvaliacao());
        return ResponseEntity.ok(paraResponse(avaliacao));
    }

    @DeleteMapping("/api/avaliacoes/{id}")
    public ResponseEntity<Void> excluir(
            @RequestHeader("Authorization") String authorization, @PathVariable Integer id) {
        verificarDono(sessaoService.autenticar(authorization).getId(), avaliacaoService.buscarPorId(id));
        avaliacaoService.excluirAvaliacao(id);
        return ResponseEntity.noContent().build();
    }

    private void verificarDono(Integer usuarioId, Avaliacao avaliacao) {
        if (!avaliacao.getUsuario().getId().equals(usuarioId)) {
            throw new AccessDeniedException("Apenas o autor da avaliacao pode executar esta acao.");
        }
    }

    private AvaliacaoResponse paraResponse(Avaliacao avaliacao) {
        return new AvaliacaoResponse(
                avaliacao.getId(), avaliacao.getUsuario().getId(), avaliacao.getUsuario().getNomeUsuario(),
                avaliacao.getNota(), avaliacao.getRecomenda(), avaliacao.getTextoAvaliacao(),
                avaliacao.getCriadoEm());
    }
}
