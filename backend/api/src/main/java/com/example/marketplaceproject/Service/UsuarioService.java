package com.example.marketplaceproject.Service;

import java.math.BigDecimal;
import java.util.regex.Pattern;
import java.text.Normalizer;
import java.util.Locale;
import java.util.UUID;
import java.net.URI;
import java.util.Set;

import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.example.marketplaceproject.Entity.Usuario;
import com.example.marketplaceproject.Exception.CampoInvalidoException;
import com.example.marketplaceproject.Exception.ConflitoDeDadosException;
import com.example.marketplaceproject.Exception.CredenciaisInvalidasException;
import com.example.marketplaceproject.Exception.RecursoNaoEncontradoException;
import com.example.marketplaceproject.Repository.UsuarioRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class UsuarioService {

    private static final Pattern NOME_USUARIO_PATTERN =
            Pattern.compile("^[a-zA-Z0-9_]{3,50}$");

    private static final Pattern EMAIL_PATTERN =
            Pattern.compile("^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$");

    private static final Pattern SENHA_PATTERN =
            Pattern.compile("^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$");

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;

    public Usuario cadastrar(Usuario usuario) {
        if (usuario == null) {
            throw new CampoInvalidoException("Os dados do usuario devem ser informados.");
        }
        if (usuario.getEmail() == null || !EMAIL_PATTERN.matcher(usuario.getEmail().trim()).matches()) {
            throw new CampoInvalidoException("Formato de email invalido.");
        }
        if (usuario.getNomeUsuario() == null
                || !NOME_USUARIO_PATTERN.matcher(usuario.getNomeUsuario().trim()).matches()) {
            throw new CampoInvalidoException("Nome de usuario invalido. Use de 3 a 50 caracteres alfanumericos.");
        }
        if (usuario.getSenha() == null || !SENHA_PATTERN.matcher(usuario.getSenha().trim()).matches()) {
            throw new CampoInvalidoException(
                    "A senha deve ter no minimo 8 caracteres, com maiuscula, minuscula, numero e simbolo.");
        }

        usuario.setId(null);
        usuario.setEmail(usuario.getEmail().trim());
        usuario.setNomeUsuario(usuario.getNomeUsuario().trim());
        usuario.setSenha(passwordEncoder.encode(usuario.getSenha().trim()));
        usuario.setUrlAvatar(null);
        usuario.setAvatarPublicId(null);
        usuario.setBiografia(null);
        usuario.setSaldo(new BigDecimal("1000.00"));

        try {
            return usuarioRepository.saveAndFlush(usuario);
        } catch (DataIntegrityViolationException exception) {
            throw new ConflitoDeDadosException("Ja existe um usuario com este email ou nome de usuario.");
        }
    }

    public Usuario autenticar(String email, String senha) {
        if (email == null || email.isBlank() || senha == null || senha.isBlank()) {
            throw new CredenciaisInvalidasException("Email e senha sao obrigatorios.");
        }

        Usuario usuario = usuarioRepository.findByEmailIgnoreCase(email.trim())
                .orElseThrow(() -> new CredenciaisInvalidasException("Email ou senha invalidos."));

        if (!passwordEncoder.matches(senha, usuario.getSenha())) {
            throw new CredenciaisInvalidasException("Email ou senha invalidos.");
        }
        return usuario;
    }

    public Usuario autenticarExterno(String email, String nome, String avatarUrl) {
        return usuarioRepository.findByEmailIgnoreCase(email).orElseGet(() -> {
            String base = Normalizer.normalize(nome == null || nome.isBlank() ? email.split("@")[0] : nome,
                            Normalizer.Form.NFD)
                    .replaceAll("\\p{M}", "")
                    .toLowerCase(Locale.ROOT)
                    .replaceAll("[^a-z0-9_]", "_")
                    .replaceAll("_+", "_");
            if (base.length() < 3) base = "player";
            if (base.length() > 42) base = base.substring(0, 42);
            String username = base;
            int suffix = 2;
            while (usuarioRepository.findByNomeUsuarioIgnoreCase(username).isPresent()) {
                username = base + "_" + suffix++;
            }
            Usuario usuario = cadastrar(Usuario.builder()
                    .nomeUsuario(username)
                    .email(email)
                    .senha("Aa1!" + UUID.randomUUID().toString().replace("-", ""))
                    .build());
            usuario.setUrlAvatar(avatarUrl == null || avatarUrl.isBlank() ? null : avatarUrl);
            return usuarioRepository.saveAndFlush(usuario);
        });
    }

    public Usuario buscarPorId(Integer usuarioId) {
        if (usuarioId == null || usuarioId <= 0) {
            throw new CampoInvalidoException("O identificador informado deve ser valido.");
        }
        return usuarioRepository.findById(usuarioId)
                .orElseThrow(() -> new RecursoNaoEncontradoException(
                        "Usuario nao encontrado para o identificador informado."));
    }

    public Usuario buscarPorIdParaAtualizacao(Integer usuarioId) {
        if (usuarioId == null || usuarioId <= 0) {
            throw new CampoInvalidoException("O identificador informado deve ser valido.");
        }
        return usuarioRepository.findWithLockById(usuarioId)
                .orElseThrow(() -> new RecursoNaoEncontradoException(
                        "Usuario nao encontrado para o identificador informado."));
    }

    public Usuario atualizarPerfil(Integer usuarioId, String nomeUsuario, String biografia, String avatarUrl) {
        Usuario usuario = buscarPorId(usuarioId);

        if (nomeUsuario == null || !NOME_USUARIO_PATTERN.matcher(nomeUsuario.trim()).matches()) {
            throw new CampoInvalidoException("Nome de usuario invalido. Use de 3 a 50 caracteres alfanumericos.");
        }
        usuario.setNomeUsuario(nomeUsuario.trim());
        usuario.setBiografia(biografia == null || biografia.isBlank() ? null : biografia.trim());
        usuario.setUrlAvatar(validarAvatarUrl(avatarUrl));
        usuario.setAvatarPublicId(null);

        try {
            return usuarioRepository.saveAndFlush(usuario);
        } catch (DataIntegrityViolationException exception) {
            throw new ConflitoDeDadosException("Ja existe um usuario com este nome de usuario.");
        }
    }

    private String validarAvatarUrl(String avatarUrl) {
        if (avatarUrl == null || avatarUrl.isBlank()) return null;
        try {
            URI uri = URI.create(avatarUrl.trim());
            if (!Set.of("http", "https").contains(uri.getScheme()) || uri.getHost() == null) {
                throw new CampoInvalidoException("A URL do avatar deve usar HTTP ou HTTPS.");
            }
            return uri.toString();
        } catch (IllegalArgumentException exception) {
            throw new CampoInvalidoException("A URL do avatar e invalida.");
        }
    }

    public void alterarSenha(Integer usuarioId, String senhaAtual, String novaSenha) {
        Usuario usuario = buscarPorId(usuarioId);

        if (senhaAtual == null || !passwordEncoder.matches(senhaAtual, usuario.getSenha())) {
            throw new CredenciaisInvalidasException("Senha atual incorreta.");
        }
        if (novaSenha == null || !SENHA_PATTERN.matcher(novaSenha.trim()).matches()) {
            throw new CampoInvalidoException(
                    "A nova senha deve ter no minimo 8 caracteres, com maiuscula, minuscula, numero e simbolo.");
        }

        usuario.setSenha(passwordEncoder.encode(novaSenha.trim()));
        usuarioRepository.saveAndFlush(usuario);
    }

    public Usuario atualizarAvatar(Integer usuarioId, String url, String publicId) {
        Usuario usuario = buscarPorId(usuarioId);
        usuario.setUrlAvatar(url);
        usuario.setAvatarPublicId(publicId);
        return usuarioRepository.saveAndFlush(usuario);
    }

    public Usuario removerAvatar(Integer usuarioId) {
        Usuario usuario = buscarPorId(usuarioId);
        usuario.setUrlAvatar(null);
        usuario.setAvatarPublicId(null);
        return usuarioRepository.saveAndFlush(usuario);
    }

    public Usuario salvar(Usuario usuario) {
        return usuarioRepository.saveAndFlush(usuario);
    }
}
