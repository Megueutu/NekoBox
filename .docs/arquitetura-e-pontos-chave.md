# Arquitetura e pontos-chave

## Visão geral

```text
Navegador
  └── SPA JavaScript vanilla + Vite
       ├── Router próprio
       ├── Pages e componentes
       ├── Store observável
       └── Services HTTP
              │
              ▼
       API REST Spring Boot
       ├── Controllers
       ├── Services
       ├── Repositories JPA
       └── tratamento central de erros
              │
              ▼
          PostgreSQL
```

O frontend é deliberadamente JavaScript vanilla, conforme exigido. O Vite cuida do desenvolvimento e do build, mas não substitui a manipulação de DOM feita pelo grupo.

## Frontend

- entrada: [`main.js`](../frontend/src/main.js);
- rotas: [`routes.js`](../frontend/src/app/router/routes.js);
- renderização e estados globais: [`router.js`](../frontend/src/app/router/router.js);
- catálogo: [`HubPage.js`](../frontend/src/pages/hub/HubPage.js);
- detalhes: [`GamePage.js`](../frontend/src/pages/game/GamePage.js);
- carrinho: [`CartPage.js`](../frontend/src/pages/cart/CartPage.js);
- autenticação: [`LoginPage.js`](../frontend/src/pages/auth/LoginPage.js);
- administração: [`AdminPage.js`](../frontend/src/pages/admin/AdminPage.js);
- acesso à API: [`api.client.js`](../frontend/src/services/api/api.client.js);
- estado: [`store.js`](../frontend/src/store/store.js) e [`actions.js`](../frontend/src/store/actions.js);
- estilos: [`frontend/src/styles`](../frontend/src/styles).

Decisão importante: as páginas retornam strings HTML e registram eventos em `afterRender`. Isso é simples e compatível com o enunciado, mas exige sanitização rigorosa sempre que dados externos entram em templates.

## Backend

- stack: Java 21, Spring Boot, Spring MVC, Spring Data JPA;
- controllers HTTP: [`Controller`](../backend/api/src/main/java/com/example/marketplaceproject/Controller);
- regras de negócio: [`Service`](../backend/api/src/main/java/com/example/marketplaceproject/Service);
- persistência: [`Repository`](../backend/api/src/main/java/com/example/marketplaceproject/Repository);
- entidades: [`Entity`](../backend/api/src/main/java/com/example/marketplaceproject/Entity);
- erros HTTP: [`GlobalExceptionHandler.java`](../backend/api/src/main/java/com/example/marketplaceproject/Exception/GlobalExceptionHandler.java).

## Banco e persistência

O PostgreSQL armazena usuários, sessões, produtos, categorias, fotos, carrinho, pagamentos, biblioteca, wishlist, avaliações e gift cards.

O ambiente reproduzível está em:

- [`compose.yaml`](../compose.yaml);
- [`infra/database/postgres/Dockerfile`](../infra/database/postgres/Dockerfile);
- [`script_bd.sql`](../infra/database/postgres/script_bd.sql).

O carrinho pertence ao usuário autenticado e persiste no banco. Entretanto, `CarrinhoItem` representa apenas a relação carrinho-produto; não existe campo `quantidade`.

## Fluxos para explicar na arguição

### Catálogo

`HubPage` chama `GamesService`, que usa `ApiClient` para consultar a API. A resposta é normalizada e renderizada dinamicamente. Busca e categoria filtram a coleção já carregada, sem nova requisição a cada tecla.

### Autenticação

O backend gera token aleatório, persiste somente seu hash e define expiração de 12 horas. O frontend guarda o token para autenticar chamadas posteriores. Rotas privadas redirecionam usuários sem sessão.

### Carrinho e checkout

Adicionar ao carrinho cria uma relação persistente entre carrinho e produto. O checkout valida saldo e itens, registra pagamentos, move produtos para a biblioteca e limpa o carrinho.

Limitação para a entrega: falta quantidade e a interface não coleta dados por formulário antes do checkout.

### Administração

Usuários administradores gerenciam contas, produtos, mídias e gift cards. O frontend fornece pré-visualização de produto, e o backend valida papel e regras de domínio.

## Trade-offs

- JavaScript vanilla mantém o escopo alinhado à disciplina, mas exige disciplina manual de ciclo de vida e escape.
- Store próprio reduz dependências, mas persiste o estado sem schema versionado.
- Sessão em `localStorage` é simples para MVP, porém menos resistente a XSS do que cookie `HttpOnly`.
- Docker Compose melhora a reprodutibilidade, mas não substitui hospedagem pública.
