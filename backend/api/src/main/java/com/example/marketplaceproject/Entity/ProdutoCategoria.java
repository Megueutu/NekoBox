package com.example.marketplaceproject.Entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "produtos_categorias")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProdutoCategoria {
    // chave composta
    @EmbeddedId
    private ProdutoCategoriaId id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @MapsId("produtoId")
    @JoinColumn(name = "produto_id", nullable = false)
    private Produto produto;
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @MapsId("categoriaId")
    @JoinColumn(name = "categoria_id", nullable = false)
    private Categoria categoria;
}
