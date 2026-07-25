package com.example.marketplaceproject.Service;

import com.example.marketplaceproject.Entity.CartaoPresente;
import com.example.marketplaceproject.Entity.Foto;
import com.example.marketplaceproject.Entity.Pagamento;
import com.example.marketplaceproject.Entity.Produto;
import com.example.marketplaceproject.Entity.Usuario;
import com.example.marketplaceproject.Entity.Enuns.PapelUsuario;
import com.example.marketplaceproject.Entity.Enuns.StatusPagamento;
import com.example.marketplaceproject.Entity.Enuns.TipoFoto;
import com.example.marketplaceproject.Exception.CampoInvalidoException;
import com.example.marketplaceproject.Repository.CartaoPresenteRepository;
import com.example.marketplaceproject.Repository.FotoRepository;
import com.example.marketplaceproject.Repository.PagamentoRepository;
import com.example.marketplaceproject.Repository.ProdutoRepository;
import com.example.marketplaceproject.Repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import tools.jackson.core.type.TypeReference;
import tools.jackson.databind.ObjectMapper;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class AdminService {

    private static final String CATALOGO_EMAIL = "catalog@nekobox.local";

    private final SessaoService sessaoService;
    private final GeradorCodigoGiftCard geradorCodigoGiftCard;
    private final UsuarioService usuarioService;
    private final UsuarioRepository usuarioRepository;
    private final ProdutoService produtoService;
    private final ProdutoRepository produtoRepository;
    private final FotoRepository fotoRepository;
    private final FotoService fotoService;
    private final CloudinaryService cloudinaryService;
    private final PagamentoRepository pagamentoRepository;
    private final CartaoPresenteRepository cartaoPresenteRepository;
    private final ObjectMapper objectMapper;

    public record Dashboard(
            BigDecimal receita, long vendas, BigDecimal ticketMedio, long compradores,
            long usuarios, long jogosAtivos, List<PontoVenda> evolucao,
            List<JogoVendido> maisVendidos, List<VendaRecente> vendasRecentes) {
    }

    public record PontoVenda(LocalDate data, BigDecimal receita, long vendas) {
    }

    public record JogoVendido(Integer id, String titulo, long vendas, BigDecimal receita) {
    }

    public record VendaRecente(
            Integer id, LocalDateTime criadoEm, String usuario, String jogo, BigDecimal valor) {
    }

    public record GiftCardGerado(
            Long id, String codigo, BigDecimal valor, LocalDateTime criadoEm) {
    }

    public record GiftCardResumo(
            Long id, BigDecimal valor, boolean resgatado, String resgatadoPor,
            LocalDateTime resgatadoEm, LocalDateTime criadoEm) {
    }

    public record UsuarioResumo(
            Integer id, String nomeUsuario, String email, BigDecimal saldo,
            PapelUsuario papel, LocalDateTime criadoEm) {
    }

    public record JogoResumo(
            Integer id, String titulo, String slug, String descricaoCurta, String descricaoLonga,
            BigDecimal preco, LocalDate dataLancamento, String status, List<String> tags,
            List<Integer> categoriaIds, String capaUrl, List<MidiaResumo> midias) {
    }

    public record MidiaResumo(
            Integer id, String url, String publicId, String tipo, Integer posicao) {
    }

    public Usuario exigirAdmin(String authorization) {
        Usuario usuario = sessaoService.autenticar(authorization);
        if (usuario.getPapel() != PapelUsuario.ADMIN) {
            throw new AccessDeniedException("Acesso administrativo obrigatorio.");
        }
        return usuario;
    }

    @Transactional(readOnly = true)
    public Dashboard dashboard(String authorization) {
        exigirAdmin(authorization);
        List<Pagamento> pagamentos = pagamentoRepository.findByStatusOrderByCriadoEmAsc(StatusPagamento.APROVADO);
        BigDecimal receita = pagamentos.stream()
                .map(Pagamento::getValorPago)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        long vendas = pagamentos.size();
        BigDecimal ticketMedio = vendas == 0
                ? BigDecimal.ZERO
                : receita.divide(BigDecimal.valueOf(vendas), 2, RoundingMode.HALF_UP);
        long compradores = pagamentos.stream()
                .map(pagamento -> pagamento.getUsuario().getId())
                .distinct()
                .count();

        Map<LocalDate, List<Pagamento>> porData = new LinkedHashMap<>();
        Map<Integer, List<Pagamento>> porJogo = new LinkedHashMap<>();
        pagamentos.forEach(pagamento -> {
            LocalDate data = pagamento.getCriadoEm().toLocalDate();
            porData.computeIfAbsent(data, ignored -> new ArrayList<>()).add(pagamento);
            porJogo.computeIfAbsent(pagamento.getProduto().getId(), ignored -> new ArrayList<>()).add(pagamento);
        });

        List<PontoVenda> evolucao = porData.entrySet().stream()
                .map(entry -> new PontoVenda(
                        entry.getKey(),
                        entry.getValue().stream().map(Pagamento::getValorPago)
                                .reduce(BigDecimal.ZERO, BigDecimal::add),
                        entry.getValue().size()))
                .toList();

        List<JogoVendido> maisVendidos = porJogo.values().stream()
                .map(lista -> new JogoVendido(
                        lista.getFirst().getProduto().getId(),
                        lista.getFirst().getProduto().getTitulo(),
                        lista.size(),
                        lista.stream().map(Pagamento::getValorPago)
                                .reduce(BigDecimal.ZERO, BigDecimal::add)))
                .sorted(Comparator.comparingLong(JogoVendido::vendas).reversed()
                        .thenComparing(JogoVendido::titulo))
                .limit(5)
                .toList();

        List<VendaRecente> recentes = pagamentos.reversed().stream()
                .limit(8)
                .map(pagamento -> new VendaRecente(
                        pagamento.getId(), pagamento.getCriadoEm(),
                        pagamento.getUsuario().getNomeUsuario(),
                        pagamento.getProduto().getTitulo(), pagamento.getValorPago()))
                .toList();

        return new Dashboard(
                receita, vendas, ticketMedio, compradores,
                usuarioRepository.count(), produtoRepository.countByStatus("published"),
                evolucao, maisVendidos, recentes);
    }

    @Transactional
    public GiftCardGerado gerarGiftCard(String authorization, BigDecimal valor) {
        exigirAdmin(authorization);
        if (valor == null || valor.compareTo(new BigDecimal("1.00")) < 0
                || valor.compareTo(new BigDecimal("10000.00")) > 0) {
            throw new CampoInvalidoException("O valor do gift card deve estar entre R$ 1,00 e R$ 10.000,00.");
        }

        GeradorCodigoGiftCard.Codigo codigo;
        do {
            codigo = geradorCodigoGiftCard.gerar();
        } while (cartaoPresenteRepository.existsByCodigoHash(codigo.hash()));

        CartaoPresente cartao = cartaoPresenteRepository.saveAndFlush(CartaoPresente.builder()
                .codigoHash(codigo.hash())
                .valor(valor.setScale(2, RoundingMode.HALF_UP))
                .build());
        return new GiftCardGerado(cartao.getId(), codigo.valor(), cartao.getValor(), cartao.getCriadoEm());
    }

    @Transactional(readOnly = true)
    public List<GiftCardResumo> listarGiftCards(String authorization) {
        exigirAdmin(authorization);
        return cartaoPresenteRepository.findAllByOrderByCriadoEmDesc().stream()
                .map(cartao -> new GiftCardResumo(
                        cartao.getId(), cartao.getValor(), cartao.getResgatadoPor() != null,
                        cartao.getResgatadoPor() == null ? null : cartao.getResgatadoPor().getNomeUsuario(),
                        cartao.getResgatadoEm(), cartao.getCriadoEm()))
                .toList();
    }

    @Transactional(readOnly = true)
    public List<UsuarioResumo> listarUsuarios(String authorization) {
        exigirAdmin(authorization);
        return usuarioService.listarTodos().stream().map(this::toUsuarioResumo).toList();
    }

    @Transactional
    public UsuarioResumo criarUsuario(String authorization, Usuario usuario) {
        exigirAdmin(authorization);
        return toUsuarioResumo(usuarioService.cadastrar(usuario));
    }

    @Transactional
    public UsuarioResumo atualizarUsuario(
            String authorization, Integer id, String nomeUsuario, String email,
            String senha, BigDecimal saldo) {
        exigirAdmin(authorization);
        return toUsuarioResumo(usuarioService.atualizarPeloAdmin(id, nomeUsuario, email, senha, saldo));
    }

    @Transactional
    public void excluirUsuario(String authorization, Integer id) {
        exigirAdmin(authorization);
        usuarioService.excluirPeloAdmin(id);
    }

    @Transactional(readOnly = true)
    public List<JogoResumo> listarJogos(String authorization) {
        exigirAdmin(authorization);
        return produtoRepository.findAllByOrderByIdAsc().stream().map(this::toJogoResumo).toList();
    }

    @Transactional
    public JogoResumo criarJogo(
            String authorization, Produto produto, List<Integer> categoriaIds) {
        exigirAdmin(authorization);
        Usuario catalogo = usuarioRepository.findByEmailIgnoreCase(CATALOGO_EMAIL)
                .orElseThrow(() -> new IllegalStateException("Usuario de catalogo nao encontrado."));
        return toJogoResumo(produtoService.criarProduto(catalogo.getId(), produto, categoriaIds));
    }

    @Transactional
    public JogoResumo atualizarJogo(
            String authorization, Integer id, Produto produto, List<Integer> categoriaIds) {
        exigirAdmin(authorization);
        Produto atual = produtoService.buscarPorId(id);
        produto.setRequisitosJson(atual.getRequisitosJson());
        produto.setIdiomasJson(atual.getIdiomasJson());
        produto.setAtualizacoesJson(atual.getAtualizacoesJson());
        return toJogoResumo(produtoService.atualizarProduto(id, produto, categoriaIds));
    }

    @Transactional
    public void excluirJogo(String authorization, Integer id) {
        exigirAdmin(authorization);
        fotoRepository.findByProduto_Id(id).forEach(foto -> cloudinaryService.remover(foto.getPublicId()));
        produtoService.excluirProduto(id);
    }

    @Transactional
    public MidiaResumo enviarMidia(
            String authorization, Integer jogoId, MultipartFile arquivo, String tipoInformado) {
        exigirAdmin(authorization);
        produtoService.buscarPorId(jogoId);
        TipoFoto tipo = TipoFoto.deValor(tipoInformado);
        CloudinaryService.ResultadoUpload upload = cloudinaryService.upload(
                arquivo, "nekobox/admin/games/" + jogoId);

        if (!tipo.permiteMultiplas()) {
            fotoRepository.findByProduto_IdAndTipo(jogoId, tipo).forEach(foto -> {
                cloudinaryService.remover(foto.getPublicId());
                fotoRepository.delete(foto);
            });
        }

        int proximaPosicao = tipo.permiteMultiplas()
                ? fotoRepository.findByProduto_IdAndTipoOrderByPosicaoAsc(jogoId, tipo).stream()
                        .map(Foto::getPosicao)
                        .max(Integer::compareTo)
                        .orElse(0) + 1
                : 1;
        Foto foto = fotoService.adicionarFoto(jogoId, upload.url(), upload.publicId(), tipo);
        if (tipo.permiteMultiplas()) {
            foto.setPosicao(proximaPosicao);
            foto = fotoRepository.save(foto);
        }
        return toMidiaResumo(foto);
    }

    @Transactional
    public void removerMidia(String authorization, Integer jogoId, Integer fotoId) {
        exigirAdmin(authorization);
        Foto foto = fotoService.buscarPorId(jogoId, fotoId);
        cloudinaryService.remover(foto.getPublicId());
        fotoService.removerFoto(fotoId);
    }

    private UsuarioResumo toUsuarioResumo(Usuario usuario) {
        return new UsuarioResumo(
                usuario.getId(), usuario.getNomeUsuario(), usuario.getEmail(),
                usuario.getSaldo(), usuario.getPapel(), usuario.getCriadoEm());
    }

    private JogoResumo toJogoResumo(Produto produto) {
        List<Foto> fotos = fotoRepository.findByProduto_IdOrderByTipoAscPosicaoAsc(produto.getId());
        String capa = fotos.stream()
                .filter(foto -> foto.getTipo() == TipoFoto.COVER)
                .map(Foto::getUrl)
                .findFirst()
                .orElse("");
        List<Integer> categorias = produtoService.listarCategoriasDoProduto(produto.getId()).stream()
                .map(categoria -> categoria.getId())
                .toList();
        return new JogoResumo(
                produto.getId(), produto.getTitulo(), produto.getSlug(),
                produto.getDescricaoCurta(), produto.getDescricaoLonga(), produto.getPreco(),
                produto.getDataLancamento(), produto.getStatus(), parseTags(produto.getTagsJson()),
                categorias, capa, fotos.stream().map(this::toMidiaResumo).toList());
    }

    private MidiaResumo toMidiaResumo(Foto foto) {
        return new MidiaResumo(
                foto.getId(), foto.getUrl(), foto.getPublicId(),
                foto.getTipo().getValor(), foto.getPosicao());
    }

    private List<String> parseTags(String json) {
        try {
            return objectMapper.readValue(json == null ? "[]" : json, new TypeReference<>() { });
        } catch (Exception exception) {
            return List.of();
        }
    }

}
