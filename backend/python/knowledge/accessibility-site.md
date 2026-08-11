# Acessibilidade no NekoBox: conhecimento para o GameBot

Esta base descreve recursos presentes no código do NekoBox em linguagem simples. Ela serve para explicar o produto, não para prometer que toda a experiência foi aprovada em uma auditoria. Quando faltar teste, relatório ou evidência, o chatbot deve dizer que o item ainda precisa ser confirmado.

## Idioma da página

O arquivo `frontend/index.html` declara `lang="pt-BR"`. Isso ajuda leitores de tela a pronunciarem o conteúdo em português do Brasil.

## Navegação por teclado e foco

O CSS em `frontend/src/styles/accessibility-utilities.css` define um contorno visível para links, botões e elementos que recebem foco. Esse contorno mostra onde a pessoa está ao usar Tab no teclado.

O mesmo arquivo traz o estilo do atalho “Pular para o conteúdo”. Ele permite ignorar menus repetidos e chegar mais rápido à parte principal da página.

A página pública de acessibilidade também informa que a plataforma oferece navegação com Tab e Shift + Tab, atalhos em grupos de abas e filtros, Escape no menu móvel e transferência de foco após mudanças de rota. Essas interações precisam ser confirmadas no navegador e no teclado durante a auditoria.

## Formulários e mensagens

O checkout em `frontend/src/pages/games/cart/CartPage.js` contém exemplos de boas práticas: label associado ao seletor de forma de pagamento, mensagens de erro com `role="alert"`, retorno de status com `aria-live`, indicação de campo inválido e foco no primeiro campo com problema.

Na prática, isso significa que uma pessoa deve receber uma mensagem clara quando algo der errado e não precisa adivinhar qual campo corrigir. Outros formulários ainda devem ser verificados um a um.

## Movimento e telas menores

O CSS em `frontend/src/styles/responsive.css` reorganiza o layout para telas menores, incluindo celular e tablet. O mesmo arquivo respeita a preferência de reduzir movimento do sistema: animações e transições ficam quase instantâneas quando essa preferência está ativada.

Isso ajuda quem usa celular, amplia a tela ou sente desconforto com animações. A regra de responsividade não prova sozinha que não há rolagem horizontal; é necessário testar as larguras previstas na rubrica.

## Semântica e nomes de controles

A página de acessibilidade do NekoBox descreve o uso de regiões, títulos, tabelas, formulários e controles com semântica apropriada. Também declara que ícones decorativos são escondidos de leitores de tela e ações recebem nomes acessíveis.

Esse é um direcionamento de implementação. A confirmação completa requer inspeção HTML, navegação por teclado e, quando possível, leitor de tela.

## O que sempre precisa de prova

Os itens abaixo não podem ser considerados aprovados apenas por esta base de conhecimento:

- texto alternativo adequado para todas as imagens informativas;
- contraste de texto, ícones e estados;
- navegação completa por teclado e ordem de foco em todos os fluxos;
- semântica HTML de toda a aplicação;
- não depender somente de cor para transmitir informação;
- uso sem quebra de layout com zoom de 200%;
- resultados Lighthouse.

## Lighthouse

A rubrica exige três execuções Lighthouse de acessibilidade para a página principal e três para uma página interna, usando a mediana das três notas de cada página. A meta é mediana igual ou superior a 90.

Salve relatórios JSON em `backend/python/knowledge/lighthouse/`. O chatbot lê apenas os dados de pontuação, URL e data desses relatórios. Se eles não existirem ou forem insuficientes, o chatbot deve explicar que a medição ainda não foi registrada — nunca inventar uma nota.
