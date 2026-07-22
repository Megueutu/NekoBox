package com.example.marketplaceproject.Entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "produtos")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Produto {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "usuario_id", nullable = false)
    private Usuario usuario;

    @Column(nullable = false, length = 255)
    private String titulo;

    @Column(name = "descricao_curta", columnDefinition = "TEXT")
    private String descricaoCurta;

    @Column(name = "descricao_longa", columnDefinition = "TEXT")
    private String descricaoLonga;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal preco;

    @Column(nullable = false, length = 255, unique = true)
    private String slug;

    @Column(name = "data_lancamento")
    private LocalDate dataLancamento;

    @Builder.Default
    @Column(nullable = false, length = 20)
    private String status = "draft";

    @Column(name = "tags_json", nullable = false, columnDefinition = "TEXT")
    @Builder.Default
    private String tagsJson = "[]";

    @Column(name = "requisitos_json", nullable = false, columnDefinition = "TEXT")
    @Builder.Default
    private String requisitosJson = "[]";

    @Column(name = "idiomas_json", nullable = false, columnDefinition = "TEXT")
    @Builder.Default
    private String idiomasJson = "[]";

    @Column(name = "atualizacoes_json", nullable = false, columnDefinition = "TEXT")
    @Builder.Default
    private String atualizacoesJson = "[]";
}
