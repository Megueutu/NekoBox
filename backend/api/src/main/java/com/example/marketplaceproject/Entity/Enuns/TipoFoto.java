package com.example.marketplaceproject.Entity.Enuns;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

import java.util.Arrays;

public enum TipoFoto {
    BANNER("banner", false),
    COVER("cover", false),
    SCREENSHOT("screenshot", true);

    private final String valor;
    private final boolean permiteMultiplas;

    TipoFoto(String valor, boolean permiteMultiplas) {
        this.valor = valor;
        this.permiteMultiplas = permiteMultiplas;
    }

    @JsonValue
    public String getValor() {
        return valor;
    }

    public boolean permiteMultiplas() {
        return permiteMultiplas;
    }

    @JsonCreator
    public static TipoFoto deValor(String valor) {
        return Arrays.stream(values())
                .filter(tipo -> tipo.valor.equalsIgnoreCase(valor))
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException("Tipo de foto invalido: " + valor));
    }
}
