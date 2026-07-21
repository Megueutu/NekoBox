package com.example.marketplaceproject.Entity.Enuns;

import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

@Converter(autoApply = true)
public class TipoFotoConverter implements AttributeConverter<TipoFoto, String> {

    @Override
    public String convertToDatabaseColumn(TipoFoto tipoFoto) {
        return tipoFoto == null ? null : tipoFoto.getValor();
    }

    @Override
    public TipoFoto convertToEntityAttribute(String valor) {
        return valor == null ? null : TipoFoto.deValor(valor);
    }
}
