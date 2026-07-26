# Design system visual

O NekoBox usa uma interface escura e editorial, com roxo como marca e âmbar reservado a preço e qualidade. A hierarquia vem de tipografia, fotografia, espaçamento e contraste entre superfícies — não da repetição de bordas e gradientes.

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

## Direção visual

- O fundo é neutro; roxo não deve tingir grandes áreas da interface.
- Gradientes são permitidos sobre fotografias quando melhoram a legibilidade. Botões, badges, marca e superfícies usam cores sólidas.
- Cards e painéis são separados por espaço, tom de superfície e conteúdo. Contornos ficam restritos a campos, foco, tabelas e divisórias que comunicam estrutura.
- O âmbar destaca preço, recomendação e sucesso. Usá-lo como decoração reduz seu valor semântico.
- Pills são usadas apenas para filtros e metadados compactos. Preferir cantos moderados a transformar todo elemento em cápsula.

## Tipografia

- `Plus Jakarta Sans` é a fonte de corpo, controles e metadados.
- `Rajdhani` é reservada para marca, títulos e preços de destaque.
- Títulos semânticos (`h1` a `h4`) usam a família display, mas tamanho e peso pertencem ao componente ou à página.
- Texto funcional não deve depender de caixa alta ou tracking excessivo para ser compreendido.

## Componentes

- **Card**: mídia no topo, informação textual em área própria e badges apenas para categoria/recomendação; sem contorno por padrão.
- **Botão primário**: ação principal da tela, roxo sólido, com foco visível e feedback de estado.
- **Controle secundário**: superfície elevada, usado para ações alternativas; contorno apenas quando a affordance exigir.
- **Campo**: label associado por `for`, input com `name`, foco visível e mensagem de erro próxima ao contexto.
- **Empty state**: título semântico, explicação curta e CTA opcional.
- **Layout privado**: navegação lateral no desktop e menu completo no mobile.

## Ícones

- A interface usa `lucide` por meio de `src/components/ui/Icon.js`; páginas e componentes não devem importar SVGs genéricos diretamente.
- O catálogo `icons` centraliza os ícones aprovados, e `Icon` padroniza `viewBox`, traço, alinhamento e atributos de acessibilidade.
- O tamanho padrão é `1.25rem` (`w-5 h-5`) e o traço padrão é `2`; variações devem acompanhar a escala visual do componente.
- Ícones ao lado de texto são decorativos e usam `aria-hidden`. Ações somente com ícone devem manter nome acessível no botão ou link.
- Logos de terceiros, como Google, podem preservar o SVG oficial fora do Lucide.

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
- A primeira parada de `Tab` oferece o skip link para o conteúdo principal.
- `Tab` e `Shift+Tab` percorrem controles; `Enter` e `Espaço` ativam ações.
- Abas e filtros exclusivos usam setas, `Home` e `End`, com uma única parada na ordem de tabulação.
- `Escape` fecha o menu mobile e devolve o foco ao controle que o abriu.
- Após uma navegação SPA, o foco é movido para o conteúdo principal; atualizações locais preservam o contexto atual.
- Imagens de conteúdo preferem `<img>` com `alt`, `loading="lazy"` e fallback.
- Animações e transições são reduzidas quando `prefers-reduced-motion: reduce` está ativo.

## Critério de consistência

Uma página nova deve reutilizar `PageHeader`, `Section`, `EmptyState`, `GameCard`, `Icon` e os layouts existentes antes de criar uma variante local. Exceções devem ser justificadas pelo fluxo e registradas aqui.
