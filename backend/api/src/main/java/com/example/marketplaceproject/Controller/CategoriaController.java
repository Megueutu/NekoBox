package com.example.marketplaceproject.Controller;

import com.example.marketplaceproject.Entity.Categoria;
import com.example.marketplaceproject.Service.CategoriaService;
import com.example.marketplaceproject.Service.SessaoService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.RequestHeader;

import java.util.List;

@RestController
@RequestMapping("/api/categorias")
@RequiredArgsConstructor
public class CategoriaController {

    private final CategoriaService categoriaService;
    private final SessaoService sessaoService;

    public record CategoriaRequest(String nome) {
    }

    public record CategoriaResponse(Integer id, String nome) {
    }

    @GetMapping
    public ResponseEntity<List<CategoriaResponse>> listar() {
        List<CategoriaResponse> categorias = categoriaService.listarCategorias().stream()
                .map(categoria -> new CategoriaResponse(categoria.getId(), categoria.getNome()))
                .toList();
        return ResponseEntity.ok(categorias);
    }

    @PostMapping
    public ResponseEntity<CategoriaResponse> criar(
            @RequestHeader("Authorization") String authorization, @RequestBody CategoriaRequest request) {
        sessaoService.autenticar(authorization);
        Categoria categoria = categoriaService.criarCategoria(request.nome());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(new CategoriaResponse(categoria.getId(), categoria.getNome()));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> excluir(
            @RequestHeader("Authorization") String authorization, @PathVariable Integer id) {
        sessaoService.autenticar(authorization);
        categoriaService.excluirCategoria(id);
        return ResponseEntity.noContent().build();
    }
}
