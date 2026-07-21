package com.example.marketplaceproject.Service;

import com.example.marketplaceproject.Entity.Avaliacao;
import com.example.marketplaceproject.Entity.Produto;
import com.example.marketplaceproject.Entity.Usuario;
import com.example.marketplaceproject.Exception.CampoInvalidoException;
import com.example.marketplaceproject.Exception.ConflitoDeDadosException;
import com.example.marketplaceproject.Exception.RecursoNaoEncontradoException;
import com.example.marketplaceproject.Exception.RegraNegocioException;
import com.example.marketplaceproject.Repository.AvaliacaoRepository;
import com.example.marketplaceproject.Repository.BibliotecaUsuarioRepository;
import com.example.marketplaceproject.Repository.ProdutoRepository;
import com.example.marketplaceproject.Repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AvaliacaoService {

    private final AvaliacaoRepository avaliacaoRepository;
    private final UsuarioRepository usuarioRepository;
    private final ProdutoRepository produtoRepository;
    private final BibliotecaUsuarioRepository bibliotecaUsuarioRepository;

    public Avaliacao criarAvaliacao(
            Integer usuarioId, Integer produtoId, double nota, Boolean recomenda, String textoAvaliacao) {
        validarAvaliacao(nota, recomenda);

        Usuario usuario = usuarioRepository.findById(usuarioId)
                .orElseThrow(() -> new RecursoNaoEncontradoException(
                        "Usuario nao encontrado para avaliacao."));
        Produto produto = produtoRepository.findById(produtoId)
                .orElseThrow(() -> new RecursoNaoEncontradoException(
                        "Produto nao encontrado para avaliacao."));

        if (!bibliotecaUsuarioRepository.existsByUsuario_IdAndProduto_Id(usuarioId, produtoId)) {
            throw new RegraNegocioException(
                    "O usuario so pode avaliar produtos presentes em sua biblioteca.");
        }

        try {
            return avaliacaoRepository.saveAndFlush(Avaliacao.builder()
                    .usuario(usuario)
                    .produto(produto)
                    .nota(nota)
                    .recomenda(recomenda)
                    .textoAvaliacao(normalizarTextoOpcional(textoAvaliacao))
                    .criadoEm(LocalDateTime.now())
                    .build());
        } catch (DataIntegrityViolationException exception) {
            throw new ConflitoDeDadosException("O usuario ja avaliou este produto.");
        }
    }

    public Avaliacao atualizarAvaliacao(
            Integer avaliacaoId, double nota, Boolean recomenda, String textoAvaliacao) {
        Avaliacao avaliacao = buscarPorId(avaliacaoId);
        validarAvaliacao(nota, recomenda);

        avaliacao.setNota(nota);
        avaliacao.setRecomenda(recomenda);
        avaliacao.setTextoAvaliacao(normalizarTextoOpcional(textoAvaliacao));
        return avaliacaoRepository.save(avaliacao);
    }

    public void excluirAvaliacao(Integer avaliacaoId) {
        avaliacaoRepository.delete(buscarPorId(avaliacaoId));
    }

    public Avaliacao buscarPorId(Integer avaliacaoId) {
        if (avaliacaoId == null || avaliacaoId <= 0) {
            throw new CampoInvalidoException("O identificador informado deve ser valido.");
        }
        return avaliacaoRepository.findById(avaliacaoId)
                .orElseThrow(() -> new RecursoNaoEncontradoException(
                        "Avaliacao nao encontrada para o identificador informado."));
    }

    public List<Avaliacao> listarPorProduto(Integer produtoId) {
        return avaliacaoRepository.findByProduto_Id(produtoId);
    }

    public double calcularMediaDoProduto(Integer produtoId) {
        List<Avaliacao> avaliacoes = listarPorProduto(produtoId);
        return avaliacoes.stream()
                .mapToDouble(Avaliacao::getNota)
                .average()
                .orElse(0.0);
    }

    private void validarAvaliacao(double nota, Boolean recomenda) {
        if (nota < 1 || nota > 5) {
            throw new RegraNegocioException("A nota deve estar entre 1 e 5.");
        }
        if (recomenda == null) {
            throw new RegraNegocioException("A informacao de recomendacao e obrigatoria.");
        }
    }

    private String normalizarTextoOpcional(String texto) {
        return texto == null || texto.isBlank() ? null : texto.trim();
    }
}
