package com.example.marketplaceproject;

import com.example.marketplaceproject.Entity.Produto;
import com.example.marketplaceproject.Entity.Usuario;
import com.example.marketplaceproject.Entity.Enuns.PapelUsuario;
import com.example.marketplaceproject.Repository.ProdutoRepository;
import com.example.marketplaceproject.Repository.UsuarioRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.web.servlet.MockMvc;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.ObjectMapper;

import java.math.BigDecimal;
import java.util.UUID;

import static org.hamcrest.Matchers.hasItem;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class GameGiftFlowTests {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private ProdutoRepository produtoRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    private Produto game;

    @BeforeEach
    void createPublishedGame() {
        String suffix = suffix();
        Usuario publisher = usuarioRepository.saveAndFlush(Usuario.builder()
                .nomeUsuario("publisher_" + suffix)
                .email("publisher_" + suffix + "@nekobox.local")
                .senha(passwordEncoder.encode("Secure1!Pass"))
                .saldo(BigDecimal.ZERO)
                .papel(PapelUsuario.USER)
                .build());
        game = produtoRepository.saveAndFlush(Produto.builder()
                .usuario(publisher)
                .titulo("Gift Quest " + suffix)
                .slug("gift-quest-" + suffix)
                .descricaoCurta("A game used to validate gifts.")
                .preco(new BigDecimal("12.50"))
                .status("published")
                .build());
    }

    @Test
    void shouldGenerateOneRedeemableCodeForEachGiftCopy() throws Exception {
        String buyerToken = registerAndLogin("buyer");
        String friendToken = registerAndLogin("friend");

        mockMvc.perform(post("/api/carrinho/itens")
                        .header("Authorization", bearer(buyerToken))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"produto_id":%d,"para_presente":true}
                                """.formatted(game.getId())))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.items[0].for_gift").value(true));

        mockMvc.perform(patch("/api/carrinho/itens/{produtoId}", game.getId())
                        .header("Authorization", bearer(buyerToken))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"quantidade\":2}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.items[0].quantity").value(2))
                .andExpect(jsonPath("$.total").value(25.00));

        String checkoutBody = mockMvc.perform(post("/api/pagamentos/checkout")
                        .header("Authorization", bearer(buyerToken)))
                .andExpect(status().isCreated())
                .andExpect(header().string("Cache-Control", "no-store"))
                .andExpect(jsonPath("$.pagamentos[0].para_presente").value(true))
                .andExpect(jsonPath("$.pagamentos[0].quantidade").value(2))
                .andExpect(jsonPath("$.codigos_presente.length()").value(2))
                .andReturn().getResponse().getContentAsString();
        String code = objectMapper.readTree(checkoutBody)
                .get("codigos_presente").get(0).get("codigo").asText();

        mockMvc.perform(get("/api/presentes")
                        .header("Authorization", bearer(buyerToken)))
                .andExpect(status().isOk())
                .andExpect(header().string("Cache-Control", "no-store"))
                .andExpect(jsonPath("$[0].titulo_produto").value(game.getTitulo()))
                .andExpect(jsonPath("$[0].codigo").isNotEmpty())
                .andExpect(jsonPath("$[0].resgatado").value(false));

        mockMvc.perform(get("/api/presentes")
                        .header("Authorization", bearer(friendToken)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isEmpty());

        mockMvc.perform(post("/api/biblioteca/resgates")
                        .header("Authorization", bearer(buyerToken))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(codeBody(code)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.mensagem").value("Envie este codigo para um amigo resgatar."));

        mockMvc.perform(post("/api/biblioteca/resgates")
                        .header("Authorization", bearer(friendToken))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(codeBody(code.toLowerCase())))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(String.valueOf(game.getId())));

        mockMvc.perform(get("/api/presentes")
                        .header("Authorization", bearer(buyerToken)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[?(@.codigo == '" + code + "')].resgatado")
                        .value(hasItem(true)))
                .andExpect(jsonPath("$[?(@.codigo == '" + code + "')].resgatado_em")
                        .isNotEmpty());

        mockMvc.perform(get("/api/biblioteca")
                        .header("Authorization", bearer(friendToken)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(String.valueOf(game.getId())));

        mockMvc.perform(post("/api/biblioteca/resgates")
                        .header("Authorization", bearer(registerAndLogin("other")))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(codeBody(code)))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.mensagem").value("Este codigo de jogo ja foi resgatado."));
    }

    @Test
    void shouldRejectGiftQuantityOutsideTheAllowedRange() throws Exception {
        String buyerToken = registerAndLogin("quantity");
        addGiftToCart(buyerToken);

        mockMvc.perform(patch("/api/carrinho/itens/{produtoId}", game.getId())
                        .header("Authorization", bearer(buyerToken))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"quantidade\":11}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.mensagem")
                        .value("A quantidade de presentes deve estar entre 1 e 10."));
    }

    @Test
    void shouldRejectMalformedGiftCodeBeforeLookingItUp() throws Exception {
        String friendToken = registerAndLogin("malformed");

        mockMvc.perform(post("/api/biblioteca/resgates")
                        .header("Authorization", bearer(friendToken))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(codeBody("not-a-game-code")))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.mensagem").value("O codigo do jogo e invalido."));
    }

    @Test
    void shouldKeepPersonalPurchaseQuantityFixedAtOne() throws Exception {
        String buyerToken = registerAndLogin("personal");

        mockMvc.perform(post("/api/carrinho/itens")
                        .header("Authorization", bearer(buyerToken))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"produto_id\":" + game.getId() + "}"))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.items[0].quantity").value(1))
                .andExpect(jsonPath("$.items[0].for_gift").value(false));

        mockMvc.perform(patch("/api/carrinho/itens/{produtoId}", game.getId())
                        .header("Authorization", bearer(buyerToken))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"quantidade\":2}"))
                .andExpect(status().isNotFound());
    }

    @Test
    void shouldAcquireFreeGameDirectlyAndRejectItAsAGift() throws Exception {
        Produto freeGame = produtoRepository.saveAndFlush(Produto.builder()
                .usuario(game.getUsuario())
                .titulo("Free Quest " + suffix())
                .slug("free-quest-" + suffix())
                .descricaoCurta("A free game used to validate license acquisition.")
                .preco(BigDecimal.ZERO)
                .status("published")
                .build());
        String buyerToken = registerAndLogin("free");

        mockMvc.perform(post("/api/biblioteca/licencas-gratuitas/{produtoId}", freeGame.getId())
                        .header("Authorization", bearer(buyerToken)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(String.valueOf(freeGame.getId())));

        mockMvc.perform(post("/api/carrinho/itens")
                        .header("Authorization", bearer(buyerToken))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"produto_id":%d,"para_presente":true}
                                """.formatted(freeGame.getId())))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.mensagem")
                        .value("Jogos gratuitos devem ser adquiridos diretamente na biblioteca."));
    }

    private void addGiftToCart(String token) throws Exception {
        mockMvc.perform(post("/api/carrinho/itens")
                        .header("Authorization", bearer(token))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"produto_id":%d,"para_presente":true}
                                """.formatted(game.getId())))
                .andExpect(status().isCreated());
    }

    private String registerAndLogin(String prefix) throws Exception {
        String suffix = suffix();
        String username = prefix + "_" + suffix;
        String email = username + "@nekobox.local";
        mockMvc.perform(post("/api/usuarios")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"nome_usuario":"%s","email":"%s","senha":"Secure1!Pass"}
                                """.formatted(username, email)))
                .andExpect(status().isCreated());

        String body = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"email":"%s","senha":"Secure1!Pass"}
                                """.formatted(email)))
                .andExpect(status().isOk())
                .andReturn().getResponse().getContentAsString();
        return objectMapper.readTree(body).get("access_token").asText();
    }

    private String codeBody(String code) throws Exception {
        return objectMapper.writeValueAsString(
                objectMapper.createObjectNode().put("codigo", code));
    }

    private String bearer(String token) {
        return "Bearer " + token;
    }

    private String suffix() {
        return UUID.randomUUID().toString().replace("-", "").substring(0, 10);
    }
}
