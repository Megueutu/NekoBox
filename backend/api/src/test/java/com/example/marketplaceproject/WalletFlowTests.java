package com.example.marketplaceproject;

import com.example.marketplaceproject.Entity.CartaoPresente;
import com.example.marketplaceproject.Repository.CartaoPresenteRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import tools.jackson.databind.ObjectMapper;

import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.HexFormat;
import java.util.UUID;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class WalletFlowTests {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private CartaoPresenteRepository cartaoPresenteRepository;

    @Test
    void shouldCreditTheGiftCardValueAndExposeTheNewBalance() throws Exception {
        String token = registerAndLogin();
        String codigo = "NEKO-TEST-25";
        salvarCartao(codigo, "25.00");

        mockMvc.perform(post("/api/carteira/gift-cards/resgates")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"codigo\":\"" + codigo.toLowerCase() + "\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.valor_creditado").value(25.00))
                .andExpect(jsonPath("$.saldo").value(1025.00));

        mockMvc.perform(get("/api/carteira").header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.saldo").value(1025.00));
    }

    @Test
    void shouldRejectAGiftCardThatWasAlreadyRedeemed() throws Exception {
        String firstToken = registerAndLogin();
        String secondToken = registerAndLogin();
        String codigo = "NEKO-TEST-USED";
        salvarCartao(codigo, "50.00");

        mockMvc.perform(post("/api/carteira/gift-cards/resgates")
                        .header("Authorization", "Bearer " + firstToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"codigo\":\"" + codigo + "\"}"))
                .andExpect(status().isOk());

        mockMvc.perform(post("/api/carteira/gift-cards/resgates")
                        .header("Authorization", "Bearer " + secondToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"codigo\":\"" + codigo + "\"}"))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.mensagem").value("Este gift card ja foi resgatado."));
    }

    @Test
    void shouldRejectAnUnknownGiftCard() throws Exception {
        String token = registerAndLogin();

        mockMvc.perform(post("/api/carteira/gift-cards/resgates")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"codigo\":\"NEKO-UNKNOWN\"}"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.mensagem").value("Gift card invalido."));
    }

    @Test
    void shouldRejectABlankGiftCardCode() throws Exception {
        String token = registerAndLogin();

        mockMvc.perform(post("/api/carteira/gift-cards/resgates")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"codigo\":\"   \"}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.mensagem").value("Informe o codigo do gift card."));
    }

    @Test
    void shouldRequireAuthenticationToAccessTheWallet() throws Exception {
        mockMvc.perform(get("/api/carteira"))
                .andExpect(status().isUnauthorized());
    }

    private String registerAndLogin() throws Exception {
        String suffix = UUID.randomUUID().toString().replace("-", "").substring(0, 10);
        String email = "wallet_" + suffix + "@nekobox.local";
        mockMvc.perform(post("/api/usuarios")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"nome_usuario":"wallet_%s","email":"%s","senha":"Secure1!Pass"}
                                """.formatted(suffix, email)))
                .andExpect(status().isCreated());

        String loginBody = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"email":"%s","senha":"Secure1!Pass"}
                                """.formatted(email)))
                .andExpect(status().isOk())
                .andReturn().getResponse().getContentAsString();
        return objectMapper.readTree(loginBody).get("access_token").asText();
    }

    private void salvarCartao(String codigo, String valor) throws Exception {
        String codigoHash = HexFormat.of().formatHex(
                MessageDigest.getInstance("SHA-256").digest(codigo.getBytes(StandardCharsets.UTF_8)));
        cartaoPresenteRepository.saveAndFlush(CartaoPresente.builder()
                .codigoHash(codigoHash)
                .valor(new BigDecimal(valor))
                .build());
    }
}
