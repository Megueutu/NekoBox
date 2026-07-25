package com.example.marketplaceproject.Controller;

import com.example.marketplaceproject.Entity.Carrinho;
import com.example.marketplaceproject.Entity.CarrinhoItem;
import com.example.marketplaceproject.Service.CarrinhoItemService;
import com.example.marketplaceproject.Service.CarrinhoService;
import com.example.marketplaceproject.Service.GameMapper;
import com.example.marketplaceproject.Service.SessaoService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/carrinho")
@RequiredArgsConstructor
public class CarrinhoController {

    private final CarrinhoItemService carrinhoItemService;
    private final CarrinhoService carrinhoService;
    private final SessaoService sessaoService;
    private final GameMapper gameMapper;

    public record ItemRequest(Integer produtoId, Boolean paraPresente) {
    }

    public record QuantidadeRequest(Integer quantidade) {
    }

    public record ItemResponse(Integer produtoId, String titulo, BigDecimal preco) {
    }

    public record CarrinhoResponse(Integer id, List<java.util.Map<String, Object>> items, BigDecimal total) {
    }

    @GetMapping
    public ResponseEntity<CarrinhoResponse> buscarCarrinho(@RequestHeader("Authorization") String authorization) {
        return ResponseEntity.ok(montarResponse(sessaoService.autenticar(authorization).getId()));
    }

    @PostMapping("/itens")
    public ResponseEntity<CarrinhoResponse> adicionarItem(
            @RequestHeader("Authorization") String authorization, @RequestBody ItemRequest request) {
        Integer usuarioId = sessaoService.autenticar(authorization).getId();
        carrinhoItemService.adicionarProduto(
                usuarioId, request.produtoId(), Boolean.TRUE.equals(request.paraPresente()));
        return ResponseEntity.status(HttpStatus.CREATED).body(montarResponse(usuarioId));
    }

    @DeleteMapping("/itens/{produtoId}")
    public ResponseEntity<Void> removerItem(
            @RequestHeader("Authorization") String authorization,
            @PathVariable Integer produtoId,
            @RequestParam(name = "paraPresente", defaultValue = "false") boolean paraPresente) {
        Integer usuarioId = sessaoService.autenticar(authorization).getId();
        carrinhoItemService.removerProduto(usuarioId, produtoId, paraPresente);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/itens/{produtoId}")
    public ResponseEntity<CarrinhoResponse> atualizarQuantidade(
            @RequestHeader("Authorization") String authorization,
            @PathVariable Integer produtoId,
            @RequestBody QuantidadeRequest request) {
        Integer usuarioId = sessaoService.autenticar(authorization).getId();
        carrinhoItemService.atualizarQuantidadePresente(
                usuarioId, produtoId, request.quantidade());
        return ResponseEntity.ok(montarResponse(usuarioId));
    }

    @DeleteMapping
    public ResponseEntity<Void> esvaziar(@RequestHeader("Authorization") String authorization) {
        Integer usuarioId = sessaoService.autenticar(authorization).getId();
        carrinhoService.limparCarrinho(usuarioId);
        return ResponseEntity.noContent().build();
    }

    private CarrinhoResponse montarResponse(Integer usuarioId) {
        Carrinho carrinho = carrinhoService.obterOuCriarCarrinho(usuarioId);
        List<CarrinhoItem> itens = carrinhoItemService.listarItens(usuarioId);

        List<java.util.Map<String, Object>> itensResponse = itens.stream()
                .map(item -> {
                    java.util.Map<String, Object> game = gameMapper.toGame(item.getProduto());
                    game.put("quantity", item.getQuantidade());
                    game.put("for_gift", item.getParaPresente());
                    return game;
                })
                .toList();
        BigDecimal total = itens.stream()
                .map(item -> item.getProduto().getPreco()
                        .multiply(BigDecimal.valueOf(item.getQuantidade())))
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        return new CarrinhoResponse(carrinho.getId(), itensResponse, total);
    }
}
