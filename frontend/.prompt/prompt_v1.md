# Prompt mestre de implementação — Marketplace de Jogos (JS Vanilla)

Você é a IA executora responsável por construir um **marketplace de jogos digitais** inspirado na **PlayStation Network** e na **GOG**, usando **apenas JavaScript Vanilla**, **Vite** e **Tailwind CSS**.

O objetivo deste projeto é entregar a **estrutura completa do front-end**, com navegação, estado, páginas e módulos organizados, deixando a base pronta para integrar com um backend futuro em **Spring Boot + PostgreSQL**.  
Neste momento, **não existe cadastro de jogos por usuários finais**. Apenas o time interno publicará jogos, conteúdos, mídias e informações.

---

## 1) Contexto do projeto

A aplicação terá foco em:

- catálogo de jogos em estilo hub/loja;
- página detalhada de cada jogo;
- autenticação com Google no front-end;
- carrinho de compras;
- lista de desejos;
- biblioteca de jogos adquiridos;
- perfil e estrutura de conta do usuário;
- base preparada para futuramente conectar com backend relacional.

O banco de dados foi projetado de forma relacional com entidades como:

- `users`
- `games`
- `game_sections`
- `game_media`
- `categories`
- `tags`
- `user_library`
- `user_wishlist`
- `reviews`
- `orders`
- `publishers`
- `game_relations`
- `game_prices`
- `game_system_requirements`
- `languages`
- `game_updates`
- `user_follows`

A estrutura do front deve refletir essa lógica, mesmo que neste primeiro momento os dados sejam simulados com mocks.

---

## 2) Tecnologias e restrições

### Obrigatório
- JavaScript Vanilla
- Vite
- Tailwind CSS
- SPA com History API
- Estado global reativo
- Mocks assíncronos com `Promise`
- Estrutura organizada dentro de `/src`

### Não usar
- React
- Vue
- Angular
- Rotas com hash `#/`
- Recarregamento tradicional de página em links internos
- Dependência de backend real nesta fase
- Componentes ou abstrações desnecessárias que compliquem a manutenção

---

## 3) Regras de implementação

1. **Apenas a pasta `/src` deve ser construída nesta fase.**
2. A navegação deve funcionar como **SPA real**, usando `pushState`, `popstate` e interceptação de cliques internos.
3. O estado global deve ser centralizado, reativo e persistido localmente quando necessário.
4. As páginas devem ser montadas em blocos e componentes reutilizáveis.
5. A estilização fina não é prioridade agora; o foco é:
   - estrutura;
   - responsividade;
   - organização;
   - fluxo funcional.
6. Sempre que possível, use `background-image` em `<div>` para capas, banners e screenshots.  
   Use `<img>` apenas quando for realmente mais adequado, como logos ou elementos muito óbvios.
7. Toda funcionalidade de dados deve ser preparada para troca posterior por API real.
8. Os dados mockados devem ser assíncronos e retornar em formato de `Promise`.
9. O projeto deve ser fácil de testar localmente.
10. Ao final de cada sprint, os arquivos entregues devem estar prontos para copiar e colar.

---

## 4) Estrutura de pasta esperada

```text
src/
├── app/
│   ├── router/
│   └── layouts/
├── core/
│   ├── firebase/
│   └── storage/
├── store/
├── services/
├── components/
│   ├── layout/
│   └── ui/
├── pages/
├── mocks/
├── assets/
└── main.js
```

---

## 5) Direção visual e estrutural

A inspiração visual e de experiência é:

- **PSN**: hub de loja, destaque de jogos, navegação por cards e banners;
- **GOG**: catálogo, página de jogo rica em detalhes, biblioteca e identidade de produto.

A estrutura deve prever:

- layout público;
- layout privado;
- navbar com contadores;
- sidebar de conta;
- cards responsivos de jogos;
- página detalhada do jogo com banner, screenshots, preço, requisitos e idiomas;
- biblioteca do usuário;
- carrinho;
- wishlist;
- perfil.

---

## 6) Objetivo por sprints

Quero que você implemente o projeto **por etapas**, sem tentar gerar tudo de uma vez se isso aumentar o risco de inconsistência.

Cada sprint deve ser entregue com:
- arquivos completos;
- caminhos exatos;
- código pronto para copiar e colar;
- sem omitir dependências internas;
- sem inventar arquivos fora do escopo;
- sem misturar responsabilidades entre camadas.

Se houver dependência entre arquivos, crie também os arquivos-base necessários para a sprint funcionar.

---

# SPRINT 1 — Infraestrutura de Roteamento SPA Vanilla

## Objetivo
Criar a base de navegação da SPA com History API.

## Deve incluir
- `src/app/router/navigate.js`
- `src/app/router/matchRoute.js`
- `src/app/router/guards.js`
- `src/app/router/routes.js`
- `src/app/router/router.js`

## Requisitos
- interceptar cliques com `data-link`;
- suportar rotas dinâmicas como `/game/:slug`;
- suportar redirecionamento;
- suportar rotas privadas;
- renderizar no elemento `#app`;
- suportar fallback 404;
- preparar lazy loading com `import()`.

---

# SPRINT 2 — Estado Global Reativo

## Objetivo
Criar um store centralizado para controlar:

- usuário logado;
- carrinho;
- wishlist;
- biblioteca;
- loading/estado auxiliar.

## Deve incluir
- `src/store/createStore.js`
- `src/core/storage/storage.js`
- `src/store/store.js`
- `src/store/actions.js`
- `src/store/selectors.js`

