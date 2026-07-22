package com.example.marketplaceproject.Controller;

import com.example.marketplaceproject.Entity.Produto;
import com.example.marketplaceproject.Exception.RecursoNaoEncontradoException;
import com.example.marketplaceproject.Repository.ProdutoRepository;
import com.example.marketplaceproject.Service.GameMapper;
import com.example.marketplaceproject.Service.CatalogMediaAuditService;
import com.example.marketplaceproject.Service.ProdutoService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.math.BigDecimal;
import java.util.LinkedHashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/games")
@RequiredArgsConstructor
public class GameController {

    private final ProdutoService produtoService;
    private final ProdutoRepository produtoRepository;
    private final GameMapper gameMapper;
    private final CatalogMediaAuditService catalogMediaAuditService;

    @GetMapping
    public ResponseEntity<Map<String, Object>> listar(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Integer categoryId,
            @RequestParam(required = false) BigDecimal minPrice,
            @RequestParam(required = false) BigDecimal maxPrice,
            @PageableDefault(size = 20) Pageable pageable) {
        Page<Produto> page = produtoService.listar(search, categoryId, minPrice, maxPrice, pageable);
        Map<String, Object> response = new LinkedHashMap<>();
        response.put("content", page.getContent().stream().map(gameMapper::toGame).toList());
        response.put("total_elements", page.getTotalElements());
        response.put("total_pages", page.getTotalPages());
        response.put("number", page.getNumber());
        response.put("size", page.getSize());
        response.put("first", page.isFirst());
        response.put("last", page.isLast());
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{slug}")
    public ResponseEntity<Map<String, Object>> buscarPorSlug(@PathVariable String slug) {
        Produto produto = produtoRepository.findBySlugAndStatus(slug, "published")
                .orElseThrow(() -> new RecursoNaoEncontradoException("Jogo nao encontrado."));
        return ResponseEntity.ok(gameMapper.toGame(produto));
    }

    @GetMapping("/media-audit")
    public ResponseEntity<CatalogMediaAuditService.Relatorio> auditarMidias() {
        return ResponseEntity.ok(catalogMediaAuditService.auditar());
    }
}
