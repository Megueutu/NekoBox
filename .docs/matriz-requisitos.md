# Matriz de conformidade — DAD Projeto MVP

Esta matriz usa três estados: **Atende**, **Parcial** e **Não atende**. “Não verificável” identifica itens externos ao conteúdo do repositório.

## Funcionalidades obrigatórias

| # | Requisito | Status | Evidência | Pendência |
| --- | --- | --- | --- | --- |
| 1 | Catálogo dinâmico com 8+ produtos | Atende | Renderização via JS em [`HubPage.js`](../frontend/src/pages/hub/HubPage.js), API e seed com 8 produtos em [`script_bd.sql`](../infra/database/postgres/script_bd.sql) | — |
| 2 | Detalhe com imagem, descrição, preço e compra | Atende | [`GamePage.js`](../frontend/src/pages/game/GamePage.js) | — |
| 3 | Busca ou filtro em JS | Atende | `filterCatalogGames` em [`HubPage.js`](../frontend/src/pages/hub/HubPage.js) | A busca não usa debounce, mas não chama a API a cada tecla |
| 4 | Carrinho: adicionar, remover, quantidade, total e sessão | Atende | [`CartPage.js`](../frontend/src/pages/cart/CartPage.js), [`CarrinhoItem.java`](../backend/api/src/main/java/com/example/marketplaceproject/Entity/CarrinhoItem.java) e API persistente | Quantidade 1–10 é aplicada a licenças-presente; compra pessoal é unitária |
| 5 | Checkout com formulário, validação e confirmação | Atende | [`CartPage.js`](../frontend/src/pages/cart/CartPage.js), [`checkout-validation.js`](../frontend/src/pages/cart/checkout-validation.js) e [`PagamentoService.java`](../backend/api/src/main/java/com/example/marketplaceproject/Service/PagamentoService.java) | — |
| 6 | Responsividade mobile ≥360 px e desktop | Atende | CSS modular, [`responsive.css`](../frontend/src/styles/responsive.css) e validação do fluxo em 360, 768 e 1280 px | — |

Conclusão: o conjunto obrigatório da seção 3.1 está implementado e o fluxo de presentes foi validado nas três larguras exigidas, sem overflow horizontal.

## Funcionalidades adicionais

Para nota 10 são necessárias duas adicionais completas, com ao menos uma do Grupo A.

| Grupo | Adicional | Status | Evidência |
| --- | --- | --- | --- |
| A | Autenticação com sessão persistente | Atende | [`AuthController.java`](../backend/api/src/main/java/com/example/marketplaceproject/Controller/AuthController.java), [`SessaoService.java`](../backend/api/src/main/java/com/example/marketplaceproject/Service/SessaoService.java) |
| A | Área administrativa de produtos | Atende | [`AdminPage.js`](../frontend/src/pages/admin/AdminPage.js), [`AdminController.java`](../backend/api/src/main/java/com/example/marketplaceproject/Controller/AdminController.java) |
| A | API externa funcional | Parcial/condicional | Cloudinary e o GameBot dependem das credenciais do ambiente |
| A | Histórico de pedidos | Não atende | A biblioteca não substitui histórico de pedidos |
| B | Avaliações/comentários | Parcial | A API e a exibição existem; confirmar fluxo de criação na interface |
| B | Modo claro/escuro persistente | Não atende | Há preferências de tema escuro, sem modo claro completo |
| B | Favoritos | Atende | [`WishlistPage.js`](../frontend/src/pages/wishlist/WishlistPage.js) |
| B | Cupons | Não atende | Gift cards não equivalem necessariamente a cupom de desconto |

O projeto já possui duas adicionais completas do Grupo A, satisfazendo a regra funcional de adicionais da nota 10.

## Requisitos técnicos

| Requisito | Status | Evidência/observação |
| --- | --- | --- |
| JavaScript vanilla | Atende | O frontend não usa React, Vue, Angular, Svelte ou jQuery |
| HTML5 semântico | Atende em boa parte | Layouts possuem `nav`, `main`, `footer`, seções e headings |
| CSS3/framework permitido | Atende | Tailwind é usado no build, junto de CSS próprio modular |
| DOM dinâmico | Atende | Templates, eventos e atualização do catálogo são executados em JS |
| Backend livre e persistência | Atende | Spring Boot, Spring Data JPA e PostgreSQL |
| API sem mocks no fluxo principal | Atende | [`games.service.js`](../frontend/src/services/games/games.service.js) consome a API |
| Segredos fora do repositório | Atende | [`.env.example`](../.env.example) contém apenas modelo; `.env` é ignorado |

