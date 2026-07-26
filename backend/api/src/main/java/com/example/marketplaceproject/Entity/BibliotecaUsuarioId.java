package com.example.marketplaceproject.Entity;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.io.Serializable;
// classe para chave composta
@Embeddable
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EqualsAndHashCode
public class BibliotecaUsuarioId implements Serializable {

    @Column(name = "usuario_id")
    private Integer usuarioId;

    @Column(name = "produto_id")
    private Integer produtoId;
}
