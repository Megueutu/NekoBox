package com.example.marketplaceproject.Service;

import com.example.marketplaceproject.Entity.CartaoPresente;
import com.example.marketplaceproject.Entity.Usuario;
import com.example.marketplaceproject.Exception.CampoInvalidoException;
import com.example.marketplaceproject.Exception.ConflitoDeDadosException;
import com.example.marketplaceproject.Exception.RecursoNaoEncontradoException;
import com.example.marketplaceproject.Repository.CartaoPresenteRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.LocalDateTime;
import java.util.HexFormat;
import java.util.Locale;

@Service
@RequiredArgsConstructor
public class CarteiraService {

    private final CartaoPresenteRepository cartaoPresenteRepository;
    private final UsuarioService usuarioService;

    public record Resgate(BigDecimal valorCreditado, BigDecimal saldo) {
    }

    public record Recarga(BigDecimal valorAdicionado, BigDecimal saldo) {
    }

    private static final BigDecimal VALOR_MAXIMO_RECARGA = new BigDecimal("5000.00");

    @Transactional(readOnly = true)
    public BigDecimal consultarSaldo(Integer usuarioId) {
        return usuarioService.buscarPorId(usuarioId).getSaldo();
    }

    @Transactional
    public Recarga adicionarSaldo(Integer usuarioId, BigDecimal valor) {
        if (valor == null || valor.signum() <= 0) {
            throw new CampoInvalidoException("O valor da recarga deve ser maior que zero.");
        }
        BigDecimal valorNormalizado = valor.setScale(2, RoundingMode.HALF_EVEN);
        if (valorNormalizado.compareTo(VALOR_MAXIMO_RECARGA) > 0) {
            throw new CampoInvalidoException("O valor da recarga nao pode ultrapassar R$ 5.000,00 por operacao.");
        }

        Usuario usuario = usuarioService.buscarPorIdParaAtualizacao(usuarioId);
        BigDecimal novoSaldo = usuario.getSaldo().add(valorNormalizado).setScale(2, RoundingMode.HALF_EVEN);
        usuario.setSaldo(novoSaldo);
        usuarioService.salvar(usuario);
        return new Recarga(valorNormalizado, novoSaldo);
    }

    @Transactional
    public Resgate resgatar(Integer usuarioId, String codigo) {
        String codigoNormalizado = normalizarCodigo(codigo);
        CartaoPresente cartao = cartaoPresenteRepository.findWithLockByCodigoHash(hash(codigoNormalizado))
                .orElseThrow(() -> new RecursoNaoEncontradoException("Gift card invalido."));

        if (cartao.getResgatadoPor() != null) {
            throw new ConflitoDeDadosException("Este gift card ja foi resgatado.");
        }

        Usuario usuario = usuarioService.buscarPorIdParaAtualizacao(usuarioId);
        BigDecimal novoSaldo = usuario.getSaldo().add(cartao.getValor()).setScale(2, RoundingMode.HALF_EVEN);
        usuario.setSaldo(novoSaldo);
        cartao.setResgatadoPor(usuario);
        cartao.setResgatadoEm(LocalDateTime.now());

        usuarioService.salvar(usuario);
        cartaoPresenteRepository.saveAndFlush(cartao);
        return new Resgate(cartao.getValor(), novoSaldo);
    }

    private String normalizarCodigo(String codigo) {
        if (codigo == null || codigo.isBlank()) {
            throw new CampoInvalidoException("Informe o codigo do gift card.");
        }
        String codigoNormalizado = codigo.trim().toUpperCase(Locale.ROOT);
        if (codigoNormalizado.length() > 64) {
            throw new CampoInvalidoException("O codigo do gift card e invalido.");
        }
        return codigoNormalizado;
    }

    private String hash(String codigo) {
        try {
            return HexFormat.of().formatHex(
                    MessageDigest.getInstance("SHA-256").digest(codigo.getBytes(StandardCharsets.UTF_8)));
        } catch (NoSuchAlgorithmException exception) {
            throw new IllegalStateException("SHA-256 indisponivel.", exception);
        }
    }
}
