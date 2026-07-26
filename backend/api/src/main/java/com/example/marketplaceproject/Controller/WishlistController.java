package com.example.marketplaceproject.Controller;

import com.example.marketplaceproject.Entity.Usuario;
import com.example.marketplaceproject.Service.GameMapper;
import com.example.marketplaceproject.Service.SessaoService;
import com.example.marketplaceproject.Service.WishlistService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/wishlist")
@RequiredArgsConstructor
public class WishlistController {

    private final SessaoService sessaoService;
    private final WishlistService wishlistService;
    private final GameMapper gameMapper;

    @GetMapping
    public ResponseEntity<List<Map<String, Object>>> listar(@RequestHeader("Authorization") String authorization) {
        Usuario usuario = sessaoService.autenticar(authorization);
        return ResponseEntity.ok(wishlistService.listar(usuario.getId()).stream()
                .map(item -> gameMapper.toGame(item.getProduto())).toList());
    }

    @PostMapping("/{produtoId}")
    public ResponseEntity<Map<String, Object>> adicionar(
            @RequestHeader("Authorization") String authorization, @PathVariable Integer produtoId) {
        Usuario usuario = sessaoService.autenticar(authorization);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(gameMapper.toGame(wishlistService.adicionar(usuario, produtoId).getProduto()));
    }

    @DeleteMapping("/{produtoId}")
    public ResponseEntity<Void> remover(
            @RequestHeader("Authorization") String authorization, @PathVariable Integer produtoId) {
        Usuario usuario = sessaoService.autenticar(authorization);
        wishlistService.remover(usuario.getId(), produtoId);
        return ResponseEntity.noContent().build();
    }
}
