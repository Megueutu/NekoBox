# API — Marketplace Project (backend/api)

> Catálogo de todos os endpoints REST: parâmetros aceitos e resposta esperada. Complementa o [SDD.md](SDD.md) (que cobre decisões de arquitetura). Gerado e validado contra a instância local em `http://localhost:8080` — ver seção final "Bateria de testes" para as evidências reais de cada chamada.

Última atualização: 2026-07-20

## Convenções gerais

- **Content-Type**: `application/json` para corpo de requisição, exceto upload de arquivo (`multipart/form-data`).
- **Erros**: todo erro (400/401/403/404/409/402/500) retorna o mesmo formato:
  ```json
  {
    "timestamp": "2026-07-20T17:16:27.96",
    "status": 401,
    "erro": "Unauthorized",
    "mensagem": "Email ou senha invalidos.",
    "caminho": "/api/auth/login"
  }
  ```
- **Datas**: ISO-8601 (`LocalDateTime`, sem timezone).
- **Dinheiro**: `BigDecimal` serializado como número JSON com 2 casas (ex: `44.90`).

---

## 1. Auth

### `POST /api/auth/login`
Verifica email+senha (bcrypt) e devolve os dados do usuário. **Não retorna token.**

Body:
```json
{ "email": "vendedor.sdd@example.com", "senha": "Senha123!" }
```
Resposta `200`:
```json
{ "usuarioId": 1, "nomeUsuario": "vendedorSdd", "email": "vendedor.sdd@example.com" }
```
Erros: `401` credenciais inválidas.

---

## 2. Usuários (`/api/usuarios`)

### `POST /api/usuarios` — cadastro
Body:
```json
{ "nomeUsuario": "vendedorSdd", "email": "vendedor.sdd@example.com", "senha": "Senha123!" }
```
Regras: `nomeUsuario` 3-50 alfanumérico/`_`; `senha` mín. 8 caracteres com maiúscula, minúscula, número e símbolo (`@$!%*?&`); `email` formato válido.

Resposta `201`:
```json
{ "id": 1, "nomeUsuario": "vendedorSdd", "email": "vendedor.sdd@example.com", "urlAvatar": null, "biografia": null, "saldo": 0.00 }
```
Erros: `400` campo inválido · `409` email/nomeUsuario já existe.

### `GET /api/usuarios/{id}` — perfil público
Sem parâmetros além do path. Resposta `200`:
```json
{ "id": 1, "nomeUsuario": "vendedorSdd", "urlAvatar": null, "biografia": null }
```
Erros: `404`.

### `GET /api/usuarios/me?usuarioId=`
Resposta `200` (perfil completo, com email e saldo):
```json
{ "id": 1, "nomeUsuario": "vendedorSdd", "email": "vendedor.sdd@example.com", "urlAvatar": null, "biografia": null, "saldo": 0.00 }
```

### `PUT /api/usuarios/me?usuarioId=`
Body: `{ "nomeUsuario": "vendedorSdd", "biografia": "Vendo jogos indie." }`
Resposta `200`: mesmo formato de `PerfilResponse` acima, com os novos valores.

### `PATCH /api/usuarios/me/senha?usuarioId=`
Body: `{ "senhaAtual": "Senha123!", "novaSenha": "NovaSenha123!" }`
Resposta `204` (sem corpo). Erros: `401` senha atual incorreta · `400` nova senha fora do padrão.

### `POST /api/usuarios/me/avatar?usuarioId=` (multipart)
Form-data: campo `arquivo` (o arquivo de imagem). Se já existir avatar, o antigo é apagado do Cloudinary antes do upload novo.
Resposta `200`:
```json
{ "urlAvatar": "https://res.cloudinary.com/dhoywdbnh/image/upload/v.../avatars/xxx.png" }
```

### `DELETE /api/usuarios/me/avatar?usuarioId=`
Apaga do Cloudinary e limpa `urlAvatar`/`avatarPublicId`. Resposta `204`.

---

## 3. Produtos (`/api/produtos`)

### `GET /api/produtos` — listagem paginada
Query params (todos opcionais): `titulo`, `categoriaId`, `precoMinimo`, `precoMaximo`, `page`, `size`, `sort`.
Resposta `200` (`Page<ProdutoResumoResponse>` do Spring Data — inclui metadados de paginação):
```json
{
  "content": [
    { "id": 1, "titulo": "Aventuras na Ilha", "descricaoCurta": "Um jogo de aventura.", "preco": 39.90,
      "vendedor": { "id": 1, "nomeUsuario": "vendedorSdd" } }
  ],
  "totalElements": 1, "totalPages": 1, "number": 0, "size": 20, "first": true, "last": true, "empty": false, ...
}
```

