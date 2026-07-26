package com.example.marketplaceproject.Service;

import com.example.marketplaceproject.Entity.Foto;
import com.example.marketplaceproject.Entity.Produto;
import com.example.marketplaceproject.Repository.ProdutoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.CompletableFuture;

@Service
@RequiredArgsConstructor
public class CatalogMediaAuditService {

    private final ProdutoRepository produtoRepository;
    private final FotoService fotoService;
    private final CloudinaryService cloudinaryService;

    @Value("${app.cloudinary.media-root:nekobox/games}")
    private String mediaRoot;

    @Value("${app.cloudinary.screenshot-count:10}")
    private int screenshotCount;

    public record MediaEsperada(String slug, String tipo, int posicao, String publicId) {
    }

    public record MidiaDivergente(
            String jogo,
            String slug,
            String tipo,
            int posicao,
            String publicIdAtual,
            String publicIdEsperado) {
    }

    public record JogoSemScreenshots(String jogo, String slug) {
    }

    public record Relatorio(
            List<MediaEsperada> disponiveis,
            List<MediaEsperada> ausentes,
            List<MidiaDivergente> nomesDivergentes,
            List<JogoSemScreenshots> jogosSemScreenshots) {
    }

    private record Verificacao(MediaEsperada media, CompletableFuture<Boolean> existe) {
    }

    public Relatorio auditar() {
        List<Produto> produtos = produtoRepository.findByStatusOrderByIdAsc("published");
        List<Verificacao> verificacoes = new ArrayList<>();
        List<MidiaDivergente> divergentes = new ArrayList<>();

        for (Produto produto : produtos) {
            List<Foto> fotos = fotoService.listarFotosDoProduto(produto.getId());
            for (MediaEsperada esperada : mediasEsperadas(produto.getSlug())) {
                fotos.stream()
                        .filter(foto -> foto.getTipo().getValor().equals(esperada.tipo()))
                        .filter(foto -> foto.getPosicao().equals(esperada.posicao()))
                        .findFirst()
                        .map(Foto::getPublicId)
                        .filter(publicId -> publicId != null && !publicId.isBlank())
                        .filter(publicId -> !publicId.equals(esperada.publicId()))
                        .ifPresent(publicId -> divergentes.add(new MidiaDivergente(
                                produto.getTitulo(), produto.getSlug(), esperada.tipo(), esperada.posicao(),
                                publicId, esperada.publicId())));
                verificacoes.add(new Verificacao(esperada, cloudinaryService.existe(esperada.publicId())));
            }
        }

        CompletableFuture.allOf(verificacoes.stream()
                .map(Verificacao::existe)
                .toArray(CompletableFuture[]::new)).join();

        List<MediaEsperada> disponiveis = verificacoes.stream()
                .filter(verificacao -> verificacao.existe().join())
                .map(Verificacao::media)
                .toList();
        List<MediaEsperada> ausentes = verificacoes.stream()
                .filter(verificacao -> !verificacao.existe().join())
                .filter(verificacao -> !verificacao.media().tipo().equals("screenshot"))
                .map(Verificacao::media)
                .toList();
        List<JogoSemScreenshots> jogosSemScreenshots = produtos.stream()
                .filter(produto -> disponiveis.stream().noneMatch(media ->
                        media.slug().equals(produto.getSlug()) && media.tipo().equals("screenshot")))
                .map(produto -> new JogoSemScreenshots(produto.getTitulo(), produto.getSlug()))
                .toList();
        return new Relatorio(disponiveis, ausentes, divergentes, jogosSemScreenshots);
    }

    private List<MediaEsperada> mediasEsperadas(String slug) {
        List<MediaEsperada> medias = new ArrayList<>();
        medias.add(new MediaEsperada(slug, "cover", 1, mediaRoot + "/" + slug + "/cover"));
        medias.add(new MediaEsperada(slug, "banner", 1, mediaRoot + "/" + slug + "/banner"));
        for (int posicao = 1; posicao <= screenshotCount; posicao++) {
            medias.add(new MediaEsperada(
                    slug, "screenshot", posicao,
                    mediaRoot + "/" + slug + "/screenshot-" + posicao));
        }
        return medias;
    }

}
