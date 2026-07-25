package com.example.marketplaceproject.Service;

import com.example.marketplaceproject.Entity.Produto;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class ProdutoAuthorizationService {

    private final ProdutoService produtoService;
    private final SessaoService sessaoService;

    public Produto exigirDono(String authorization, Integer produtoId) {
        Integer usuarioId = sessaoService.autenticar(authorization).getId();
        Produto produto = produtoService.buscarPorId(produtoId);
        if (!produto.getUsuario().getId().equals(usuarioId)) {
            throw new AccessDeniedException("Apenas o dono do produto pode executar esta acao.");
        }
        return produto;
    }
}
