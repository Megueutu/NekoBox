package com.example.marketplaceproject.Service;

import com.example.marketplaceproject.Entity.BibliotecaUsuario;
import com.example.marketplaceproject.Entity.BibliotecaUsuarioId;
import com.example.marketplaceproject.Entity.Enuns.StatusPagamento;
import com.example.marketplaceproject.Entity.Produto;
import com.example.marketplaceproject.Entity.Usuario;
import com.example.marketplaceproject.Exception.CampoInvalidoException;
import com.example.marketplaceproject.Exception.ConflitoDeDadosException;
import com.example.marketplaceproject.Exception.RecursoNaoEncontradoException;
import com.example.marketplaceproject.Exception.RegraNegocioException;
import com.example.marketplaceproject.Repository.BibliotecaUsuarioRepository;
import com.example.marketplaceproject.Repository.PagamentoRepository;
import com.example.marketplaceproject.Repository.ProdutoRepository;
import com.example.marketplaceproject.Repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class BibliotecaUsuarioService {

    private final BibliotecaUsuarioRepository bibliotecaUsuarioRepository;
    private final PagamentoRepository pagamentoRepository;
    private final UsuarioRepository usuarioRepository;
    private final ProdutoRepository produtoRepository;

    public BibliotecaUsuario adicionarProduto(Integer usuarioId, Integer produtoId) {
        if (usuarioId == null || usuarioId <= 0) {
            throw new CampoInvalidoException("O identificador informado deve ser valido.");
        }
        Usuario usuario =  usuarioRepository.findById(usuarioId)
                .orElseThrow(() -> new RecursoNaoEncontradoException(
                        "Usuario nao encontrado."));

        if (produtoId == null || produtoId <= 0) {
            throw new CampoInvalidoException("O identificador informado deve ser valido.");
        }
        Produto produto = produtoRepository.findById(produtoId)
                .orElseThrow(() -> new RecursoNaoEncontradoException(
                        "Produto nao encontrado."));

        BibliotecaUsuarioId id = new BibliotecaUsuarioId(usuarioId, produtoId);

        if (!pagamentoRepository.existsByUsuario_IdAndProduto_IdAndStatus(
                usuarioId, produtoId, StatusPagamento.APROVADO)) {
            throw new RegraNegocioException(
                    "O produto so pode entrar na biblioteca apos pagamento aprovado.");
        }

        try {
            return bibliotecaUsuarioRepository.saveAndFlush(BibliotecaUsuario.builder()
                    .id(id)
                    .usuario(usuario)
                    .produto(produto)
                    .tempoJogoMinutos(0)
                    .adicionadoEm(LocalDateTime.now())
                    .build());
        } catch (DataIntegrityViolationException exception) {
            throw new ConflitoDeDadosException("O produto ja existe na biblioteca do usuario.");
        }
    }

    public List<BibliotecaUsuario> listarBiblioteca(Integer usuarioId) {
        if (usuarioId == null || usuarioId <= 0) {
            throw new CampoInvalidoException("O identificador informado deve ser valido.");
        }
        return bibliotecaUsuarioRepository.findByUsuario_Id(usuarioId);
    }

    public BibliotecaUsuario incrementarTempoJogo(Integer usuarioId, Integer produtoId, Integer minutosAdicionais) {
        if (minutosAdicionais == null || minutosAdicionais <= 0) {
            throw new RegraNegocioException("O tempo jogado a incrementar deve ser maior que zero.");
        }

        BibliotecaUsuario item = buscarItem(usuarioId, produtoId);
        item.setTempoJogoMinutos(item.getTempoJogoMinutos() + minutosAdicionais);
        return bibliotecaUsuarioRepository.save(item);
    }

    private BibliotecaUsuario buscarItem(Integer usuarioId, Integer produtoId) {
        return bibliotecaUsuarioRepository.findById(new BibliotecaUsuarioId(usuarioId, produtoId))
                .orElseThrow(() -> new RecursoNaoEncontradoException(
                        "Produto nao encontrado na biblioteca do usuario."));
    }
}