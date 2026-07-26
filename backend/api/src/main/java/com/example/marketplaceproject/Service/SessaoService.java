package com.example.marketplaceproject.Service;

import com.example.marketplaceproject.Entity.Sessao;
import com.example.marketplaceproject.Entity.Usuario;
import com.example.marketplaceproject.Exception.CredenciaisInvalidasException;
import com.example.marketplaceproject.Repository.SessaoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.time.Duration;
import java.time.LocalDateTime;
import java.util.Base64;
import java.util.HexFormat;

@Service
@RequiredArgsConstructor
public class SessaoService {

    private static final Duration DURACAO = Duration.ofHours(12);
    private static final SecureRandom RANDOM = new SecureRandom();

    private final SessaoRepository sessaoRepository;

    public record NovaSessao(String token, long expiresIn) {
    }

    public NovaSessao criar(Usuario usuario) {
        byte[] bytes = new byte[32];
        RANDOM.nextBytes(bytes);
        String token = Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
        LocalDateTime agora = LocalDateTime.now();
        sessaoRepository.save(Sessao.builder()
                .usuario(usuario)
                .tokenHash(hash(token))
                .criadoEm(agora)
                .expiraEm(agora.plus(DURACAO))
                .build());
        return new NovaSessao(token, DURACAO.toSeconds());
    }

    @Transactional(readOnly = true)
    public Usuario autenticar(String authorization) {
        String token = extrairToken(authorization);
        return sessaoRepository.findByTokenHashAndExpiraEmAfter(hash(token), LocalDateTime.now())
                .map(Sessao::getUsuario)
                .orElseThrow(() -> new CredenciaisInvalidasException("Sessao invalida ou expirada."));
    }

    @Transactional
    public void encerrar(String authorization) {
        sessaoRepository.deleteByTokenHash(hash(extrairToken(authorization)));
    }

    private String extrairToken(String authorization) {
        if (authorization == null || !authorization.startsWith("Bearer ")) {
            throw new CredenciaisInvalidasException("Autenticacao obrigatoria.");
        }
        String token = authorization.substring(7).trim();
        if (token.isEmpty()) {
            throw new CredenciaisInvalidasException("Autenticacao obrigatoria.");
        }
        return token;
    }

    private String hash(String token) {
        try {
            return HexFormat.of().formatHex(
                    MessageDigest.getInstance("SHA-256").digest(token.getBytes(StandardCharsets.UTF_8)));
        } catch (NoSuchAlgorithmException exception) {
            throw new IllegalStateException("SHA-256 indisponivel.", exception);
        }
    }
}