### `GET /api/produtos/{id}` — detalhe
Resposta `200` (`ProdutoDetalheResponse`, com fotos agrupadas por tipo, categorias e nota média):
```json
{
  "id": 1, "titulo": "Aventuras na Ilha", "descricaoCurta": "...", "descricaoLonga": "...", "preco": 39.90,
  "vendedor": { "id": 1, "nomeUsuario": "vendedorSdd" },
  "fotos": { "banner": null, "poster": null, "demo": [] },
  "categorias": [{ "id": 1, "nome": "Aventura" }],
  "notaMedia": 4.5
}
```
Erros: `404`.

### `POST /api/produtos?usuarioId=` — criar (usuarioId vira o vendedor)
Body:
```json
{ "titulo": "Aventuras na Ilha", "descricaoCurta": "...", "descricaoLonga": "...", "preco": 39.90, "categoriaIds": [1] }
```
Resposta `201`: `ProdutoDetalheResponse` (formato acima). Erros: `400` título/preço inválido · `404` categoriaId ou usuarioId inexistente.

### `PUT /api/produtos/{id}?usuarioId=` — editar (só dono)
Mesmo body de criar. Resposta `200`: `ProdutoDetalheResponse`. Erros: `403` não é dono · `404`.

### `DELETE /api/produtos/{id}?usuarioId=` — remover (só dono)
Resposta `204`. Erros: `403` não é dono · `409` produto tem pagamento ou está em alguma biblioteca (não pode ser excluído).

### `POST /api/produtos/{id}/categorias/{categoriaId}?usuarioId=` — vincular (só dono do produto)
Sem body. Resposta `201` sem corpo. Erros: `403` · `404` · `409` já vinculado.

### `DELETE /api/produtos/{id}/categorias/{categoriaId}?usuarioId=` — desvincular (só dono do produto)
Resposta `204`. Erros: `403` · `404` vínculo não existe.

---

## 4. Fotos (`/api/produtos/{produtoId}/fotos`)

### `POST /api/produtos/{produtoId}/fotos?usuarioId=` (multipart, só dono do produto)
Form-data: `arquivo` (imagem) + `tipo` (`banner` | `poster` | `demo` — **não** `capa`/`screenshot`, ver SDD seção 4). `banner`/`poster` aceitam só 1 foto por produto; `demo` aceita várias.
Resposta `201`:
```json
{ "id": 1, "url": "https://res.cloudinary.com/dhoywdbnh/image/upload/v.../produtos/1/xxx.png", "tipo": "banner" }
```
Erros: `403` · `404` · `409` já existe foto desse tipo (para banner/poster).

### `DELETE /api/produtos/{produtoId}/fotos/{fotoId}?usuarioId=` (só dono do produto)
Apaga do Cloudinary e do banco. Resposta `204`. Erros: `403` · `404` (foto não é desse produto ou não existe).

---

## 5. Categorias (`/api/categorias`)

Sem restrição de dono/admin — qualquer chamada pode criar/excluir (ver SDD seção 5, item 6).

### `GET /api/categorias`
Resposta `200`: `[{ "id": 1, "nome": "Aventura" }]`

### `POST /api/categorias`
Body: `{ "nome": "Aventura" }`. Resposta `201`: `{ "id": 1, "nome": "Aventura" }`. Erros: `400` nome vazio/> 100 chars · `409` nome duplicado.

### `DELETE /api/categorias/{id}`
Desvincula de todos os produtos e apaga. Resposta `204`. Erros: `404`.

---

## 6. Carrinho (`/api/carrinho`)

### `GET /api/carrinho?usuarioId=`
Cria o carrinho do usuário se ainda não existir. Resposta `200`:
```json
{ "id": 1, "itens": [{ "produtoId": 1, "titulo": "Aventuras na Ilha", "preco": 44.90 }], "total": 44.90 }
```

### `POST /api/carrinho/itens?usuarioId=`
Body: `{ "produtoId": 1 }`. Resposta `201`: `CarrinhoResponse` (formato acima, já com o item novo).
Erros: `400` vendedor tentando comprar o próprio produto · `404` produto não existe · `409` produto já no carrinho ou já na biblioteca do usuário.