## Acessibilidade WCAG 2.1 AA

| # | Critério | Status | Evidência/ação |
| --- | --- | --- | --- |
| 1 | `alt` descritivo ou vazio | Parcial | Há `alt` e imagens com `role="img"`; auditar todas as mídias externas |
| 2 | Contraste ≥4,5:1 | Atende na auditoria automatizada | Auditoria de contraste passou no Lighthouse; captura complementar no WebAIM permanece recomendada |
| 3 | Carrinho e checkout por teclado | Atende em teste automatizado | Controles são botões/inputs nativos; formulário e mensagens possuem foco e ARIA |
| 4 | Foco visível | Atende em boa parte | Utilitários de foco e testes em [`keyboard.test.js`](../frontend/src/__tests__/keyboard.test.js) |
| 5 | HTML semântico | Atende em boa parte | Layouts públicos, privados e administrativos |
| 6 | Labels e erros acessíveis | Atende em boa parte | Checkout possui labels, `aria-invalid`, alertas por campo e foco no primeiro erro |
| 7 | Informação não transmitida só por cor | Atende em boa parte | Estados usam texto e ícones; validar filtros de daltonismo |
| 8 | Zoom 200% | Não verificável | Teste manual pendente |
| 9 | `lang="pt-BR"` | Atende | [`index.html`](../frontend/index.html) |
| 10 | Lighthouse ≥90 | Atende | Mediana 100 na principal e 100 no detalhe; ver [`lighthouse-report.md`](./lighthouse-report.md) |

O Lighthouse e o fluxo por teclado possuem evidência. Contraste complementar, zoom de 200%, daltonismo e leitor de tela ainda dependem de registro manual.

## Rubrica técnica

| Dimensão | Avaliação atual | Pontos relevantes |
| --- | --- | --- |
| DOM | Adequado | Atualizações dinâmicas funcionam, mas há uso amplo de `innerHTML`; dados externos precisam de escape rigoroso |
| Modularidade | Excelente/Adequado | Código separado por páginas, serviços, store, componentes e estilos |
| Erros assíncronos | Adequado | Cliente e roteador tratam erros; algumas ações de página não mostram feedback específico |
| Loading/vazio/erro | Adequado | Roteador e páginas possuem estados, mas nem toda ação assíncrona expõe loading |
| Legibilidade | Adequado | Responsabilidades foram extraídas; ainda existem funções de página extensas |
| Performance | Adequado | Lazy loading e carregamento por rota presentes; busca local dispensa debounce de rede |
| Higiene | Atende | Sem `console.log`, `.env` e `node_modules` fora do Git |

## GitHub e entregáveis

| Requisito | Status | Pendência |
| --- | --- | --- |
| Repositório público | Não verificável localmente | Confirmar em aba anônima |
| README com descrição, stack e execução | Atende | — |
| README com integrantes e funções | Parcial | Identidades e atuação observada foram registradas; equipe deve confirmar os nomes e papéis formais |
| Declaração de uso de IA | Atende | Resumo no [`README.md`](../README.md) e detalhes em [`declaracao-uso-ia.md`](./declaracao-uso-ia.md) |
| Commits de todos | Há cinco identidades no histórico | Verificar se correspondem aos integrantes e justificar aliases |
| Distribuição ao longo do período | Atende em datas | Há commits em 17 dias distintos |
| Concentração por integrante | Risco | Duas identidades compartilham o mesmo e-mail e concentram a maior parte; explicar aliases |
| Board ativo | Não verificável | Vincular o GitHub Project/board no README |
| Tag `v1.0-pitch` | Não atende | Criar somente no commit congelado da apresentação |
| Roteiro do pitch em PDF | Atende | [`roteiro-pitch.pdf`](./roteiro-pitch.pdf), com uma página |
| Três execuções Lighthouse | Atende | Medianas 100 em `/` e no detalhe; ver [`lighthouse-report.md`](./lighthouse-report.md) |
| Demo local de contingência | Atende | Docker Compose reproduz o ambiente |
| `demo-backup.mp4` | Opcional | Criar apenas como contingência |

## Parecer final

O projeto tem base técnica acima do mínimo, com as seis funcionalidades obrigatórias, backend persistente, autenticação, administração e testes automatizados. A faixa máxima ainda depende das evidências de acessibilidade, da documentação externa do processo e da apresentação/arguição.
