package com.example.marketplaceproject.Entity.Enuns;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

import java.util.Arrays;

public enum StatusPagamento {
    PENDENTE("pendente"),
    APROVADO("aprovado"),
    CANCELADO("cancelado");

    private final String valor;

    StatusPagamento(String valor) {
        this.valor = valor;
    }

    @JsonValue
    public String getValor() {
        return valor;
    }

    @JsonCreator
    public static StatusPagamento deValor(String valor) {
        return Arrays.stream(values())
                .filter(status -> status.valor.equalsIgnoreCase(valor))
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException("Status de pagamento invalido: " + valor));
    }
}
