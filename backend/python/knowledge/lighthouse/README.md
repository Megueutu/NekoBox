# Relatório Lighthouse

Gerado com `npx lighthouse` (Chromium/Edge headless), 3 execuções por página, contra a stack rodando via `docker compose up --build` (build de produção real, não `vite dev`). Metodologia padrão do Lighthouse CLI: preset mobile, rede e CPU simuladas (4x de desaceleração de CPU, throughput ~1.6 Mbps) — as mesmas condições usadas para a checagem de responsividade em 360px.

## Página inicial — `/hub`

| Execução | Performance | Acessibilidade | Boas práticas | SEO |
| --- | --- | --- | --- | --- |
| 1 | 72 | 100 | 100 | 92 |
| 2 | 72 | 100 | 100 | 92 |
| 3 | 72 | 100 | 100 | 92 |
| **Média** | **72** | **100** | **100** | **92** |

## Página interna — `/game/cyberpunk-2077`

| Execução | Performance | Acessibilidade | Boas práticas | SEO |
| --- | --- | --- | --- | --- |
| 1 | 87 | 100 | 100 | 92 |
| 2 | 87 | 100 | 100 | 92 |
| 3 | 86 | 100 | 100 | 92 |
| **Média** | **87** | **100** | **100** | **92** |

## Resultado em relação à meta (≥ 90)

- **Acessibilidade:** 100/100 em ambas as páginas — atingida.
- **Boas práticas:** 100/100 em ambas as páginas — atingida.
- **SEO:** 92/100 em ambas as páginas — atingida.
- **Performance:** 72 (home) e 87 (página interna) — **abaixo da meta**. Diagnóstico e decisão de escopo abaixo.

## Bugs de acessibilidade encontrados e corrigidos durante esta checagem

A auditoria expôs dois problemas reais (não eram só números baixos — eram falhas concretas de acessibilidade), corrigidos nesta correção:

1. **Contraste insuficiente em todos os botões primários (`color-contrast`, score 0 → 1).** O commit mais recente do histórico ("style: refactoring stylesheet") colapsou toda a rampa de cores da marca (`--color-brand-100` a `--color-brand-700`) para um único valor idêntico (`#9a89e5`). Texto branco sobre essa cor dava contraste de **2.96:1**, bem abaixo do mínimo de 4.5:1 do WCAG AA — afetando o botão "Comprar", "Confirmar compra", "Adicionar saldo" e todo botão `.button-primary` do site. Restaurados os tons distintos que existiam antes desse commit (`#a78bfa`/`#8b5cf6`/`#7c3aed`/`#6d28d9`), que dão **5.70:1** de contraste — corrige o problema em toda a aplicação, não só na página testada.
2. **`aria-required-children` (score 0 → não aplicável/corrigido).** Os pontos de navegação do carrossel de capturas de tela (`.screenshot-carousel__dots`) usavam `role="tablist"` sem filhos `role="tab"`, uma combinação ARIA inválida. Trocado para `role="group"` (papel que a navegação por teclado do projeto já suporta nativamente para grupos de botões), que descreve corretamente o padrão de paginação por pontos usado ali.

## Performance abaixo de 90 — diagnóstico e decisão de escopo

O elemento LCP (*Largest Contentful Paint*) em ambas as páginas é a imagem de destaque (`.hero-panel`/banner do jogo), carregada como `background-image` via CSS **definida por JavaScript** depois que a SPA busca os dados do catálogo na API. A quebra do tempo de LCP (relatório `home-1.json`, campo `lcp-breakdown-insight`):

| Etapa | Duração |
| --- | --- |
| Time to first byte | ~19 ms |
| Atraso até o navegador descobrir a URL da imagem | ~870–1660 ms |
| Download da imagem | ~10–460 ms |
| Atraso de renderização do elemento | ~380–770 ms |

O gargalo é a **descoberta tardia**: como a URL da imagem só existe depois que o JavaScript roda e a chamada à API responde, o navegador não pode começar a buscá-la a partir do HTML inicial (confirmado pelo audit `lcp-discovery-insight`: `requestDiscoverable: false`, `priorityHinted: false`).

**Mitigação já aplicada nesta correção:** `<link rel="preconnect">` para os hosts de imagem mais usados (`res.cloudinary.com`, `cdn.akamai.steamstatic.com`) e `dns-prefetch` para os demais, em `frontend/index.html`. Isso reduziu o tempo de download da imagem uma vez iniciada a busca, mas não elimina o atraso de descoberta, que é estrutural ao padrão "buscar dados, depois renderizar" de uma SPA sem *server-side rendering*.

**Por que não foi resolvido por completo nesta correção:** eliminar esse atraso exigiria pré-renderização/SSR da página inicial ou embutir os dados do herói no HTML servido — uma mudança de arquitetura maior do que o escopo desta rodada de correções (cuja diretriz é corrigir bugs pontuais, não redesenhar o pipeline de renderização). Registrado aqui como item de melhoria futura, não escondido.

## Reprodução

```powershell
docker compose up --build -d
$env:CHROME_PATH = "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"
npx lighthouse http://localhost:5173/hub --chrome-flags="--headless=new" --only-categories=performance,accessibility,best-practices,seo
npx lighthouse http://localhost:5173/game/cyberpunk-2077 --chrome-flags="--headless=new" --only-categories=performance,accessibility,best-practices,seo
```