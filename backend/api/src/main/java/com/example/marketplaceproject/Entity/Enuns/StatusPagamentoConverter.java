package com.example.marketplaceproject.Entity.Enuns;

import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

@Converter(autoApply = true)
public class StatusPagamentoConverter implements AttributeConverter<StatusPagamento, String> {

    @Override
    public String convertToDatabaseColumn(StatusPagamento status) {
        return status == null ? null : status.getValor();
    }

    @Override
    public StatusPagamento convertToEntityAttribute(String valor) {
        return valor == null ? null : StatusPagamento.deValor(valor);
    }
}
