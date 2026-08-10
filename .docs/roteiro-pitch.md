# Roteiro do pitch (5 minutos)

Fonte editável. A versão em PDF (`roteiro-pitch.pdf`, referenciada no README) deve ser exportada deste arquivo pela equipe antes da apresentação — a exportação em si é uma etapa manual (Markdown → PDF) e não foi gerada automaticamente nesta correção.

Sugestão de divisão: **1 pessoa por bloco**, ~1 minuto cada, para que "todos consigam explicar partes do código" (requisito da rubrica).

## 1. Abertura e problema (0:00–1:00) — Davi

- NekoBox é um marketplace de jogos digitais: catálogo, carrinho, checkout, biblioteca, presentes e wishlist.
- Stack: SPA JavaScript vanilla (sem framework) + Spring Boot + PostgreSQL, tudo orquestrado por Docker Compose.
- Por que sem framework no frontend: exercício deliberado de entender roteamento, estado e HTTP "na mão" antes de depender de uma abstração.

## 2. Demo do fluxo principal (1:00–2:30) — quem desenvolveu o backend (Arthur)

Ao vivo, com `docker compose up --build -d`:

1. Cadastro e login.
2. Catálogo: busca e filtro por categoria.
3. Página de um jogo: comprar para si **e** comprar de presente (mostrar o controle de quantidade de 1 a 10 no carrinho — funcionalidade central desta correção).
4. Checkout com saldo da carteira.
5. Biblioteca mostrando o jogo comprado; resgate do código de presente em outra conta.

Ponto técnico a destacar: cada cópia de presente gera um código único, resgatável uma única vez por outra pessoa — não é um simples "duplicar quantidade", é um sistema de códigos com estado (`CodigoJogoPresente`).

## 3. Administração e dados (2:30–3:30) — quem desenvolveu a área admin

- Dashboard: receita, vendas, ticket médio, jogos mais vendidos.
- Gestão de usuários, jogos e mídias (upload para Cloudinary).
- Geração de gift cards.
- Por que isso é uma segunda funcionalidade "ponta a ponta" independente do fluxo de compra: papéis (`ADMIN` vs. `USER`), autorização própria (`AdminService.exigirAdmin`), testada em `AdminFlowTests`.

## 4. GameBot e arquitetura de IA (3:30–4:15) — Cadu

- Widget de chat conectado a um serviço Python (FastAPI) separado, que fala com a Google AI (Gemini).
- Por que é um serviço isolado: mantém a chave `GOOGLE_API_KEY` fora do backend Java e do bundle do frontend.

## 5. Qualidade, segurança e encerramento (4:15–5:00) — Davi

- 24 testes de backend (JUnit/MockMvc) e 148 testes de frontend (Vitest), todos verdes.
- Senhas com BCrypt, sessão por token opaco hasheado (SHA-256), CORS restrito por origem.
- `npm audit`: 0 vulnerabilidades.
- Acessibilidade: navegação por teclado, `lang="pt-BR"`, responsivo de 360px a desktop, Lighthouse ≥ 90 (ver `.docs/lighthouse-report.md`).
- Encerramento: o que ficaria para uma próxima iteração (ex.: avaliações de jogos com moderação, notificações de presente por e-mail).

## Perguntas esperadas da banca (preparar respostas em equipe)

- "Por que a sessão não é JWT?" → ver [`seguranca-e-dados.md`](./seguranca-e-dados.md): revogação server-side sem blocklist.
- "Como funciona o presente de jogo ponta a ponta?" → ver [`arquitetura-e-pontos-chave.md`](./arquitetura-e-pontos-chave.md) e o teste `GameGiftFlowTests.shouldGenerateOneRedeemableCodeForEachGiftCopy`.
- "Por que a concentração de commits está acima de 70%?" → ver [`execucao-e-validacao.md`](./execucao-e-validacao.md#concentração-de-commits).
