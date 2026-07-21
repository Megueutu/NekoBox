package com.example.marketplaceproject.Controller;

import com.example.marketplaceproject.Entity.Enuns.TipoFoto;
import com.example.marketplaceproject.Entity.Foto;
import com.example.marketplaceproject.Entity.Produto;
import com.example.marketplaceproject.Service.CloudinaryService;
import com.example.marketplaceproject.Service.FotoService;
import com.example.marketplaceproject.Service.ProdutoService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/produtos/{produtoId}/fotos")
@RequiredArgsConstructor
public class FotoController {

    private final FotoService fotoService;
    private final ProdutoService produtoService;
    private final CloudinaryService cloudinaryService;

    public record FotoResponse(Integer id, String url, String tipo) {
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<FotoResponse> upload(
            @RequestParam Integer usuarioId,
            @PathVariable Integer produtoId,
            @RequestParam("arquivo") MultipartFile arquivo,
            @RequestParam("tipo") String tipo) {
        verificarDono(usuarioId, produtoService.buscarPorId(produtoId));

        CloudinaryService.ResultadoUpload resultado = cloudinaryService.upload(arquivo, "produtos/" + produtoId);
        Foto foto = fotoService.adicionarFoto(
                produtoId, resultado.url(), resultado.publicId(), TipoFoto.deValor(tipo));
        return ResponseEntity.status(HttpStatus.CREATED).body(paraResponse(foto));
    }

    @DeleteMapping("/{fotoId}")
    public ResponseEntity<Void> remover(
            @RequestParam Integer usuarioId, @PathVariable Integer produtoId, @PathVariable Integer fotoId) {
        verificarDono(usuarioId, produtoService.buscarPorId(produtoId));

        Foto foto = fotoService.buscarPorId(produtoId, fotoId);
        cloudinaryService.remover(foto.getPublicId());
        fotoService.removerFoto(fotoId);
        return ResponseEntity.noContent().build();
    }

    private void verificarDono(Integer usuarioId, Produto produto) {
        if (!produto.getUsuario().getId().equals(usuarioId)) {
            throw new AccessDeniedException("Apenas o dono do produto pode executar esta acao.");
        }
    }

    private FotoResponse paraResponse(Foto foto) {
        return new FotoResponse(foto.getId(), foto.getUrl(), foto.getTipo().getValor());
    }
}
