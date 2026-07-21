package com.example.marketplaceproject.Entity;

// CLASSE SÓ PRA CHAVE COMPOSTA DE PRODUTO_CATEGORIA

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.io.Serializable;

@Embeddable
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EqualsAndHashCode
public class ProdutoCategoriaId implements Serializable {

    @Column(name = "produto_id")
    private Integer produtoId;

    @Column(name = "categoria_id")
    private Integer categoriaId;
}
