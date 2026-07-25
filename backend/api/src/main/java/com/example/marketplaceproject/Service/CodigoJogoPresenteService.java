package com.example.marketplaceproject.Service;

import com.example.marketplaceproject.Entity.CodigoJogoPresente;
import com.example.marketplaceproject.Entity.Produto;
import com.example.marketplaceproject.Entity.Usuario;
import com.example.marketplaceproject.Exception.CampoInvalidoException;
import com.example.marketplaceproject.Exception.ConflitoDeDadosException;
import com.example.marketplaceproject.Exception.RecursoNaoEncontradoException;
import com.example.marketplaceproject.Exception.RegraNegocioException;
import com.example.marketplaceproject.Repository.BibliotecaUsuarioRepository;
import com.example.marketplaceproject.Repository.CodigoJogoPresenteRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HexFormat;
import java.util.List;
import java.util.Locale;
import java.util.regex.Pattern;

@Service
@RequiredArgsConstructor
public class CodigoJogoPresenteService {

    private static final String CARACTERES = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    private static final SecureRandom RANDOM = new SecureRandom();
    private static final Pattern CODIGO_PATTERN =
            Pattern.compile("^NEKO-GAME-[A-HJ-NP-Z2-9]{4}(?:-[A-HJ-NP-Z2-9]{4}){2}$");

    private final CodigoJogoPresenteRepository codigoRepository;
    private final BibliotecaUsuarioRepository bibliotecaRepository;
    private final BibliotecaUsuarioService bibliotecaService;
    private final UsuarioService usuarioService;
    private final CodigoJogoPresenteCipher codigoCipher;

    public record CodigoGerado(Integer produtoId, String tituloProduto, String codigo) {
    }

    public record CodigoComprado(
            Long id, Integer produtoId, String tituloProduto, String codigo,
            boolean resgatado, LocalDateTime criadoEm, LocalDateTime resgatadoEm) {
    }

    public List<CodigoGerado> gerar(Usuario comprador, Produto produto, int quantidade) {
        List<CodigoGerado> codigos = new ArrayList<>();
        for (int indice = 0; indice < quantidade; indice++) {
            String codigo;
            String codigoHash;
            do {
                codigo = gerarValor();
                codigoHash = calcularHash(codigo);
            } while (codigoRepository.existsByCodigoHash(codigoHash));

            codigoRepository.save(CodigoJogoPresente.builder()
                    .codigoHash(codigoHash)
                    .codigoCriptografado(codigoCipher.encrypt(codigo))
                    .produto(produto)
                    .comprador(comprador)
                    .build());
            codigos.add(new CodigoGerado(produto.getId(), produto.getTitulo(), codigo));
        }
        return codigos;
    }

    @Transactional(readOnly = true)
    public List<CodigoComprado> listarPorComprador(Integer compradorId) {
        usuarioService.buscarPorId(compradorId);
        return codigoRepository.listarPorComprador(compradorId).stream()
                .map(presente -> new CodigoComprado(
                        presente.getId(),
                        presente.getProduto().getId(),
                        presente.getProduto().getTitulo(),
                        codigoCipher.decrypt(presente.getCodigoCriptografado()),
                        presente.getResgatadoPor() != null,
                        presente.getCriadoEm(),
                        presente.getResgatadoEm()))
                .toList();
    }

    @Transactional
    public Produto resgatar(Integer usuarioId, String codigoInformado) {
        if (codigoInformado == null || codigoInformado.isBlank()) {
            throw new CampoInvalidoException("Informe o codigo do jogo.");
        }

        Usuario usuario = usuarioService.buscarPorId(usuarioId);
        String codigo = codigoInformado.trim().toUpperCase(Locale.ROOT);
        if (!CODIGO_PATTERN.matcher(codigo).matches()) {
            throw new CampoInvalidoException("O codigo do jogo e invalido.");
        }
        CodigoJogoPresente presente = codigoRepository.buscarParaResgate(calcularHash(codigo))
                .orElseThrow(() -> new RecursoNaoEncontradoException("Codigo de jogo invalido."));

        if (presente.getResgatadoPor() != null) {
            throw new ConflitoDeDadosException("Este codigo de jogo ja foi resgatado.");
        }
        if (presente.getComprador().getId().equals(usuarioId)) {
            throw new RegraNegocioException("Envie este codigo para um amigo resgatar.");
        }
        if (bibliotecaRepository.existsByUsuario_IdAndProduto_Id(
                usuarioId, presente.getProduto().getId())) {
            throw new ConflitoDeDadosException("Voce ja possui este jogo na biblioteca.");
        }

        bibliotecaService.adicionarProdutoPresente(usuario, presente.getProduto());
        presente.setResgatadoPor(usuario);
        presente.setResgatadoEm(LocalDateTime.now());
        codigoRepository.save(presente);
        return presente.getProduto();
    }

    private String gerarValor() {
        StringBuilder codigo = new StringBuilder("NEKO-GAME");
        for (int bloco = 0; bloco < 3; bloco++) {
            codigo.append("-");
            for (int caractere = 0; caractere < 4; caractere++) {
                codigo.append(CARACTERES.charAt(RANDOM.nextInt(CARACTERES.length())));
            }
        }
        return codigo.toString();
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
