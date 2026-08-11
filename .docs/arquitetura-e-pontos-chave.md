# Arquitetura e pontos-chave

## Visão geral

```text
Navegador → SPA JavaScript (Vite) → API REST Spring Boot → PostgreSQL
                                            │
                                            └─→ Cloudinary (mídias, opcional)
Navegador → GameBot (widget) → Serviço Python (FastAPI) → Google AI (Gemini)
```

Três serviços independentes, cada um com seu próprio `Dockerfile`, orquestrados por `docker-compose.yml` na raiz:

| Serviço | Pasta | Tecnologia | Porta padrão |
| --- | --- | --- | --- |
| Frontend | `frontend/` | Vite + JavaScript vanilla (ES Modules) + Tailwind CSS | 5173 |
| API | `backend/api/` | Java 21, Spring Boot 3, Spring MVC, Spring Data JPA | 8080 |
| GameBot | `backend/python/` | FastAPI + Google AI (Gemini) | 8000 |
| Banco | `infra/database/postgres/` | PostgreSQL 16 | 5433 (host) |

## Frontend

SPA sem framework, com roteador próprio (`src/app/router/router.js`, `match-route.js`, `navigate.js`, `routes.js`). Cada rota carrega sua página via import dinâmico (`export default` + `afterRender`), o que mantém o bundle inicial pequeno.

- **Store observável** (`src/store/store.js`, `create-store.js`): estado central (`user`, `cart`, `wishlist`, `library`) persistido em `localStorage` enquanto há sessão ativa.
- **Actions** (`src/store/actions.js`): única camada que muta o Store; encapsula chamadas aos serviços HTTP e evita que páginas manipulem estado diretamente.
- **Services** (`src/services/`): um arquivo por domínio (`account.service.js`, `auth.service.js`, `games/games.service.js`, etc.) sobre um `ApiClient` comum (`api.client.js`) que injeta o `Authorization: Bearer` e trata erros HTTP de forma padronizada.
- **Mock API** (`src/mocks/api.mock.js`): réplica em memória/`localStorage` da API, ativada apenas em `vite dev` com `VITE_USE_MOCK_API=true`. **Não é usada em produção** — o `Dockerfile` do frontend roda `vite build` em modo `production`, então o build publicado sempre fala com a API Java real.
- **Componentes de UI** (`src/components/ui/`): funções puras que retornam HTML (sem virtual DOM), com um wrapper de ícones (`Icon.js`) sobre a biblioteca `lucide`.

## Backend (API)

Camadas convencionais Spring: `Controller` → `Service` → `Repository` → `Entity`, com `Exception/` centralizando erros de domínio traduzidos para respostas HTTP por um `@ControllerAdvice`.

Principais entidades (`src/main/java/.../Entity/`): `Usuario`, `Produto`, `Foto`, `Categoria`, `Carrinho`/`CarrinhoItem`, `Pagamento`, `BibliotecaUsuario`, `Avaliacao`, `Sessao`, `CartaoPresente`, `CodigoJogoPresente`, `WishlistItem`.

Principais serviços de negócio, além dos CRUDs óbvios:

- `SessaoService`: emite e valida tokens de sessão opacos (ver [`seguranca-e-dados.md`](./seguranca-e-dados.md)).
- `CarrinhoItemService`: adiciona/remove itens e controla a **quantidade de presentes** (1 a 10 cópias por jogo; compra pessoal é sempre unitária por regra de negócio).
- `PagamentoService`: executa o checkout — debita o saldo, gera pagamentos, adiciona jogos à biblioteca e, para itens marcados como presente, gera um `CodigoJogoPresente` resgatável por cópia.
- `CodigoJogoPresenteService` / `CodigoJogoPresenteCipher`: geram e validam os códigos de presente (ver segurança).
- `CatalogMediaAuditService`: audita, sob demanda, se as mídias esperadas de cada jogo publicado existem no Cloudinary.
- `AdminService`: agrega as operações administrativas (dashboard, gift cards, usuários, jogos, mídias) atrás de uma checagem de papel `ADMIN`.

## Pontos-chave para explicar no pitch

1. **Roteador e Store client-side** — como a SPA decide qual página renderizar e como o estado flui sem framework.
2. **Fluxo de presente** (`para_presente` + `quantidade` + `CodigoJogoPresente`) — é o mecanismo mais elaborado do domínio: comprador paga N cópias, recebe N códigos, cada código é resgatado uma única vez por outro usuário.
3. **Sessão por token opaco** — por que não é JWT, e o que isso implica para logout/revogação.
4. **Auditoria de mídia** — como o catálogo confirma que as imagens hospedadas no Cloudinary realmente existem antes de exibi-las.
5. **Separação mock/API real** — por que a suíte de testes e o build de produção nunca dependem do mock.
