package com.example.marketplaceproject;

import com.example.marketplaceproject.Service.GeradorCodigoGiftCard;
import org.junit.jupiter.api.Test;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.HexFormat;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

class GeradorCodigoGiftCardTests {

    private final GeradorCodigoGiftCard gerador = new GeradorCodigoGiftCard();

    @Test
    void shouldGenerateAFormattedCodeWithItsSha256Hash() throws Exception {
        GeradorCodigoGiftCard.Codigo codigo = gerador.gerar();
        String hashEsperado = HexFormat.of().formatHex(
                MessageDigest.getInstance("SHA-256")
                        .digest(codigo.valor().getBytes(StandardCharsets.UTF_8)));

        assertTrue(codigo.valor().matches("^NEXUS-[A-HJ-NP-Z2-9]{4}-[A-HJ-NP-Z2-9]{4}-[A-HJ-NP-Z2-9]{4}$"));
        assertEquals(hashEsperado, codigo.hash());
    }
}
