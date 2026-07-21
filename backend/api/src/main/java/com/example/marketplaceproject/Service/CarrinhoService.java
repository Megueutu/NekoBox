package com.example.marketplaceproject.Service;

import com.example.marketplaceproject.Entity.Carrinho;
import com.example.marketplaceproject.Entity.Usuario;
import com.example.marketplaceproject.Exception.ConflitoDeDadosException;
import com.example.marketplaceproject.Repository.CarrinhoItemRepository;
import com.example.marketplaceproject.Repository.CarrinhoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class CarrinhoService {

    private final CarrinhoRepository carrinhoRepository;
    private final CarrinhoItemRepository carrinhoItemRepository;
    private final UsuarioService usuarioService;

    public Carrinho obterOuCriarCarrinho(Integer usuarioId) {
        Usuario usuario = usuarioService.buscarPorId(usuarioId);
        return carrinhoRepository.findByUsuario_Id(usuarioId)
                .orElseGet(() -> criarCarrinhoParaUsuario(usuario));
    }

    public void limparCarrinho(Integer usuarioId) {
        Carrinho carrinho = obterOuCriarCarrinho(usuarioId);
        carrinhoItemRepository.findByCarrinho_Id(carrinho.getId())
                .forEach(carrinhoItemRepository::delete);
    }

    private Carrinho criarCarrinhoParaUsuario(Usuario usuario) {
        try {
            return carrinhoRepository.saveAndFlush(Carrinho.builder()
                    .usuario(usuario)
                    .criadoEm(LocalDateTime.now())
                    .build());
        } catch (DataIntegrityViolationException exception) {
            return carrinhoRepository.findByUsuario_Id(usuario.getId())
                    .orElseThrow(() -> new ConflitoDeDadosException(
                            "Nao foi possivel preparar o carrinho do usuario."));
        }
    }
}
