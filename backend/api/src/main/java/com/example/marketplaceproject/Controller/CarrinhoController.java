package com.example.marketplaceproject.Controller;

import com.example.marketplaceproject.Entity.Carrinho;
import com.example.marketplaceproject.Entity.CarrinhoItem;
import com.example.marketplaceproject.Service.CarrinhoItemService;
import com.example.marketplaceproject.Service.CarrinhoService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
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

    public record ItemRequest(Integer produtoId) {
    }

    public record ItemResponse(Integer produtoId, String titulo, BigDecimal preco) {
    }

    public record CarrinhoResponse(Integer id, List<ItemResponse> itens, BigDecimal total) {
    }

    @GetMapping
    public ResponseEntity<CarrinhoResponse> buscarCarrinho(@RequestParam Integer usuarioId) {
        return ResponseEntity.ok(montarResponse(usuarioId));
    }

    @PostMapping("/itens")
    public ResponseEntity<CarrinhoResponse> adicionarItem(
            @RequestParam Integer usuarioId, @RequestBody ItemRequest request) {
        carrinhoItemService.adicionarProduto(usuarioId, request.produtoId());
        return ResponseEntity.status(HttpStatus.CREATED).body(montarResponse(usuarioId));
    }

    @DeleteMapping("/itens/{produtoId}")
    public ResponseEntity<Void> removerItem(
            @RequestParam Integer usuarioId, @PathVariable Integer produtoId) {
        carrinhoItemService.removerProduto(usuarioId, produtoId);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping
    public ResponseEntity<Void> esvaziar(@RequestParam Integer usuarioId) {
        carrinhoService.limparCarrinho(usuarioId);
        return ResponseEntity.noContent().build();
    }

    private CarrinhoResponse montarResponse(Integer usuarioId) {
        Carrinho carrinho = carrinhoService.obterOuCriarCarrinho(usuarioId);
        List<CarrinhoItem> itens = carrinhoItemService.listarItens(usuarioId);

        List<ItemResponse> itensResponse = itens.stream()
                .map(item -> new ItemResponse(
                        item.getProduto().getId(), item.getProduto().getTitulo(), item.getProduto().getPreco()))
                .toList();
        BigDecimal total = itensResponse.stream()
                .map(ItemResponse::preco)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        return new CarrinhoResponse(carrinho.getId(), itensResponse, total);
    }
}
