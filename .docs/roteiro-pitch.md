# Roteiro do pitch

Este roteiro foi dimensionado para cinco minutos e possui versão de uma página em [`roteiro-pitch.pdf`](./roteiro-pitch.pdf). A equipe deve atribuir os marcadores de integrante e ensaiar antes da apresentação.

## 0:00–0:30 — problema

**[Integrante 1]**

Comprar jogos digitais costuma envolver catálogos confusos e pouca transparência sobre conteúdo, requisitos e acessibilidade. O NekoBox organiza descoberta, compra simulada e biblioteca em um fluxo único.

## 0:30–1:20 — solução

**[Integrante 2]**

O NekoBox é um marketplace responsivo de jogos. O usuário pesquisa por nome, filtra categorias, consulta detalhes, salva favoritos, adiciona itens ao carrinho e conclui uma compra simulada. Usuários autenticados mantêm carrinho e biblioteca; administradores gerenciam catálogo e mídias.

## 1:20–3:20 — demonstração

**[Integrantes 2 e 3]**

1. abrir a landing page e o catálogo;
2. buscar um jogo e aplicar categoria;
3. abrir detalhes;
4. autenticar;
5. adicionar uma cópia pessoal e um presente;
6. alterar a quantidade de códigos-presente;
7. preencher checkout inválido e mostrar erros;
8. corrigir dados e confirmar;
9. copiar um código e resgatá-lo na biblioteca;
10. mostrar rapidamente o admin.

## 3:20–4:20 — decisões técnicas

**[Integrante 3]**

- JavaScript vanilla e Vite, conforme o requisito;
- módulos por responsabilidade;
- API REST em Spring Boot;
- PostgreSQL para persistência;
- Docker Compose para reprodução;
- sessão persistente com token;
- trade-off: templates HTML são simples, mas exigem cuidado com escape de dados.

## 4:20–4:50 — acessibilidade e diferenciais

**[Integrante 4]**

Mostrar skip link, foco visível, navegação por teclado, labels, mensagens acessíveis e resultado mediano do Lighthouse. Citar como diferenciais autenticação, admin, favoritos, avaliações e testes automatizados.

## 4:50–5:00 — fechamento

**[Integrante 1]**

“O NekoBox demonstra uma loja funcional de ponta a ponta, com persistência real, acesso inclusivo e uma arquitetura que conseguimos explicar e evoluir.”

## Perguntas para ensaio da arguição

- Como a rota é localizada e renderizada?
- Por que a busca não faz uma requisição por tecla?
- Como o token é criado e validado?
- Como o total do carrinho é calculado?
- Por que compras pessoais têm quantidade 1 e presentes aceitam até 10?
- Como os códigos de presente são protegidos no banco?
- O que acontece no banco durante o checkout?
- Por que `innerHTML` exige cuidado?
- Como o foco é gerenciado após navegar?
- Qual limitação técnica vocês corrigiriam primeiro?