## Requisitos
- padrão de subscrição/listeners;
- persistência local;
- atualização reativa da interface;
- disparo de evento global para rerender;
- não espalhar `localStorage` diretamente pelas páginas.

---

# SPRINT 3 — Serviços e Mocks de Dados

## Objetivo
Criar a camada de mock com contratos parecidos com a API real futura.

## Deve incluir
- `src/mocks/games.mock.js`
- `src/services/games/games.service.js`

## Requisitos
- retornar Promises;
- simular atraso assíncrono;
- expor `list()` e `getBySlug(slug)`;
- modelos de dados com:
  - título;
  - slug;
  - descrição curta e longa;
  - preço;
  - data de lançamento;
  - publicadora;
  - capa;
  - banner;
  - screenshots;
  - requisitos mínimo/recomendado;
  - idiomas.

---

# SPRINT 4 — Firebase Auth e Sessão

## Objetivo
Preparar a autenticação no front-end com base estrutural para Google Login.

## Deve incluir
- `src/core/firebase/firebase.js`
- `src/services/auth/auth.service.js`

## Requisitos
- usar `import.meta.env`;
- deixar a estrutura pronta para Firebase;
- simular login com Google;
- gerar token mockado;
- integrar com a Store;
- manter o fluxo pronto para substituição futura por autenticação real.

---

# SPRINT 5 — Layouts base e componentes compartilhados

## Objetivo
Criar a estrutura visual base da aplicação.

## Deve incluir
- `src/components/layout/Navbar.js`
- `src/components/layout/Footer.js`
- `src/components/layout/SidebarAccount.js`
- `src/app/layouts/PublicLayout.js`
- `src/app/layouts/PrivateLayout.js`

## Requisitos
- navbar com usuário logado ou botão de login;
- contadores de carrinho e wishlist;
- sidebar de conta no layout privado;
- layouts reutilizáveis;
- composição clara entre navbar, conteúdo e footer.

---

# SPRINT 6 — Hub da loja e página dinâmica do jogo

## Objetivo
Criar a experiência principal de navegação da loja.

## Deve incluir
- `src/pages/hub/HubPage.js`
- `src/pages/game/GamePage.js`

## Requisitos para o Hub
- carregar jogos via `GamesService`;
- mostrar cards responsivos;
- usar grid flexível;
- usar imagem de capa com `background-image`;
- destacar um banner principal na página.

## Requisitos para a página do jogo
- consumir `params.slug`;
- buscar o jogo correspondente;
- exibir banner;
- exibir título, descrição, preço e publisher;
- mostrar screenshots;
- mostrar requisitos mínimos e recomendados;
- mostrar idiomas suportados;
- incluir botão de compra e ação de wishlist;
- preparar `afterRender` para eventos.

---

# SPRINT 7 — Carrinho e Wishlist

## Objetivo
Conectar a interação do usuário à Store.

## Deve incluir
- `src/pages/cart/CartPage.js`
- `src/pages/wishlist/WishlistPage.js`

## Requisitos
- listar itens do carrinho;
- calcular total;
- permitir remoção de itens;
- botão de finalizar compra;
- mover itens da wishlist para o carrinho;
- remover itens da wishlist;
- respeitar autenticação;
- manter atualização reativa.

---

# SPRINT 8 — Biblioteca e perfil

## Objetivo
Finalizar o fluxo do usuário com biblioteca e perfil.

## Deve incluir
- `src/pages/library/LibraryPage.js`
- `src/pages/profile/ProfilePage.js`

## Requisitos
- mostrar jogos comprados na biblioteca;
- exibir cards das capas;
- mostrar dados mockados do usuário;
- estrutura flexível e responsiva;
- fluxo coerente com o checkout da sprint anterior.

---

# 7) Instruções para a IA executora

Ao implementar, siga estas regras:

1. Entregue **uma sprint por vez**.
2. Sempre respeite a ordem das dependências.
3. Se um arquivo precisar de outro para funcionar, inclua o arquivo dependente.
4. Não simplifique tanto a ponto de quebrar o fluxo SPA.
5. Não use soluções que exijam frameworks.
6. Mantenha a arquitetura clara e modular.
7. Sempre que fizer sentido, preserve nomes de arquivos e pastas consistentes.
8. Se houver ambiguidade, escolha a alternativa mais compatível com Vite + Vanilla JS.
9. Não remova funcionalidades já planejadas nas sprints anteriores.
10. O resultado final deve ser compatível com evolução posterior para backend Spring Boot.

---

# 8) Contexto funcional resumido

Este projeto é um marketplace de jogos com foco em:

- navegação estilo loja de jogos;
- autenticação com Google;
- catálogo;
- página de detalhe do produto;
- carrinho;
- wishlist;
- biblioteca;
- perfil;
- futura integração com API e banco relacional.

Os usuários finais **não cadastram jogos**.  
A catalogação, manutenção de conteúdo e publicação serão internas.

---

# 9) Como responder

Quando eu pedir a implementação de uma sprint, responda com:

- os arquivos completos daquela sprint;
- o caminho de cada arquivo;
- código pronto para copiar e colar;
- sem explicações longas desnecessárias;
- sem omitir trechos importantes;
- sem misturar sprints diferentes, salvo se algum arquivo-base for obrigatório.

Se precisar adaptar alguma coisa do contexto do banco ou do fluxo, priorize sempre:

1. consistência arquitetural;
2. funcionamento real;
3. simplicidade de manutenção;
4. compatibilidade com a estrutura futura do backend.

---