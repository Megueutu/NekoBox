package com.example.marketplaceproject.Controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.marketplaceproject.Entity.Usuario;
import com.example.marketplaceproject.Service.UsuarioService;
import com.example.marketplaceproject.Service.SessaoService;
import com.example.marketplaceproject.Service.FirebaseTokenService;
import org.springframework.web.bind.annotation.RequestHeader;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final UsuarioService usuarioService;
    private final SessaoService sessaoService;
    private final FirebaseTokenService firebaseTokenService;

    public record LoginRequest(String email, String senha) {
    }

    public record FirebaseLoginRequest(String idToken) {
    }

    public record UserResponse(
            String id, String username, String email, String avatarUrl, String bio, java.math.BigDecimal balance) {
    }

    public record LoginResponse(String accessToken, String tokenType, long expiresIn, UserResponse user) {
    }

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@RequestBody LoginRequest request) {
        Usuario usuario = usuarioService.autenticar(request.email(), request.senha());
        SessaoService.NovaSessao sessao = sessaoService.criar(usuario);
        return ResponseEntity.ok(new LoginResponse(sessao.token(), "Bearer", sessao.expiresIn(), toUser(usuario)));
    }

    @PostMapping("/firebase")
    public ResponseEntity<LoginResponse> loginFirebase(@RequestBody FirebaseLoginRequest request) {
        FirebaseTokenService.FirebaseUser firebaseUser = firebaseTokenService.validar(request.idToken());
        Usuario usuario = usuarioService.autenticarExterno(
                firebaseUser.email(), firebaseUser.displayName(), firebaseUser.photoUrl());
        SessaoService.NovaSessao sessao = sessaoService.criar(usuario);
        return ResponseEntity.ok(new LoginResponse(sessao.token(), "Bearer", sessao.expiresIn(), toUser(usuario)));
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout(@RequestHeader("Authorization") String authorization) {
        sessaoService.encerrar(authorization);
        return ResponseEntity.noContent().build();
    }

    private UserResponse toUser(Usuario usuario) {
        return new UserResponse(usuario.getId().toString(), usuario.getNomeUsuario(), usuario.getEmail(),
                usuario.getUrlAvatar(), usuario.getBiografia(), usuario.getSaldo());
    }
}
