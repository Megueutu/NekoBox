# Documento principal de entrega — NekoBox

Este diretório organiza a entrega do MVP de loja virtual da disciplina DAD. A auditoria considera exclusivamente o documento correto, “DAD — Projeto MVP: Loja Virtual com JavaScript Vanilla”, com 14 páginas.

## Veredito

As seis funcionalidades obrigatórias estão implementadas. O projeto também possui duas adicionais completas do Grupo A — autenticação persistente e administração de produtos — superando a regra funcional da faixa de nota 10.

O que ainda depende de decisão ou validação manual da equipe:

1. confirmar a grafia dos nomes listados no README;
2. vincular o board usado pela equipe;
3. criar a tag `v1.0-pitch` apenas no commit efetivamente apresentado;
4. confirmar o acesso público ao repositório;
5. registrar contraste, zoom de 200% e teste com leitor de tela.

## Onde está cada ponto

| Ponto da entrega | Evidência principal | Situação |
| --- | --- | --- |
| Catálogo dinâmico | [`HubPage.js`](../frontend/src/pages/hub/HubPage.js), [`games.service.js`](../frontend/src/services/games/games.service.js) | Atende; seed com 8 produtos |
| Detalhe do produto | [`GamePage.js`](../frontend/src/pages/game/GamePage.js) | Atende |
| Busca e filtro | [`HubPage.js`](../frontend/src/pages/hub/HubPage.js) | Atende |
| Carrinho | [`CartPage.js`](../frontend/src/pages/cart/CartPage.js), [`CarrinhoController.java`](../backend/api/src/main/java/com/example/marketplaceproject/Controller/CarrinhoController.java) | Atende; presentes aceitam 1–10 unidades |
| Checkout | [`CartPage.js`](../frontend/src/pages/cart/CartPage.js), [`PagamentoService.java`](../backend/api/src/main/java/com/example/marketplaceproject/Service/PagamentoService.java) | Atende; formulário, validação e confirmação |
| Responsividade | [`responsive.css`](../frontend/src/styles/responsive.css) | Validada em 360, 768 e 1280 px, sem overflow |
| Autenticação persistente | [`auth.service.js`](../frontend/src/services/auth/auth.service.js), [`SessaoService.java`](../backend/api/src/main/java/com/example/marketplaceproject/Service/SessaoService.java) | Adicional Grupo A atendido |
| Área administrativa | [`AdminPage.js`](../frontend/src/pages/admin/AdminPage.js), [`AdminController.java`](../backend/api/src/main/java/com/example/marketplaceproject/Controller/AdminController.java) | Adicional Grupo A atendido |
| Favoritos | [`WishlistPage.js`](../frontend/src/pages/wishlist/WishlistPage.js) | Adicional Grupo B atendido |
| Avaliações | [`GamePage.js`](../frontend/src/pages/game/GamePage.js), [`AvaliacaoController.java`](../backend/api/src/main/java/com/example/marketplaceproject/Controller/AvaliacaoController.java) | Exibição e API presentes |
| Acessibilidade | [`keyboard.js`](../frontend/src/app/accessibility/keyboard.js), [`accessibility-utilities.css`](../frontend/src/styles/accessibility-utilities.css) | Lighthouse 100; testes manuais complementares listados |
| Backend e persistência | [`compose.yaml`](../compose.yaml), [`backend/api`](../backend/api), [`script_bd.sql`](../infra/database/postgres/script_bd.sql) | Atende |
| Testes automatizados | [`frontend/src/__tests__`](../frontend/src/__tests__), [`backend/api/src/test`](../backend/api/src/test) | Extra não exigido, mas presente |
| Execução local | [`README.md`](../README.md), [`compose.yaml`](../compose.yaml) | Atende |
| Lighthouse | [`lighthouse-report.md`](./lighthouse-report.md) | 6 execuções, mediana 100 nas duas páginas |
| Pitch | [`roteiro-pitch.pdf`](./roteiro-pitch.pdf), [`roteiro-pitch.md`](./roteiro-pitch.md) | PDF de uma página gerado; nomes formais pendentes |
| Uso de IA | [`declaracao-uso-ia.md`](./declaracao-uso-ia.md) | Declaração-base criada; equipe deve revisar |

## Documentos

- [Matriz completa de requisitos](./matriz-requisitos.md)
- [Arquitetura e pontos-chave](./arquitetura-e-pontos-chave.md)
- [Execução e validação](./execucao-e-validacao.md)
- [Lacunas priorizadas](./lacunas-priorizadas.md)
- [Segurança e dados](./seguranca-e-dados.md)
- [Relatório Lighthouse](./lighthouse-report.md)
- [Roteiro do pitch](./roteiro-pitch.md)
- [Roteiro do pitch em PDF](./roteiro-pitch.pdf)
- [Declaração de uso de IA](./declaracao-uso-ia.md)

## Ordem sugerida para a demonstração

1. abrir a landing page;
2. mostrar o catálogo vindo da API;
3. buscar e filtrar produtos;
4. abrir o detalhe de um jogo;
5. autenticar;
6. adicionar uma compra pessoal e um presente;
7. alterar a quantidade do presente;
8. validar e concluir o checkout;
9. copiar e resgatar um código de presente;
10. mostrar biblioteca e favoritos;
11. entrar na área administrativa;
12. demonstrar navegação por teclado e foco visível.
