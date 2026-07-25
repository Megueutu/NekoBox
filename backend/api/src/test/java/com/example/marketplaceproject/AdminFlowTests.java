package com.example.marketplaceproject;

import com.example.marketplaceproject.Entity.Usuario;
import com.example.marketplaceproject.Entity.Enuns.TipoFoto;
import com.example.marketplaceproject.Repository.FotoRepository;
import com.example.marketplaceproject.Entity.Enuns.PapelUsuario;
import com.example.marketplaceproject.Repository.UsuarioRepository;
import com.example.marketplaceproject.Service.CloudinaryService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.ObjectMapper;

import java.math.BigDecimal;
import java.util.concurrent.CompletableFuture;
import java.util.UUID;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.multipart;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;

@SpringBootTest
@AutoConfigureMockMvc
class AdminFlowTests {

    private static final String ADMIN_EMAIL = "admin@nekobox.local";
    private static final String ADMIN_PASSWORD = "Admin1!Nexus";
    private static final String ADMIN_SEED_HASH =
            "$2y$10$cwUtHF0/aFE5nYgzqxs/t.mCRZMgjnPk2TKA/KH/cW600/kdiUhru";

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private FotoRepository fotoRepository;

    @MockitoBean
    private CloudinaryService cloudinaryService;

    private Integer adminId;

    @BeforeEach
    void ensureSingleAdmin() {
        Usuario admin = usuarioRepository.findByEmailIgnoreCase(ADMIN_EMAIL).orElseGet(() ->
                Usuario.builder()
                        .nomeUsuario("admin")
                        .email(ADMIN_EMAIL)
                        .senha(passwordEncoder.encode(ADMIN_PASSWORD))
                        .saldo(BigDecimal.ZERO)
                        .papel(PapelUsuario.ADMIN)
                        .build());
        admin.setPapel(PapelUsuario.ADMIN);
        admin.setSenha(passwordEncoder.encode(ADMIN_PASSWORD));
        adminId = usuarioRepository.saveAndFlush(admin).getId();
    }

    @Test
    void shouldExposeAdminRoleOnTheGenericLogin() throws Exception {
        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"email":"admin@nekobox.local","senha":"Admin1!Nexus"}
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.user.role").value("ADMIN"));
    }

    @Test
    void shouldMatchThePasswordDefinedByTheDatabaseSeed() {
        org.junit.jupiter.api.Assertions.assertTrue(
                passwordEncoder.matches(ADMIN_PASSWORD, ADMIN_SEED_HASH));
    }

    @Test
    void shouldRejectARegularUserFromAdminEndpoints() throws Exception {
        String userToken = registerAndLogin();

        mockMvc.perform(get("/api/admin/dashboard")
                        .header("Authorization", "Bearer " + userToken))
                .andExpect(status().isForbidden());
    }

    @Test
    void shouldGenerateAOneTimeGiftCardThatCanBeRedeemed() throws Exception {
        String adminToken = login(ADMIN_EMAIL, ADMIN_PASSWORD);
        String userToken = registerAndLogin();

        String body = mockMvc.perform(post("/api/admin/gift-cards")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"valor\":35.50}"))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.codigo").isString())
                .andExpect(jsonPath("$.valor").value(35.50))
                .andReturn().getResponse().getContentAsString();

        String codigo = objectMapper.readTree(body).get("codigo").asText();
        mockMvc.perform(post("/api/carteira/gift-cards/resgates")
                        .header("Authorization", "Bearer " + userToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(
                                objectMapper.createObjectNode().put("codigo", codigo))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.valor_creditado").value(35.50));
    }

    @Test
    void shouldProtectTheSingleAdminFromDeletion() throws Exception {
        String adminToken = login(ADMIN_EMAIL, ADMIN_PASSWORD);

        mockMvc.perform(delete("/api/admin/usuarios/" + adminId)
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.mensagem").value("O administrador unico nao pode ser excluido."));
    }

    @Test
    void shouldUploadAndPersistAdminGameMedia() throws Exception {
        String adminToken = login(ADMIN_EMAIL, ADMIN_PASSWORD);
        Integer gameId = createGame(adminToken);
        when(cloudinaryService.upload(any(), anyString()))
                .thenReturn(new CloudinaryService.ResultadoUpload(
                        "https://res.cloudinary.com/demo/image/upload/generated.jpg",
                        "generated-public-id"));
        MockMultipartFile image = new MockMultipartFile(
                "arquivo", "cover.png", MediaType.IMAGE_PNG_VALUE, new byte[] { 1, 2, 3 });

        mockMvc.perform(multipart("/api/admin/jogos/" + gameId + "/midias")
                        .file(image)
                        .param("tipo", "cover")
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.public_id").value("generated-public-id"))
                .andExpect(jsonPath("$.tipo").value("cover"));

        org.junit.jupiter.api.Assertions.assertEquals(
                1, fotoRepository.findByProduto_IdAndTipo(gameId, TipoFoto.COVER).size());

        when(cloudinaryService.existe(anyString())).thenReturn(CompletableFuture.completedFuture(true));
        mockMvc.perform(get("/api/games/media-audit"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.disponiveis[0].public_id").value("generated-public-id"));
    }

    private String registerAndLogin() throws Exception {
        String suffix = UUID.randomUUID().toString().replace("-", "").substring(0, 10);
        String email = "admin_test_" + suffix + "@nekobox.local";
        mockMvc.perform(post("/api/usuarios")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"nome_usuario":"user_%s","email":"%s","senha":"Secure1!Pass"}
                                """.formatted(suffix, email)))
                .andExpect(status().isCreated());
        return login(email, "Secure1!Pass");
    }

    private Integer createGame(String adminToken) throws Exception {
        usuarioRepository.findByEmailIgnoreCase("catalog@nekobox.local").orElseGet(() ->
                usuarioRepository.saveAndFlush(Usuario.builder()
                        .nomeUsuario("catalog")
                        .email("catalog@nekobox.local")
                        .senha(passwordEncoder.encode("Catalog1!Local"))
                        .saldo(BigDecimal.ZERO)
                        .papel(PapelUsuario.USER)
                        .build()));
        String body = mockMvc.perform(post("/api/admin/jogos")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "titulo":"Media Test Game",
                                  "descricao_curta":"Test",
                                  "preco":10.00,
                                  "status":"published",
                                  "tags":[],
                                  "categoria_ids":[]
                                }
                                """))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();
        return objectMapper.readTree(body).get("id").asInt();
    }

    private String login(String email, String password) throws Exception {
        String body = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(
                                objectMapper.createObjectNode()
                                        .put("email", email)
                                        .put("senha", password))))
                .andExpect(status().isOk())
                .andReturn().getResponse().getContentAsString();
        JsonNode response = objectMapper.readTree(body);
        return response.get("access_token").asText();
    }
}
