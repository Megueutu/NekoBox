package com.example.marketplaceproject;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import tools.jackson.databind.ObjectMapper;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class AuthenticationFlowTests {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void shouldAuthenticatePrivateEndpointsWithAnOpaqueSession() throws Exception {
        mockMvc.perform(post("/api/usuarios")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"nome_usuario":"integration_user","email":"integration@nekobox.local","senha":"Secure1!Pass"}
                                """))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.username").value("integration_user"));

        String loginBody = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"email":"integration@nekobox.local","senha":"Secure1!Pass"}
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token_type").value("Bearer"))
                .andExpect(jsonPath("$.user.id").isString())
                .andReturn().getResponse().getContentAsString();

        String token = objectMapper.readTree(loginBody).get("access_token").asText();

        mockMvc.perform(get("/api/carrinho"))
                .andExpect(status().isUnauthorized());

        mockMvc.perform(get("/api/carrinho").header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.items").isArray());

        mockMvc.perform(post("/api/auth/logout").header("Authorization", "Bearer " + token))
                .andExpect(status().isNoContent());

        mockMvc.perform(get("/api/carrinho").header("Authorization", "Bearer " + token))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void shouldExposeTheFrontendGameContractAndCompleteThePurchaseFlow() throws Exception {
        String sellerToken = registerAndLogin("seller_user", "seller@nekobox.local");

        String productBody = mockMvc.perform(post("/api/produtos")
                        .header("Authorization", "Bearer " + sellerToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "titulo":"Integration Quest",
                                  "descricao_curta":"A short integration adventure.",
                                  "descricao_longa":"A complete game contract used by the storefront.",
                                  "preco":79.90,
                                  "release_date":"2026-07-21",
                                  "status":"published",
                                  "tags":["RPG","Co-op"],
                                  "system_requirements":[{"type":"minimum","os":"Windows 11","ram":"8 GB"}],
                                  "languages":[{"name":"Português (Brasil)","interface":true,"subtitles":true,"audio":false}],
                                  "updates":[],
                                  "categoria_ids":[]
                                }
                                """))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();
        int productId = objectMapper.readTree(productBody).get("id").asInt();

        mockMvc.perform(get("/api/games/integration-quest"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(String.valueOf(productId)))
                .andExpect(jsonPath("$.title").value("Integration Quest"))
                .andExpect(jsonPath("$.slug").value("integration-quest"))
                .andExpect(jsonPath("$.short_description").isString())
                .andExpect(jsonPath("$.tags[0]").value("RPG"))
                .andExpect(jsonPath("$.system_requirements[0].type").value("minimum"))
                .andExpect(jsonPath("$.media").isArray())
                .andExpect(jsonPath("$.reviews").isArray());

        String buyerToken = registerAndLogin("buyer_user", "buyer@nekobox.local");

        mockMvc.perform(post("/api/wishlist/{produtoId}", productId)
                        .header("Authorization", "Bearer " + buyerToken))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.slug").value("integration-quest"));

        mockMvc.perform(post("/api/carrinho/itens")
                        .header("Authorization", "Bearer " + buyerToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"produto_id\":" + productId + "}"))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.items[0].slug").value("integration-quest"));

        mockMvc.perform(post("/api/pagamentos/checkout")
                        .header("Authorization", "Bearer " + buyerToken))
                .andExpect(status().isCreated());

        mockMvc.perform(get("/api/biblioteca")
                        .header("Authorization", "Bearer " + buyerToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].slug").value("integration-quest"));
    }

    private String registerAndLogin(String username, String email) throws Exception {
        mockMvc.perform(post("/api/usuarios")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"nome_usuario\":\"" + username + "\",\"email\":\"" + email
                                + "\",\"senha\":\"Secure1!Pass\"}"))
                .andExpect(status().isCreated());

        String loginBody = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"email\":\"" + email + "\",\"senha\":\"Secure1!Pass\"}"))
                .andExpect(status().isOk())
                .andReturn().getResponse().getContentAsString();
        return objectMapper.readTree(loginBody).get("access_token").asText();
    }
}
