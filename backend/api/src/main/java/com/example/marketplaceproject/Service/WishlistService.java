package com.example.marketplaceproject.Service;

import com.example.marketplaceproject.Entity.Usuario;
import com.example.marketplaceproject.Entity.WishlistItem;
import com.example.marketplaceproject.Exception.ConflitoDeDadosException;
import com.example.marketplaceproject.Exception.RecursoNaoEncontradoException;
import com.example.marketplaceproject.Repository.WishlistItemRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class WishlistService {

    private final WishlistItemRepository repository;
    private final ProdutoService produtoService;

    public List<WishlistItem> listar(Integer usuarioId) {
        return repository.findByUsuario_IdOrderByCriadoEmDesc(usuarioId);
    }

    public WishlistItem adicionar(Usuario usuario, Integer produtoId) {
        try {
            return repository.saveAndFlush(WishlistItem.builder()
                    .usuario(usuario)
                    .produto(produtoService.buscarPorId(produtoId))
                    .criadoEm(LocalDateTime.now())
                    .build());
        } catch (DataIntegrityViolationException exception) {
            throw new ConflitoDeDadosException("O produto ja esta na lista de desejos.");
        }
    }

    public void remover(Integer usuarioId, Integer produtoId) {
        WishlistItem item = repository.findByUsuario_IdAndProduto_Id(usuarioId, produtoId)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Produto nao encontrado na lista de desejos."));
        repository.delete(item);
    }
}
