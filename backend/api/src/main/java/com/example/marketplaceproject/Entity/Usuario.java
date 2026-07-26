package com.example.marketplaceproject.Entity;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import com.example.marketplaceproject.Entity.Enuns.PapelUsuario;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "usuarios")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Usuario {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "nome_usuario", nullable = false, length = 50, unique = true)
    private String nomeUsuario;

    @Column(nullable = false, length = 255, unique = true)
    private String email;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String senha;

    @Column(name = "url_avatar", columnDefinition = "TEXT")
    private String urlAvatar;

    @Column(name = "avatar_public_id", columnDefinition = "TEXT")
    private String avatarPublicId;

    @Column(columnDefinition = "TEXT")
    private String biografia;

    @Builder.Default
    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal saldo = BigDecimal.ZERO;

    @Builder.Default
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private PapelUsuario papel = PapelUsuario.USER;

    @CreationTimestamp
    @Column(name = "criado_em", nullable = false, updatable = false)
    private LocalDateTime criadoEm;

    @UpdateTimestamp
    @Column(name = "atualizado_em", nullable = false)
    private LocalDateTime atualizadoEm;

}
