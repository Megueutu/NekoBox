package com.example.marketplaceproject;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import tools.jackson.databind.ObjectMapper;

import java.util.UUID;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class CartFlowTests {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void shouldUpdateQuantityAndChargeTheCalculatedTotal() throws Exception {
        CartFixture fixture = createCartFixture("79.90");

        mockMvc.perform(patch("/api/carrinho/itens/{produtoId}", fixture.productId())
                        .header("Authorization", "Bearer " + fixture.buyerToken())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"quantidade\":3}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.items[0].quantity").value(3))
                .andExpect(jsonPath("$.total").value(239.70));

        mockMvc.perform(post("/api/pagamentos/checkout")
                        .header("Authorization", "Bearer " + fixture.buyerToken()))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.pagamentos[0].quantidade").value(3))
                .andExpect(jsonPath("$.pagamentos[0].para_presente").value(true))
                .andExpect(jsonPath("$.pagamentos[0].valor_pago").value(239.70))
                .andExpect(jsonPath("$.codigos_presente.length()").value(3));

        mockMvc.perform(get("/api/carteira")
                        .header("Authorization", "Bearer " + fixture.buyerToken()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.saldo").value(760.30));
    }

    @Test
    void shouldRejectQuantityBelowTheMinimum() throws Exception {
        CartFixture fixture = createCartFixture("10.00");

        mockMvc.perform(patch("/api/carrinho/itens/{produtoId}", fixture.productId())
                        .header("Authorization", "Bearer " + fixture.buyerToken())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"quantidade\":0}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.mensagem")
                        .value("A quantidade de presentes deve estar entre 1 e 10."));
    }

    @Test
    void shouldRejectQuantityAboveTheMaximum() throws Exception {
        CartFixture fixture = createCartFixture("10.00");

        mockMvc.perform(patch("/api/carrinho/itens/{produtoId}", fixture.productId())
                        .header("Authorization", "Bearer " + fixture.buyerToken())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"quantidade\":11}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.mensagem")
                        .value("A quantidade de presentes deve estar entre 1 e 10."));
    }

    private CartFixture createCartFixture(String price) throws Exception {
        String suffix = UUID.randomUUID().toString().replace("-", "").substring(0, 10);
        String sellerToken = registerAndLogin("seller_" + suffix, "seller_" + suffix + "@nekobox.local");
        String productBody = mockMvc.perform(post("/api/produtos")
                        .header("Authorization", "Bearer " + sellerToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "titulo":"Quantity Quest %s",
                                  "descricao_curta":"A cart quantity integration test.",
                                  "descricao_longa":"A product created to validate totals and checkout.",
                                  "preco":%s,
                                  "release_date":"2026-07-24",
                                  "status":"published",
                                  "tags":["Test"],
                                  "updates":[],
                                  "categoria_ids":[]
                                }
                                """.formatted(suffix, price)))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();
        int productId = objectMapper.readTree(productBody).get("id").asInt();
        String buyerToken = registerAndLogin("buyer_" + suffix, "buyer_" + suffix + "@nekobox.local");

        mockMvc.perform(post("/api/carrinho/itens")
                        .header("Authorization", "Bearer " + buyerToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"produto_id\":" + productId + ",\"para_presente\":true}"))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.items[0].quantity").value(1))
                .andExpect(jsonPath("$.items[0].for_gift").value(true));

        return new CartFixture(buyerToken, productId);
    }

    private String registerAndLogin(String username, String email) throws Exception {
        mockMvc.perform(post("/api/usuarios")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"nome_usuario":"%s","email":"%s","senha":"Secure1!Pass"}
                                """.formatted(username, email)))
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

    private record CartFixture(String buyerToken, int productId) {
    }
}
