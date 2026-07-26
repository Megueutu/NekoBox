package com.example.marketplaceproject.Service;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import com.example.marketplaceproject.Exception.RegraNegocioException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.ByteArrayInputStream;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.CompletableFuture;
import javax.imageio.ImageIO;

@Service
public class CloudinaryService {

    private static final long TAMANHO_MAXIMO = 10L * 1024L * 1024L;
    private static final Set<String> TIPOS_PERMITIDOS = Set.of("image/jpeg", "image/png", "image/gif");

    private final Cloudinary cloudinary;
    private final HttpClient httpClient;

    public CloudinaryService(@Value("${CLOUDINARY_URL}") String cloudinaryUrl) {
        this.cloudinary = new Cloudinary(cloudinaryUrl);
        this.httpClient = HttpClient.newBuilder()
                .connectTimeout(Duration.ofSeconds(5))
                .followRedirects(HttpClient.Redirect.NORMAL)
                .build();
    }

    public record ResultadoUpload(String url, String publicId) {
    }

    public CompletableFuture<Boolean> existe(String publicId) {
        String url = cloudinary.url().secure(true).generate(publicId);
        HttpRequest request = HttpRequest.newBuilder(URI.create(url))
                .timeout(Duration.ofSeconds(5))
                .method("HEAD", HttpRequest.BodyPublishers.noBody())
                .build();

        return httpClient.sendAsync(request, HttpResponse.BodyHandlers.discarding())
                .thenApply(response -> response.statusCode() >= 200 && response.statusCode() < 300)
                .exceptionally(exception -> false);
    }

    public ResultadoUpload upload(MultipartFile arquivo, String pasta) {
        if (arquivo == null || arquivo.isEmpty()) {
            throw new RegraNegocioException("O arquivo enviado esta vazio.");
        }
        try {
            if (arquivo.getSize() > TAMANHO_MAXIMO || !TIPOS_PERMITIDOS.contains(arquivo.getContentType())) {
                throw new RegraNegocioException("Envie uma imagem JPEG, PNG ou GIF de ate 10 MB.");
            }
            byte[] bytes = arquivo.getBytes();
            if (ImageIO.read(new ByteArrayInputStream(bytes)) == null) {
                throw new RegraNegocioException("O conteudo enviado nao e uma imagem valida.");
            }
            Map<?, ?> resultado = cloudinary.uploader()
                    .upload(bytes, ObjectUtils.asMap("folder", pasta, "resource_type", "image"));
            return new ResultadoUpload(
                    (String) resultado.get("secure_url"),
                    (String) resultado.get("public_id"));
        } catch (IOException exception) {
            throw new RegraNegocioException("Falha ao enviar o arquivo.");
        }
    }

    public void remover(String publicId) {
        if (publicId == null || publicId.isBlank()) {
            return;
        }
        try {
            cloudinary.uploader().destroy(publicId, ObjectUtils.emptyMap());
        } catch (IOException exception) {
            throw new RegraNegocioException("Falha ao remover o arquivo.");
        }
    }

}
