package com.example.marketplaceproject.Controller;

import com.example.marketplaceproject.Entity.Produto;
import com.example.marketplaceproject.Entity.Usuario;
import com.example.marketplaceproject.Service.AdminService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import tools.jackson.databind.ObjectMapper;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {

    private final AdminService adminService;
    private final ObjectMapper objectMapper;

    public record GiftCardRequest(BigDecimal valor) {
    }

    public record UsuarioRequest(
            String nomeUsuario, String email, String senha, BigDecimal saldo) {
    }

    public record JogoRequest(
            String titulo, String descricaoCurta, String descricaoLonga, BigDecimal preco,
            LocalDate dataLancamento, String status, List<String> tags, List<Integer> categoriaIds) {
    }

    @GetMapping("/dashboard")
    public ResponseEntity<AdminService.Dashboard> dashboard(
            @RequestHeader("Authorization") String authorization) {
        return ResponseEntity.ok(adminService.dashboard(authorization));
    }

    @GetMapping("/gift-cards")
    public ResponseEntity<List<AdminService.GiftCardResumo>> listarGiftCards(
            @RequestHeader("Authorization") String authorization) {
        return ResponseEntity.ok(adminService.listarGiftCards(authorization));
    }

    @PostMapping("/gift-cards")
    public ResponseEntity<AdminService.GiftCardGerado> gerarGiftCard(
            @RequestHeader("Authorization") String authorization,
            @RequestBody GiftCardRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(adminService.gerarGiftCard(authorization, request.valor()));
    }

    @GetMapping("/usuarios")
    public ResponseEntity<List<AdminService.UsuarioResumo>> listarUsuarios(
            @RequestHeader("Authorization") String authorization) {
        return ResponseEntity.ok(adminService.listarUsuarios(authorization));
    }

    @PostMapping("/usuarios")
    public ResponseEntity<AdminService.UsuarioResumo> criarUsuario(
            @RequestHeader("Authorization") String authorization,
            @RequestBody UsuarioRequest request) {
        Usuario usuario = Usuario.builder()
                .nomeUsuario(request.nomeUsuario())
                .email(request.email())
                .senha(request.senha())
                .build();
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(adminService.criarUsuario(authorization, usuario));
    }

    @PutMapping("/usuarios/{id}")
    public ResponseEntity<AdminService.UsuarioResumo> atualizarUsuario(
            @RequestHeader("Authorization") String authorization,
            @PathVariable Integer id, @RequestBody UsuarioRequest request) {
        return ResponseEntity.ok(adminService.atualizarUsuario(
                authorization, id, request.nomeUsuario(), request.email(),
                request.senha(), request.saldo()));
    }

    @DeleteMapping("/usuarios/{id}")
    public ResponseEntity<Void> excluirUsuario(
            @RequestHeader("Authorization") String authorization, @PathVariable Integer id) {
        adminService.excluirUsuario(authorization, id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/jogos")
    public ResponseEntity<List<AdminService.JogoResumo>> listarJogos(
            @RequestHeader("Authorization") String authorization) {
        return ResponseEntity.ok(adminService.listarJogos(authorization));
    }

    @PostMapping("/jogos")
    public ResponseEntity<AdminService.JogoResumo> criarJogo(
            @RequestHeader("Authorization") String authorization,
            @RequestBody JogoRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(adminService.criarJogo(
                        authorization, toProduto(request), request.categoriaIds()));
    }

    @PutMapping("/jogos/{id}")
    public ResponseEntity<AdminService.JogoResumo> atualizarJogo(
            @RequestHeader("Authorization") String authorization,
            @PathVariable Integer id, @RequestBody JogoRequest request) {
        return ResponseEntity.ok(adminService.atualizarJogo(
                authorization, id, toProduto(request), request.categoriaIds()));
    }

    @DeleteMapping("/jogos/{id}")
    public ResponseEntity<Void> excluirJogo(
            @RequestHeader("Authorization") String authorization, @PathVariable Integer id) {
        adminService.excluirJogo(authorization, id);
        return ResponseEntity.noContent().build();
    }

    private Produto toProduto(JogoRequest request) {
        return Produto.builder()
                .titulo(request.titulo())
                .descricaoCurta(request.descricaoCurta())
                .descricaoLonga(request.descricaoLonga())
                .preco(request.preco())
                .dataLancamento(request.dataLancamento())
                .status(request.status())
                .tagsJson(toJson(request.tags()))
                .requisitosJson("[]")
                .idiomasJson("[]")
                .atualizacoesJson("[]")
                .build();
    }

    private String toJson(List<String> tags) {
        try {
            return objectMapper.writeValueAsString(tags == null ? List.of() : tags);
        } catch (Exception exception) {
            throw new IllegalArgumentException("As tags do jogo sao invalidas.");
        }
    }
}
