# Matriz de requisitos

Status na entrega, após as correções descritas em [`execucao-e-validacao.md`](./execucao-e-validacao.md).

## Bloqueios obrigatórios

| Requisito | Status | Evidência |
| --- | --- | --- |
| Backend compila e sobe | ✅ Corrigido | Import ausente de `RegraNegocioException` em `AdminService.java`; `mvn compile` e `mvn test` (24/24) verdes |
| `docker compose up --build` sobe do zero | ✅ Corrigido | Schema do banco (`fotos_tipo_check`) rejeitava o tipo de mídia `poster`, que o código Java e o próprio seed usam — qualquer instalação limpa falhava ao popular o banco. Corrigido em `infra/database/postgres/script_bd.sql`; validado destruindo e recriando o volume local |
| Alterar quantidade no carrinho | ✅ Implementado | Botão "Comprar de presente" em `GamePage.js` + stepper +/- em `CartPage.js`, usando o endpoint `PATCH /api/carrinho/itens/{id}` já existente no backend |
| Fluxo completo (cadastro → catálogo → carrinho → checkout → biblioteca/wishlist/admin) | ✅ Validado | Ver seção "Fluxo completo" em `execucao-e-validacao.md` |
| Testes frontend em Node 22 | ✅ Validado | Suíte executada dentro de container `node:22.18.0-alpine` (a mesma imagem do `Dockerfile` de produção); local com Node mais novo o `jsdom` trava — documentado como causa raiz |
| Acessibilidade (teclado, contraste, zoom, `lang="pt-BR"`, responsividade 360px/desktop) | ✅ Verificado, 2 bugs reais corrigidos | Lighthouse Acessibilidade 100/100 nas duas páginas após correção; ver `execucao-e-validacao.md` |
| Relatório Lighthouse (3 execuções, home + página interna, meta ≥ 90) | ⚠️ Gerado; Performance abaixo da meta | [`lighthouse-report.md`](./lighthouse-report.md) — Acessibilidade/Boas práticas/SEO ≥ 90; Performance 72 (home) e 87 (interna), com causa raiz arquitetural documentada |

## Documentação e GitHub

| Item | Status | Observação |
| --- | --- | --- |
| Arquivos `.docs/` referenciados pelo README | ✅ Restaurados | Este arquivo, `execucao-e-validacao.md`, `arquitetura-e-pontos-chave.md`, `seguranca-e-dados.md`, `declaracao-uso-ia.md`, `roteiro-pitch.md`, `lighthouse-report.md` |
| Tag `v1.0-pitch` | ⚠️ Pendente de decisão da equipe | Criação de tag/push é uma ação em estado compartilhado do repositório; não foi criada automaticamente — ver observação no fim deste documento |
| Board de tarefas ativo no GitHub | ⚠️ Pendente de verificação manual | Requer acesso à interface do GitHub (Projects) pela equipe |
| Concentração de commits (~83–84% em aliases de Davi) | ✅ Explicado | Ver [`execucao-e-validacao.md`](./execucao-e-validacao.md#concentração-de-commits) |

## Para nota 10

| Item | Status | Evidência |
| --- | --- | --- |
| Duas funcionalidades adicionais ponta a ponta | ✅ Validado | Administração (`AdminFlowTests`, 7 testes) e Wishlist (fluxo manual + `WishlistPage.js`) funcionam de ponta a ponta após a correção do backend |
| Vulnerabilidades do `npm audit` | ✅ Resolvido | 3 → 0 vulnerabilidades via `npm audit fix` (detalhe em `seguranca-e-dados.md`) |
| Pitch de 5 minutos | ✅ Roteiro pronto | [`roteiro-pitch.md`](./roteiro-pitch.md) |

## Observação sobre a tag e o board

Criar uma tag (`git tag v1.0-pitch` + `git push --tags`) e confirmar/criar um board no GitHub são ações que publicam estado no repositório remoto compartilhado. Por serem decisões de coordenação da equipe (quando exatamente "congelar" a versão do pitch, quem administra o board), ficam registradas aqui como pendências explícitas em vez de serem executadas unilateralmente durante esta rodada de correções.
