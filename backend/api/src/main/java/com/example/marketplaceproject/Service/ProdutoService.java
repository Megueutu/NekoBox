package com.example.marketplaceproject.Service;

import com.example.marketplaceproject.Entity.Categoria;
import com.example.marketplaceproject.Entity.Produto;
import com.example.marketplaceproject.Entity.ProdutoCategoria;
import com.example.marketplaceproject.Entity.ProdutoCategoriaId;
import com.example.marketplaceproject.Entity.Usuario;
import com.example.marketplaceproject.Exception.CampoInvalidoException;
import com.example.marketplaceproject.Exception.ConflitoDeDadosException;
import com.example.marketplaceproject.Exception.RecursoNaoEncontradoException;
import com.example.marketplaceproject.Exception.RegraNegocioException;
import com.example.marketplaceproject.Repository.BibliotecaUsuarioRepository;
import com.example.marketplaceproject.Repository.PagamentoRepository;
import com.example.marketplaceproject.Repository.ProdutoCategoriaRepository;
import com.example.marketplaceproject.Repository.ProdutoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.Collection;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProdutoService {

    private final ProdutoRepository produtoRepository;
    private final UsuarioService usuarioService;
    private final CategoriaService categoriaService;
    private final ProdutoCategoriaRepository produtoCategoriaRepository;
    private final PagamentoRepository pagamentoRepository;
    private final BibliotecaUsuarioRepository bibliotecaUsuarioRepository;

    public Produto criarProduto(Integer vendedorId, Produto produto, Collection<Integer> categoriaIds) {
        if (produto == null) {
            throw new RegraNegocioException("Os dados do produto devem ser informados.");
        }

        Usuario vendedor = usuarioService.buscarPorId(vendedorId);
        String titulo = normalizarTitulo(produto.getTitulo());
        BigDecimal preco = validarPreco(produto.getPreco());
        List<Categoria> categorias = buscarCategorias(categoriaIds);

        produto.setId(null);
        produto.setUsuario(vendedor);
        produto.setTitulo(titulo);
        produto.setDescricaoCurta(normalizarTextoOpcional(produto.getDescricaoCurta()));
        produto.setDescricaoLonga(normalizarTextoOpcional(produto.getDescricaoLonga()));
        produto.setPreco(preco);

        Produto produtoSalvo = produtoRepository.save(produto);
        sincronizarCategorias(produtoSalvo, categorias);
        return produtoSalvo;
    }

    public Produto atualizarProduto(Integer produtoId, Produto novosDados, Collection<Integer> categoriaIds) {
        Produto produto = buscarPorId(produtoId);
        if (novosDados == null) {
            throw new RegraNegocioException("Os dados do produto devem ser informados.");
        }

        String titulo = normalizarTitulo(novosDados.getTitulo());
        BigDecimal preco = validarPreco(novosDados.getPreco());
        List<Categoria> categorias = buscarCategorias(categoriaIds);

        produto.setTitulo(titulo);
        produto.setDescricaoCurta(normalizarTextoOpcional(novosDados.getDescricaoCurta()));
        produto.setDescricaoLonga(normalizarTextoOpcional(novosDados.getDescricaoLonga()));
        produto.setPreco(preco);

        sincronizarCategorias(produto, categorias);
        return produtoRepository.save(produto);
    }

    public void excluirProduto(Integer produtoId) {
        Produto produto = buscarPorId(produtoId);
        if (pagamentoRepository.existsByProduto_Id(produtoId)
                || bibliotecaUsuarioRepository.existsByProduto_Id(produtoId)) {
            throw new ConflitoDeDadosException(
                    "Produto nao pode ser excluido porque possui vinculos ativos.");
        }

        produtoCategoriaRepository.findByProduto_Id(produto.getId())
                .forEach(produtoCategoriaRepository::delete);

        try {
            produtoRepository.delete(produto);
            produtoRepository.flush();
        } catch (DataIntegrityViolationException exception) {
            throw new ConflitoDeDadosException(
                    "Produto nao pode ser excluido porque possui vinculos ativos.");
        }
    }

    public Produto buscarPorId(Integer produtoId) {
        if (produtoId == null || produtoId <= 0) {
            throw new CampoInvalidoException("O identificador informado deve ser valido.");
        }
        return produtoRepository.findById(produtoId)
                .orElseThrow(() -> new RecursoNaoEncontradoException(
                        "Produto nao encontrado para o identificador informado."));
    }

    public Page<Produto> listar(String titulo, Integer categoriaId, BigDecimal precoMinimo,
                                 BigDecimal precoMaximo, Pageable pageable) {
        String tituloBusca = (titulo == null || titulo.isBlank()) ? null : titulo.trim();
        return produtoRepository.buscar(tituloBusca, categoriaId, precoMinimo, precoMaximo, pageable);
    }

    public List<Categoria> listarCategoriasDoProduto(Integer produtoId) {
        buscarPorId(produtoId);
        return produtoCategoriaRepository.findByProduto_Id(produtoId).stream()
                .map(ProdutoCategoria::getCategoria)
                .toList();
    }

    public void vincularCategoria(Integer produtoId, Integer categoriaId) {
        Produto produto = buscarPorId(produtoId);
        Categoria categoria = categoriaService.buscarPorId(categoriaId);
        ProdutoCategoriaId id = new ProdutoCategoriaId(produtoId, categoriaId);

        if (produtoCategoriaRepository.existsById(id)) {
            throw new ConflitoDeDadosException("O produto ja esta vinculado a esta categoria.");
        }
        produtoCategoriaRepository.save(ProdutoCategoria.builder()
                .id(id)
                .produto(produto)
                .categoria(categoria)
                .build());
    }

    public void desvincularCategoria(Integer produtoId, Integer categoriaId) {
        buscarPorId(produtoId);
        ProdutoCategoriaId id = new ProdutoCategoriaId(produtoId, categoriaId);
        ProdutoCategoria vinculo = produtoCategoriaRepository.findById(id)
                .orElseThrow(() -> new RecursoNaoEncontradoException(
                        "O produto nao esta vinculado a esta categoria."));
        produtoCategoriaRepository.delete(vinculo);
    }

    private List<Categoria> buscarCategorias(Collection<Integer> categoriaIds) {
        if (categoriaIds == null || categoriaIds.isEmpty()) {
            return List.of();
        }

        Set<Integer> idsUnicos = new HashSet<>(categoriaIds);
        List<Categoria> categorias = new ArrayList<>();
        for (Integer categoriaId : idsUnicos) {
            categorias.add(categoriaService.buscarPorId(categoriaId));
        }
        return categorias;
    }

    private void sincronizarCategorias(Produto produto, List<Categoria> categoriasDesejadas) {
        Set<Integer> idsDesejados = categoriasDesejadas.stream()
                .map(Categoria::getId)
                .collect(Collectors.toSet());

        List<ProdutoCategoria> categoriasAtuais =
                produtoCategoriaRepository.findByProduto_Id(produto.getId());

        for (ProdutoCategoria categoriaAtual : categoriasAtuais) {
            if (!idsDesejados.contains(categoriaAtual.getCategoria().getId())) {
                produtoCategoriaRepository.delete(categoriaAtual);
            }
        }

        Set<Integer> idsMantidos = categoriasAtuais.stream()
                .map(produtoCategoria -> produtoCategoria.getCategoria().getId())
                .filter(idsDesejados::contains)
                .collect(Collectors.toSet());

        for (Categoria categoria : categoriasDesejadas) {
            if (idsMantidos.contains(categoria.getId())) {
                continue;
            }
            produtoCategoriaRepository.save(ProdutoCategoria.builder()
                    .id(new ProdutoCategoriaId(produto.getId(), categoria.getId()))
                    .produto(produto)
                    .categoria(categoria)
                    .build());
        }
    }

    private String normalizarTitulo(String titulo) {
        if (titulo == null || titulo.isBlank()) {
            throw new RegraNegocioException("O titulo do produto e obrigatorio.");
        }
        String tituloNormalizado = titulo.trim();
        if (tituloNormalizado.length() > 255) {
            throw new RegraNegocioException("O titulo deve ter no maximo 255 caracteres.");
        }
        return tituloNormalizado;
    }

    private BigDecimal validarPreco(BigDecimal preco) {
        if (preco == null || preco.signum() < 0) {
            throw new RegraNegocioException("O preco do produto nao pode ser negativo.");
        }
        return preco.setScale(2, RoundingMode.HALF_EVEN);
    }

    private String normalizarTextoOpcional(String texto) {
        return texto == null || texto.isBlank() ? null : texto.trim();
    }
}
