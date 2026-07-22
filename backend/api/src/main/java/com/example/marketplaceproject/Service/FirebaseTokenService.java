package com.example.marketplaceproject.Service;

import com.example.marketplaceproject.Exception.CredenciaisInvalidasException;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import tools.jackson.core.type.TypeReference;
import tools.jackson.databind.ObjectMapper;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class FirebaseTokenService {

    private final ObjectMapper objectMapper;

    @Value("${FIREBASE_API_KEY:}")
    private String apiKey;

    public record FirebaseUser(String uid, String email, String displayName, String photoUrl) {
    }

    public FirebaseUser validar(String idToken) {
        if (apiKey.isBlank() || idToken == null || idToken.isBlank()) {
            throw new CredenciaisInvalidasException("Login com Google indisponivel.");
        }

        try {
            String body = objectMapper.writeValueAsString(Map.of("idToken", idToken));
            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create("https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=" + apiKey))
                    .timeout(Duration.ofSeconds(5))
                    .header("Content-Type", "application/json")
                    .POST(HttpRequest.BodyPublishers.ofString(body))
                    .build();
            HttpResponse<String> response = HttpClient.newHttpClient()
                    .send(request, HttpResponse.BodyHandlers.ofString());
            if (response.statusCode() != 200) {
                throw new CredenciaisInvalidasException("Token do Google invalido ou expirado.");
            }

            Map<String, Object> payload = objectMapper.readValue(response.body(), new TypeReference<>() { });
            List<?> users = (List<?>) payload.get("users");
            if (users == null || users.isEmpty() || !(users.getFirst() instanceof Map<?, ?> user)) {
                throw new CredenciaisInvalidasException("Token do Google invalido ou expirado.");
            }
            String email = valor(user, "email");
            if (!Boolean.parseBoolean(valor(user, "emailVerified")) || email.isBlank()) {
                throw new CredenciaisInvalidasException("A conta Google precisa ter um email verificado.");
            }
            return new FirebaseUser(valor(user, "localId"), email, valor(user, "displayName"), valor(user, "photoUrl"));
        } catch (CredenciaisInvalidasException exception) {
            throw exception;
        } catch (Exception exception) {
            throw new CredenciaisInvalidasException("Nao foi possivel validar o login com Google.");
        }
    }

    private String valor(Map<?, ?> source, String key) {
        Object value = source.get(key);
        return value == null ? "" : value.toString();
    }
}
