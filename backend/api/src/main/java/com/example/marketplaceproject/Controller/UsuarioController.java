package com.example.marketplaceproject.Controller;

import com.example.marketplaceproject.Entity.Usuario;
import com.example.marketplaceproject.Service.CloudinaryService;
import com.example.marketplaceproject.Service.UsuarioService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;

@RestController
@RequestMapping("/api/usuarios")
@RequiredArgsConstructor
public class UsuarioController {

    private final UsuarioService usuarioService;
    private final CloudinaryService cloudinaryService;

    public record CadastroRequest(String nomeUsuario, String email, String senha) {
    }

    public record AtualizarPerfilRequest(String nomeUsuario, String biografia) {
    }

    public record AlterarSenhaRequest(String senhaAtual, String novaSenha) {
    }

    public record PerfilPublicoResponse(Integer id, String nomeUsuario, String urlAvatar, String biografia) {
    }

    public record PerfilResponse(
            Integer id, String nomeUsuario, String email, String urlAvatar,
            String biografia, BigDecimal saldo) {
    }

    public record AvatarResponse(String urlAvatar) {
    }

    @PostMapping
    public ResponseEntity<PerfilResponse> cadastrar(@RequestBody CadastroRequest request) {
        Usuario usuario = usuarioService.cadastrar(Usuario.builder()
                .nomeUsuario(request.nomeUsuario())
                .email(request.email())
                .senha(request.senha())
                .build());
        return ResponseEntity.status(HttpStatus.CREATED).body(paraPerfilResponse(usuario));
    }

    @GetMapping("/{id}")
    public ResponseEntity<PerfilPublicoResponse> buscarPerfilPublico(@PathVariable Integer id) {
        Usuario usuario = usuarioService.buscarPorId(id);
        return ResponseEntity.ok(new PerfilPublicoResponse(
                usuario.getId(), usuario.getNomeUsuario(), usuario.getUrlAvatar(), usuario.getBiografia()));
    }

    @GetMapping("/me")
    public ResponseEntity<PerfilResponse> buscarMeuPerfil(@RequestParam Integer usuarioId) {
        return ResponseEntity.ok(paraPerfilResponse(usuarioService.buscarPorId(usuarioId)));
    }

    @PutMapping("/me")
    public ResponseEntity<PerfilResponse> atualizarPerfil(
            @RequestParam Integer usuarioId, @RequestBody AtualizarPerfilRequest request) {
        Usuario usuario = usuarioService.atualizarPerfil(usuarioId, request.nomeUsuario(), request.biografia());
        return ResponseEntity.ok(paraPerfilResponse(usuario));
    }

    @PatchMapping("/me/senha")
    public ResponseEntity<Void> alterarSenha(
            @RequestParam Integer usuarioId, @RequestBody AlterarSenhaRequest request) {
        usuarioService.alterarSenha(usuarioId, request.senhaAtual(), request.novaSenha());
        return ResponseEntity.noContent().build();
    }

    @PostMapping(value = "/me/avatar", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<AvatarResponse> enviarAvatar(
            @RequestParam Integer usuarioId, @RequestParam("arquivo") MultipartFile arquivo) {
        Usuario usuarioAtual = usuarioService.buscarPorId(usuarioId);
        if (usuarioAtual.getAvatarPublicId() != null) {
            cloudinaryService.remover(usuarioAtual.getAvatarPublicId());
        }

        CloudinaryService.ResultadoUpload resultado = cloudinaryService.upload(arquivo, "avatars/");
        Usuario usuario = usuarioService.atualizarAvatar(usuarioId, resultado.url(), resultado.publicId());
        return ResponseEntity.ok(new AvatarResponse(usuario.getUrlAvatar()));
    }

    @DeleteMapping("/me/avatar")
    public ResponseEntity<Void> removerAvatar(@RequestParam Integer usuarioId) {
        Usuario usuarioAtual = usuarioService.buscarPorId(usuarioId);
        cloudinaryService.remover(usuarioAtual.getAvatarPublicId());
        usuarioService.removerAvatar(usuarioId);
        return ResponseEntity.noContent().build();
    }

    private PerfilResponse paraPerfilResponse(Usuario usuario) {
        return new PerfilResponse(
                usuario.getId(), usuario.getNomeUsuario(), usuario.getEmail(), usuario.getUrlAvatar(),
                usuario.getBiografia(), usuario.getSaldo());
    }
}
