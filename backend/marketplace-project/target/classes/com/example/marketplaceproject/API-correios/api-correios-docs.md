# Frete & Entrega — Integração Melhor Envio

> Módulo para cálculo de frete e estimativa de prazo de entrega utilizando a API da [Melhor Envio](https://melhorenvio.com.br).

---

## 🚧 Status

**Feature planejada** — implementação prevista para as próximas sprints.

| Item | Status |
|------|--------|
| Especificação | ✅ Concluída |
| Integração com API | 🔜 Pendente |
| Infra | 🔜 Pendente |
| Deploy | 🔜 Pendente |

---

## 📋 Visão Geral

Este módulo será responsável por:

- **Calcular o frete** entre origem e destino via API da Melhor Envio
- **Estimar o prazo de entrega** de acordo com a transportadora e modalidade escolhida

---

## 🔐 Autenticação

A API utiliza **OAuth 2.0**. É necessário gerar um token de acesso no painel da Melhor Envio antes de realizar qualquer requisição.

```bash
# Headers obrigatórios em todas as requisições
Authorization: Bearer {seu_token_aqui}
User-Agent: NomeDaAplicacao (email@contato.com)
Accept: application/json
Content-Type: application/json
```

---

## Endpoint Previsto

### Calcular frete

```http
POST /correios/calculate
```

---

```json
{
  "from": {
    "postal_code": "01310100"
  },
  "to": {
    "postal_code": "20040020"
  },
  "products": [
    {
      "id": "produto-001",
      "width": 15,
      "height": 10,
      "length": 20,
      "weight": 0.5,
      "insurance_value": 50.00,
      "quantity": 1
    }
  ]
}
```

---

> ℹ️ Dimensões em **centímetros (cm)**, peso em **quilogramas (kg)** e valores monetários em **reais (R$)**.

---

**Resposta esperada (200):**

```json
[
  {
    "id": 1,
    "name": "PAC",
    "price": "18.50",
    "custom_price": "18.50",
    "delivery_time": 5,
    "custom_delivery_time": 5,
    "company": {
      "id": 1,
      "name": "Correios"
    }
  },
  {
    "id": 2,
    "name": "SEDEX",
    "price": "34.20",
    "custom_price": "34.20",
    "delivery_time": 2,
    "custom_delivery_time": 2,
    "company": {
      "id": 1,
      "name": "Correios"
    }
  }
]
```

---

## 🌐 Ambientes

| Ambiente    | Base URL |
|-------------|----------|
| Sandbox     | `https://sandbox.melhorenvio.com.br` |
| Produção    | `https://melhorenvio.com.br` |

> Por se tratar de um MVP, utilizaremos o ambiente sandbox, evitando cobranças reais, posteriormente migrar de ambiente para produção

---

## 🗂️ Referências

- [Melhor Envio — Documentação Oficial](https://docs.melhorenvio.com.br/docs/introducao-a-api)
- [Melhor Envio — Painel do Desenvolvedor](https://melhorenvio.com.br/painel/gerenciar/tokens)
- [OAuth 2.0 — RFC 6749](https://datatracker.ietf.org/doc/html/rfc6749)