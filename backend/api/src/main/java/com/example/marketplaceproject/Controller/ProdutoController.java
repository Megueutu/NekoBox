package com.example.marketplaceproject.Controller;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.time.LocalDate;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.marketplaceproject.Entity.Produto;
import com.example.marketplaceproject.Service.AvaliacaoService;
import com.example.marketplaceproject.Service.FotoService;
import com.example.marketplaceproject.Service.ProdutoService;
import com.example.marketplaceproject.Service.SessaoService;
import tools.jackson.databind.ObjectMapper;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/produtos")
@RequiredArgsConstructor
public class ProdutoController {

    private final ProdutoService produtoService;
    private final FotoService fotoService;
    private final AvaliacaoService avaliacaoService;
    private final SessaoService sessaoService;
    private final ObjectMapper objectMapper;

    public record ProdutoRequest(
            String titulo, String descricaoCurta, String descricaoLonga,
            BigDecimal preco, LocalDate releaseDate, String status,
            List<String> tags, List<Map<String, Object>> systemRequirements,
            List<Map<String, Object>> languages, List<Map<String, Object>> updates,
            List<Integer> categoriaIds) {
    }

    public record VendedorResumo(Integer id, String nomeUsuario) {
    }

    public record CategoriaResumo(Integer id, String nome) {
    }

    public record ProdutoResumoResponse(
            Integer id, String titulo, String descricaoCurta, BigDecimal preco, VendedorResumo vendedor) {
    }

    public record ProdutoDetalheResponse(
            Integer id, String titulo, String descricaoCurta, String descricaoLonga, BigDecimal preco,
            VendedorResumo vendedor, Map<String, Object> fotos, List<CategoriaResumo> categorias,
            double notaMedia) {
    }

    @GetMapping
    public ResponseEntity<Page<ProdutoResumoResponse>> listar(
            @RequestParam(required = false) String titulo,
            @RequestParam(required = false) Integer categoriaId,
            @RequestParam(required = false) BigDecimal precoMinimo,
            @RequestParam(required = false) BigDecimal precoMaximo,
            @PageableDefault(size = 20) Pageable pageable) {
        Page<Produto> pagina = produtoService.listar(titulo, categoriaId, precoMinimo, precoMaximo, pageable);
        return ResponseEntity.ok(pagina.map(this::paraResumo));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProdutoDetalheResponse> buscarPorId(@PathVariable Integer id) {
        return ResponseEntity.ok(paraDetalhe(produtoService.buscarPorId(id)));
    }

    @PostMapping
    public ResponseEntity<ProdutoDetalheResponse> criar(
            @RequestHeader("Authorization") String authorization, @RequestBody ProdutoRequest request) {
        Integer usuarioId = sessaoService.autenticar(authorization).getId();
        Produto produto = produtoService.criarProduto(usuarioId, paraEntidade(request), request.categoriaIds());
        return ResponseEntity.status(HttpStatus.CREATED).body(paraDetalhe(produto));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ProdutoDetalheResponse> atualizar(
            @RequestHeader("Authorization") String authorization,
            @PathVariable Integer id, @RequestBody ProdutoRequest request) {
        Integer usuarioId = sessaoService.autenticar(authorization).getId();
        verificarDono(usuarioId, produtoService.buscarPorId(id));
        Produto produto = produtoService.atualizarProduto(id, paraEntidade(request), request.categoriaIds());
        return ResponseEntity.ok(paraDetalhe(produto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> excluir(
            @RequestHeader("Authorization") String authorization, @PathVariable Integer id) {
        Integer usuarioId = sessaoService.autenticar(authorization).getId();
        verificarDono(usuarioId, produtoService.buscarPorId(id));
        produtoService.excluirProduto(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/categorias/{categoriaId}")
    public ResponseEntity<Void> vincularCategoria(
            @RequestHeader("Authorization") String authorization,
            @PathVariable Integer id, @PathVariable Integer categoriaId) {
        Integer usuarioId = sessaoService.autenticar(authorization).getId();
        verificarDono(usuarioId, produtoService.buscarPorId(id));
        produtoService.vincularCategoria(id, categoriaId);
        return ResponseEntity.status(HttpStatus.CREATED).build();
    }

    @DeleteMapping("/{id}/categorias/{categoriaId}")
    public ResponseEntity<Void> desvincularCategoria(
            @RequestHeader("Authorization") String authorization,
            @PathVariable Integer id, @PathVariable Integer categoriaId) {
        Integer usuarioId = sessaoService.autenticar(authorization).getId();
        verificarDono(usuarioId, produtoService.buscarPorId(id));
        produtoService.desvincularCategoria(id, categoriaId);
        return ResponseEntity.noContent().build();
    }

    private void verificarDono(Integer usuarioId, Produto produto) {
        if (!produto.getUsuario().getId().equals(usuarioId)) {
            throw new AccessDeniedException("Apenas o dono do produto pode executar esta acao.");
        }
    }

    private Produto paraEntidade(ProdutoRequest request) {
        return Produto.builder()
                .titulo(request.titulo())
                .descricaoCurta(request.descricaoCurta())
                .descricaoLonga(request.descricaoLonga())
                .preco(request.preco())
                .dataLancamento(request.releaseDate())
                .status(request.status())
                .tagsJson(toJson(request.tags()))
                .requisitosJson(toJson(request.systemRequirements()))
                .idiomasJson(toJson(request.languages()))
                .atualizacoesJson(toJson(request.updates()))
                .build();
    }

    private String toJson(Object value) {
        try {
            return objectMapper.writeValueAsString(value == null ? List.of() : value);
        } catch (Exception exception) {
            throw new IllegalArgumentException("Os dados estruturados do jogo sao invalidos.");
        }
    }

    private ProdutoResumoResponse paraResumo(Produto produto) {
        return new ProdutoResumoResponse(
                produto.getId(), produto.getTitulo(), produto.getDescricaoCurta(), produto.getPreco(),
                new VendedorResumo(produto.getUsuario().getId(), produto.getUsuario().getNomeUsuario()));
    }

    private ProdutoDetalheResponse paraDetalhe(Produto produto) {
        List<CategoriaResumo> categorias = produtoService.listarCategoriasDoProduto(produto.getId()).stream()
                .map(categoria -> new CategoriaResumo(categoria.getId(), categoria.getNome()))
                .toList();

        return new ProdutoDetalheResponse(
                produto.getId(), produto.getTitulo(), produto.getDescricaoCurta(), produto.getDescricaoLonga(),
                produto.getPreco(),
                new VendedorResumo(produto.getUsuario().getId(), produto.getUsuario().getNomeUsuario()),
                fotoService.obterFotosParaFrontend(produto.getId()),
                categorias,
                avaliacaoService.calcularMediaDoProduto(produto.getId()));
    }
}
