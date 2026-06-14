package com.example.marketplaceproject.Entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;

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

    @Column(columnDefinition = "TEXT")
    private String biografia;

    @Builder.Default
    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal saldo = BigDecimal.ZERO;
}
