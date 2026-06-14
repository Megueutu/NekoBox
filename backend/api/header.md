# Marketplace — Backend

> Backend desacoplado do frontend. Maior parte da lógica de negócio, validação e persistência se encontra aqui.

---

## Stack & Como Rodar

| Item | Valor |
|---|---|
| Java | 21 |
| Spring Boot | 3.0.6 |
| Porta | `8080` |
| Banco | PostgreSQL |

---

## Arquitetura

Controller  →  recebe a requisição HTTP e devolve a resposta
Service     →  lógica de negócio
Repository  →  comunicação com o banco (Spring Data JPA)
Entity      →  representação das tabelas do PostgreSQL

---

## Tabelas — PostgreSQL

```
USUARIOS
│
├── 1:N ── PRODUTOS
│             ├── 1:N ── FOTOS
│             ├── N:N ── CATEGORIAS
│             ├── 1:N ── PAGAMENTO
│             ├── N:N ── BIBLIOTECA_USUARIOS
│             ├── 1:N ── AVALIACOES
│             └── 0:N ── BUSCAS
│
├── 1:1 ── CARRINHO
│             └── 1:N ── CARRINHO_ITENS ── N:1 ── PRODUTOS
│
├── 1:N ── PAGAMENTO
├── 1:N ── AVALIACOES
├── N:N ── BIBLIOTECA_USUARIOS
└── 1:N ── BUSCAS
```

---

## Endpoints
><----------------------------------------------------------------------------------------
/rota?param={valor} | MÉTODO | http://localhost:8080/rota?param=exemplo

JSON REQUEST:
{
 
}
 
JSON RESPONSE:
{
 
}
><-------------------------------------------------------------------------------------------
