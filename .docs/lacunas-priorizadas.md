# Lacunas priorizadas

## Mínimo funcional — concluído

- seed com oito produtos;
- quantidade persistida para presentes, limitada de 1 a 10;
- controles acessíveis de quantidade e total recalculado;
- checkout com labels, validação por campo, feedback de erro e confirmação;
- compra pessoal adicionada à biblioteca;
- presentes convertidos em códigos únicos e resgatáveis.

## Prioridade 1 — acessibilidade auditável

1. associar label visível ou acessível à busca;
2. medir contraste;
3. testar zoom de 200%;
4. testar o checkout com VoiceOver ou NVDA;
5. registrar capturas da auditoria executada em sala.

## Prioridade 2 — entregáveis

1. confirmar a grafia dos integrantes observados no README;
2. vincular o board;
3. revisar os nomes do [`roteiro-pitch.pdf`](./roteiro-pitch.pdf);
4. criar `v1.0-pitch` somente no commit apresentado;
5. confirmar que o repositório é público;
6. preparar uma demo local e, opcionalmente, `demo-backup.mp4`.

## Prioridade 3 — qualidade para a rubrica

1. exibir loading/erro/sucesso em cada ação assíncrona;
2. reduzir `innerHTML` para dados externos, preferindo `createElement` e `textContent`;
3. auditar escape de título, descrição, username, avaliações e URLs;
4. revisar funções longas e duplicações;
5. justificar no README bibliotecas utilitárias e decisões de stack;
6. explicar aliases de autoria no histórico Git.

## O que já é diferencial

- autenticação persistente;
- área administrativa completa;
- backend e PostgreSQL reais;
- favoritos e avaliações;
- Docker Compose reproduzível;
- suíte de testes automatizados;
- módulos por responsabilidade;
- tratamento central de erros;
- navegação por teclado e preferências de acessibilidade.

Não é necessário migrar para React ou acrescentar bancos NoSQL: isso contrariaria ou desviaria do escopo do documento correto.