### `DELETE /api/carrinho/itens/{produtoId}?usuarioId=`
Resposta `204`. Erros: `404` item não está no carrinho.

### `DELETE /api/carrinho?usuarioId=` — esvaziar
Resposta `204` (idempotente — funciona mesmo com carrinho já vazio).

---

## 7. Pagamento (`/api/pagamentos`)

### `POST /api/pagamentos/checkout?usuarioId=`
Processa **todo o carrinho do usuário** numa transação tudo-ou-nada: se o saldo cobre o total, aprova todos os itens (debita comprador, credita cada vendedor, cria um `Pagamento` por item, insere na biblioteca, esvazia o carrinho); senão, nada é criado. Sem body.
Resposta `201`:
```json
[{ "id": 1, "produtoId": 2, "tituloProduto": "Demo Gratuita", "valorPago": 0.00, "status": "aprovado" }]
```
Erros: `400` carrinho vazio · `402` saldo insuficiente (nada é criado) · `409` algum item já está na biblioteca/tem pagamento pendente.

### `GET /api/pagamentos?usuarioId=`
Resposta `200`: array no mesmo formato do item de checkout, todo o histórico do usuário.

### `GET /api/pagamentos/{id}?usuarioId=`
Resposta `200`: um `PagamentoResponse`. Erros: `403` pagamento não é desse usuário · `404`.

---

## 8. Biblioteca (`/api/biblioteca`)

### `GET /api/biblioteca?usuarioId=`
Resposta `200`:
```json
[{ "produtoId": 2, "titulo": "Demo Gratuita", "tempoJogoMinutos": 90, "adicionadoEm": "2026-07-20T17:17:49.744519" }]
```

### `PATCH /api/biblioteca/{produtoId}/tempo-jogo?usuarioId=`
**Incrementa** (não sobrescreve) o tempo jogado. Body: `{ "minutos": 90 }` (deve ser > 0).
Resposta `200`: item da biblioteca com `tempoJogoMinutos` já somado. Erros: `400` minutos <= 0 · `404` produto não está na biblioteca do usuário.

---

## 9. Avaliações

### `GET /api/produtos/{produtoId}/avaliacoes`
Resposta `200`:
```json
[{ "id": 1, "usuarioId": 2, "nomeUsuario": "compradorSdd", "nota": 4.0, "recomenda": true,
   "textoAvaliacao": "Gostei bastante, recomendo.", "criadoEm": "2026-07-20T17:18:14.828165" }]
```
⚠️ **Nota é truncada para inteiro.** A coluna `avaliacoes.nota` no banco é `SMALLINT`, mas o tipo usado no código/JSON é `double`. Enviar `4.5` é aceito (passa na validação `1 <= nota <= 5`) mas é persistido como `4`. Ver "Bugs encontrados" no fim deste documento.

### `POST /api/produtos/{produtoId}/avaliacoes?usuarioId=`
Body: `{ "nota": 4.5, "recomenda": true, "textoAvaliacao": "Gostei bastante, recomendo." }`
Só funciona se o produto estiver na biblioteca do `usuarioId`. Resposta `201`: item no formato acima.
Erros: `400` nota fora de 1-5 ou `recomenda` nulo · `400` produto não está na biblioteca do usuário · `404` · `409` usuário já avaliou este produto.

### `PUT /api/avaliacoes/{id}?usuarioId=` (só autor)
Mesmo body do POST. Resposta `200`. Erros: `403` não é o autor · `404`.

### `DELETE /api/avaliacoes/{id}?usuarioId=` (só autor)
Resposta `204`. Erros: `403` · `404`.

---

## Bateria de testes — execução real em `localhost:8080`

Todos os 33 endpoints abaixo foram acionados pelo menos uma vez contra a instância local rodando na porta 8080 (Postgres/Cloudinary reais, credenciais via `.env`). ✅ = respondeu com o status esperado.

