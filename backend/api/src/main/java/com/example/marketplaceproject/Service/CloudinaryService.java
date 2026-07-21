package com.example.marketplaceproject.Service;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import com.example.marketplaceproject.Exception.RegraNegocioException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;

@Service
public class CloudinaryService {

    private final Cloudinary cloudinary;

    public CloudinaryService(@Value("${CLOUDINARY_URL}") String cloudinaryUrl) {
        this.cloudinary = new Cloudinary(cloudinaryUrl);
    }

    public record ResultadoUpload(String url, String publicId) {
    }

    public ResultadoUpload upload(MultipartFile arquivo, String pasta) {
        if (arquivo == null || arquivo.isEmpty()) {
            throw new RegraNegocioException("O arquivo enviado esta vazio.");
        }
        try {
            Map<?, ?> resultado = cloudinary.uploader()
                    .upload(arquivo.getBytes(), ObjectUtils.asMap("folder", pasta));
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
