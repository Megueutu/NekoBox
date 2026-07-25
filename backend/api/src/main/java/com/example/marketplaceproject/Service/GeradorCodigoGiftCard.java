package com.example.marketplaceproject.Service;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.util.HexFormat;

import org.springframework.stereotype.Service;

@Service
public class GeradorCodigoGiftCard {

    private static final String CARACTERES = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    private static final SecureRandom RANDOM = new SecureRandom();

    public record Codigo(String valor, String hash) {
    }

    public Codigo gerar() {
        StringBuilder valor = new StringBuilder("NEXUS");
        for (int bloco = 0; bloco < 3; bloco++) {
            valor.append("-");
            for (int caractere = 0; caractere < 4; caractere++) {
                valor.append(CARACTERES.charAt(RANDOM.nextInt(CARACTERES.length())));
            }
        }
        String codigo = valor.toString();
        return new Codigo(codigo, calcularHash(codigo));
    }

    private String calcularHash(String codigo) {
        try {
            return HexFormat.of().formatHex(
                    MessageDigest.getInstance("SHA-256")
                            .digest(codigo.getBytes(StandardCharsets.UTF_8)));
        } catch (NoSuchAlgorithmException exception) {
            throw new IllegalStateException("SHA-256 indisponivel.", exception);
        }
    }
}