| # | Endpoint | Cenário | Status |
|---|---|---|---|
| 1 | POST /api/usuarios | cadastro vendedor | ✅ 201 |
| 2 | POST /api/usuarios | cadastro comprador | ✅ 201 |
| 3 | POST /api/auth/login | credenciais corretas | ✅ 200 |
| 3b | POST /api/auth/login | senha errada | ✅ 401 |
| 4 | GET /api/usuarios/{id} | perfil público | ✅ 200 |
| 5 | GET /api/usuarios/me | — | ✅ 200 |
| 6 | PUT /api/usuarios/me | atualizar bio | ✅ 200 |
| 7 | PATCH /api/usuarios/me/senha | trocar senha | ✅ 204 |
| 8 | POST /api/usuarios/me/avatar | upload real no Cloudinary | ✅ 200 |
| 9 | DELETE /api/usuarios/me/avatar | remove do Cloudinary | ✅ 204 |
| 10 | POST /api/categorias | criar "Aventura" | ✅ 201 |
| 11 | GET /api/categorias | listar | ✅ 200 |
| 12 | POST /api/produtos | criar produto pago (R$ 39,90) | ✅ 201 |
| 12b | POST /api/produtos | criar produto grátis (R$ 0,00, p/ testar checkout sem saldo) | ✅ 201 |
| 13 | GET /api/produtos | listar com filtro `titulo` | ✅ 200 |
| 14 | GET /api/produtos/{id} | detalhe | ✅ 200 |
| 15 | PUT /api/produtos/{id} | editar título/preço | ✅ 200 |
| 16 | POST /api/produtos/{id}/categorias/{catId} | vincular | ✅ 201 |
| 17 | POST /api/produtos/{id}/fotos | upload real no Cloudinary | ✅ 201 |
| 18 | DELETE /api/produtos/{id}/fotos/{fotoId} | remove do Cloudinary | ✅ 204 |
| 19 | DELETE /api/produtos/{id}/categorias/{catId} | desvincular | ✅ 204 |
| 20 | POST /api/carrinho/itens | adicionar produto pago | ✅ 201 |
| 21 | GET /api/carrinho | ver carrinho | ✅ 200 |
| 22 | DELETE /api/carrinho/itens/{produtoId} | remover item | ✅ 204 |
| 23 | POST /api/pagamentos/checkout | comprar produto grátis (fluxo completo) | ✅ 201 |
| 24 | GET /api/pagamentos | histórico | ✅ 200 |
| 25 | GET /api/pagamentos/{id} | detalhe | ✅ 200 |
| 26 | GET /api/biblioteca | listar (produto grátis apareceu após checkout) | ✅ 200 |
| 27 | PATCH /api/biblioteca/{produtoId}/tempo-jogo | incrementar 90 min | ✅ 200 |
| 28 | DELETE /api/carrinho | esvaziar (já vazio, idempotente) | ✅ 204 |
| 29 | POST /api/produtos/{id}/avaliacoes | avaliar produto possuído | ✅ 201 |
| 30 | GET /api/produtos/{id}/avaliacoes | listar | ✅ 200 |
| 31 | PUT /api/avaliacoes/{id} | editar nota/texto | ✅ 200 |
| 32 | DELETE /api/avaliacoes/{id} | excluir | ✅ 204 |
| 33 | DELETE /api/produtos/{id} | produto sem vínculo → sucesso | ✅ 204 |
| 33b | DELETE /api/produtos/{id} | produto com pagamento/biblioteca → conflito | ✅ 409 (esperado) |
| 34 | DELETE /api/categorias/{id} | excluir | ✅ 204 |

Dados residuais no banco após o teste (não foram limpos, ficam como massa de dados de exemplo): usuários `vendedorSdd` (id 1) e `compradorSdd` (id 2); produto "Demo Gratuita" (id 2, comprado por `compradorSdd`, 90 min jogados); pagamento id 1 aprovado.

### Bug encontrado durante a bateria (corrigido)
`GET /api/produtos` (e qualquer filtro por `titulo`) devolvia **500** sempre que o parâmetro `titulo` era omitido. Causa: o driver JDBC do Postgres não conseguia inferir o tipo do parâmetro `null` dentro de `LOWER(CONCAT('%', ?, '%'))` e assumia `bytea`, e `lower(bytea)` não existe no Postgres. Corrigido em `ProdutoRepository.buscar(...)` adicionando `CAST(:titulo AS string)` na query JPQL. Recompilado e revalidado (linha 13 da tabela acima já reflete o fix).

### Bug encontrado, não corrigido (fora do escopo desta rodada)
`avaliacoes.nota` é `SMALLINT` no banco mas `double` no código — valores com casas decimais (ex: `4.5`) são truncados silenciosamente para inteiro ao salvar. Ver seção 9 acima. Se notas fracionárias importam para o produto, a correção é trocar a coluna para `NUMERIC` (ex: `NUMERIC(2,1)`) ou restringir a validação da API a valores inteiros para bater com o schema atual.
