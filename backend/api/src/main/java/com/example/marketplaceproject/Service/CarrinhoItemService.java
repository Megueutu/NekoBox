package com.example.marketplaceproject.Service;

import com.example.marketplaceproject.Entity.Carrinho;
import com.example.marketplaceproject.Entity.CarrinhoItem;
import com.example.marketplaceproject.Entity.Produto;
import com.example.marketplaceproject.Exception.ConflitoDeDadosException;
import com.example.marketplaceproject.Exception.RecursoNaoEncontradoException;
import com.example.marketplaceproject.Exception.RegraNegocioException;
import com.example.marketplaceproject.Repository.BibliotecaUsuarioRepository;
import com.example.marketplaceproject.Repository.CarrinhoItemRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class CarrinhoItemService {

    private final CarrinhoItemRepository carrinhoItemRepository;
    private final CarrinhoService carrinhoService;
    private final ProdutoService produtoService;
    private final BibliotecaUsuarioRepository bibliotecaUsuarioRepository;

    public CarrinhoItem adicionarProduto(Integer usuarioId, Integer produtoId) {
        Carrinho carrinho = carrinhoService.obterOuCriarCarrinho(usuarioId);
        Produto produto = produtoService.buscarPorId(produtoId);

        if (produto.getUsuario().getId().equals(usuarioId)) {
            throw new RegraNegocioException(
                    "O vendedor nao pode adicionar o proprio produto ao carrinho.");
        }
        if (bibliotecaUsuarioRepository.existsByUsuario_IdAndProduto_Id(usuarioId, produtoId)) {
            throw new ConflitoDeDadosException(
                    "O usuario ja possui este produto na biblioteca.");
        }

        try {
            return carrinhoItemRepository.saveAndFlush(CarrinhoItem.builder()
                    .carrinho(carrinho)
                    .produto(produto)
                    .criadoEm(LocalDateTime.now())
                    .build());
        } catch (DataIntegrityViolationException exception) {
            throw new ConflitoDeDadosException("O produto ja foi adicionado ao carrinho.");
        }
    }

    public void removerProduto(Integer usuarioId, Integer produtoId) {
        Carrinho carrinho = carrinhoService.obterOuCriarCarrinho(usuarioId);
        CarrinhoItem item = carrinhoItemRepository
                .findByCarrinho_IdAndProduto_Id(carrinho.getId(), produtoId)
                .orElseThrow(() -> new RecursoNaoEncontradoException(
                        "Produto nao encontrado no carrinho do usuario."));
        carrinhoItemRepository.delete(item);
    }

    public List<CarrinhoItem> listarItens(Integer usuarioId) {
        Carrinho carrinho = carrinhoService.obterOuCriarCarrinho(usuarioId);
        return carrinhoItemRepository.findByCarrinho_Id(carrinho.getId());
    }
}
