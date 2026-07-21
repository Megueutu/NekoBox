# Arquitetura

## Visão geral

O frontend usa uma arquitetura por responsabilidades, sem framework de componentes React. A entrada em `src/main.js` carrega o CSS e inicializa o roteador. O roteador encontra a rota, carrega a página dinamicamente, monta o HTML e registra os eventos após a renderização.

```text
main.js
  └── Router
       ├── routes + matchRoute + navigate
       ├── pages
       │    ├── layouts públicos/privados
       │    └── componentes reutilizáveis
       ├── services (auth, games)
       ├── Store + Actions
       └── core (Firebase, Cloudinary)
```

## Camadas

### Entrada e build

- `index.html` fornece o elemento raiz `#app`.
- `src/main.js` inicia a SPA.
- `vite.config.ts` configura Vite, Tailwind CSS, Vitest e o alias `@` para `src`.

### Roteamento

- `src/app/router/routes.js` declara caminhos, páginas e se a rota é privada.
- `matchRoute.js` compara segmentos e extrai parâmetros como `slug`.
- `router.js` implementa carregamento sob demanda, loading, erro, 404 e guard de autenticação.
- `navigate.js` usa History API e dispara `rerender`.

O guard considera a existência de `localStorage.access_token`. Ele salva a rota original em `redirect_target` e redireciona para `/login`.

### Páginas e layouts

Páginas exportam uma função que retorna uma string HTML e, opcionalmente, `afterRender()` para eventos. `PublicLayout` fornece Navbar, conteúdo e Footer. `PrivateLayout` adiciona a SidebarAccount e é usado por perfil, wishlist, carrinho e biblioteca.

A rota pública `/acessibilidade` apresenta a premissa de inclusão do produto, as referências WCAG 2.2, WAI-ARIA, eMAG e ABNT NBR 17225:2025, os recursos disponíveis e as limitações conhecidas.

A rota `/` renderiza a vitrine editorial da loja. O catálogo completo permanece em `/hub`; o logo e o item “Início” da navegação principal apontam para a landing page.

### Estado

`src/store/store.js` mantém `user`, `cart`, `wishlist`, `library` e `loading`. O estado inteiro é persistido em `localStorage.marketplace_central_state`. `Actions` aplica as regras de mutação e dispara o evento global `rerender`.

### Integrações

- Firebase Auth é inicializado quando `VITE_FIREBASE_API_KEY` existe.
- Sem configuração válida, o serviço de autenticação usa respostas mock.
- Cloudinary otimiza mídias que possuam `public_id`; caso contrário, a aplicação usa `url` ou uma imagem fallback.
- O catálogo atual é fornecido exclusivamente por `src/mocks/games.mock.js`.

## Decisões e trade-offs

O carregamento dinâmico reduz o custo inicial de cada página, mas a renderização por `innerHTML` exige cuidado com dados externos: textos e URLs devem ser escapados/validados antes de serem interpolados. O store simples é suficiente para o protótipo, porém não oferece sincronização com servidor, controle de concorrência ou normalização de entidades.
