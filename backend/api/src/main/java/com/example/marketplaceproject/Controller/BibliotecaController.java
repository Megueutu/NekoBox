package com.example.marketplaceproject.Controller;

import com.example.marketplaceproject.Entity.BibliotecaUsuario;
import com.example.marketplaceproject.Service.BibliotecaUsuarioService;
import com.example.marketplaceproject.Service.GameMapper;
import com.example.marketplaceproject.Service.SessaoService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/biblioteca")
@RequiredArgsConstructor
public class BibliotecaController {

    private final BibliotecaUsuarioService bibliotecaUsuarioService;
    private final SessaoService sessaoService;
    private final GameMapper gameMapper;

    public record ItemResponse(
            Integer produtoId, String titulo, Integer tempoJogoMinutos, LocalDateTime adicionadoEm) {
    }

    public record IncrementarTempoRequest(Integer minutos) {
    }

    @GetMapping
    public ResponseEntity<List<java.util.Map<String, Object>>> listar(
            @RequestHeader("Authorization") String authorization) {
        Integer usuarioId = sessaoService.autenticar(authorization).getId();
        List<java.util.Map<String, Object>> itens = bibliotecaUsuarioService.listarBiblioteca(usuarioId).stream()
                .map(item -> gameMapper.toGame(item.getProduto()))
                .toList();
        return ResponseEntity.ok(itens);
    }

    @PatchMapping("/{produtoId}/tempo-jogo")
    public ResponseEntity<ItemResponse> incrementarTempoJogo(
            @RequestHeader("Authorization") String authorization,
            @PathVariable Integer produtoId,
            @RequestBody IncrementarTempoRequest request) {
        Integer usuarioId = sessaoService.autenticar(authorization).getId();
        BibliotecaUsuario item = bibliotecaUsuarioService.incrementarTempoJogo(
                usuarioId, produtoId, request.minutos());
        return ResponseEntity.ok(paraResponse(item));
    }

    private ItemResponse paraResponse(BibliotecaUsuario item) {
        return new ItemResponse(
                item.getProduto().getId(), item.getProduto().getTitulo(),
                item.getTempoJogoMinutos(), item.getAdicionadoEm());
    }
}
