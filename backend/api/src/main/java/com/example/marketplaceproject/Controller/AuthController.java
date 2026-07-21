package com.example.marketplaceproject.Controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.marketplaceproject.Entity.Usuario;
import com.example.marketplaceproject.Service.UsuarioService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final UsuarioService usuarioService;

    public record LoginRequest(String email, String senha) {
    }

    public record LoginResponse(Integer usuarioId, String nomeUsuario, String email) {
    }

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@RequestBody LoginRequest request) {
        Usuario usuario = usuarioService.autenticar(request.email(), request.senha());
        return ResponseEntity.ok(new LoginResponse(
                usuario.getId(), usuario.getNomeUsuario(), usuario.getEmail()));
    }
}
