# Design system visual

O NexusPlay usa uma interface escura com roxo como marca e âmbar como acento de ação. A regra principal é criar hierarquia e confiança antes de adicionar efeitos decorativos.

## Tokens

Os tokens ficam em `src/style.css`, dentro de `@theme`.

- `--color-bg`: fundo global.
- `--color-surface`, `--color-surface-2` e `--color-surface-3`: níveis de elevação para cards, campos e menus.
- `--color-border`: divisórias e contornos de baixo contraste.
- `--color-ink`: texto principal.
- `--color-muted` e `--color-muted-2`: texto secundário e metadados.
- `--color-brand-*`: ações e identidade roxa.
- `--color-accent-*`: preço, sucesso visual e destaques âmbar.
- `--radius-card` e `--radius-control`: raios consistentes para cards e controles.
- `--shadow-card` e `--shadow-elevated`: elevação padrão e estado destacado.

Não criar novas cores arbitrárias em páginas sem antes verificar se um token existente resolve o caso.

## Tipografia

- `Plus Jakarta Sans` é a fonte de corpo, controles e metadados.
- `Rajdhani` é reservada para marca, títulos e preços de destaque.
- Títulos semânticos (`h1` a `h4`) usam a família display, mas tamanho e peso pertencem ao componente ou à página.
- Texto funcional não deve depender de caixa alta ou tracking excessivo para ser compreendido.

## Componentes

- **Card**: mídia no topo, informação textual em área própria e badges apenas para categoria/recomendação.
- **Botão primário**: ação principal da tela, roxo, com foco visível e feedback de estado.
- **Controle secundário**: contorno ou superfície elevada, usado para ações alternativas.
- **Campo**: label associado por `for`, input com `name`, foco visível e mensagem de erro próxima ao contexto.
- **Empty state**: título semântico, explicação curta e CTA opcional.
- **Layout privado**: navegação lateral no desktop e menu completo no mobile.

## Sistema de layout

- O conteúdo principal usa `.site-container`, limitado a `88rem` e com margens laterais responsivas.
- Heroes são painéis contidos e arredondados; não devem ocupar toda a largura nem ultrapassar a primeira dobra no mobile.
- O catálogo usa cards com largura mínima de `11rem` no desktop e duas colunas equilibradas no mobile.
- Coleções de destaque usam trilho horizontal com scroll e `scroll-snap`, evitando cards comprimidos.
- Detalhes de jogo usam duas colunas apenas quando há espaço; em tablet e mobile, compra e conteúdo formam uma única coluna.
- Áreas autenticadas mantêm sidebar no desktop e usam o menu global em telas menores.
- O rodapé usa quatro colunas no desktop e duas no mobile, com a marca ocupando a linha inteira.

## Regra de cascade

- Resets globais não podem declarar `margin`, `padding`, cor ou tipografia fora de `@layer base`.
- Regras fora das camadas do Tailwind têm precedência sobre utilitários e podem anular silenciosamente classes como `p-*`, `gap-*`, `text-*` e `leading-*`.
- CSS semântico fora das camadas deve ficar restrito aos componentes estruturais (`site-container`, `hero-panel`, `game-layout` e equivalentes).

## Acessibilidade e movimento

- Todo controle precisa ter nome acessível e funcionar via teclado.
- Foco usa `:focus-visible` com contorno âmbar.
- Imagens de conteúdo preferem `<img>` com `alt`, `loading="lazy"` e fallback.
- Animações e transições são reduzidas quando `prefers-reduced-motion: reduce` está ativo.

## Critério de consistência

Uma página nova deve reutilizar `PageHeader`, `Section`, `EmptyState`, `GameCard` e os layouts existentes antes de criar uma variante local. Exceções devem ser justificadas pelo fluxo e registradas aqui.
