# Execução e validação

Registro do que foi corrigido e como foi validado, em resposta ao feedback de revisão da Entrega 3.

## 1. Backend não compilava

**Causa:** `AdminService.java` usava `RegraNegocioException` (linha 260, ao limitar capturas de tela a 10 por jogo) sem importar a classe — que existe em `Exception/RegraNegocioException.java` e já era usada corretamente em outros serviços (`CarrinhoItemService`).

**Correção:** um `import` adicionado.

**Validação:**

```powershell
cd backend\api
.\mvnw.cmd compile   # BUILD SUCCESS
.\mvnw.cmd test      # Tests run: 24, Failures: 0, Errors: 0
```

Durante a validação, um teste (`AdminFlowTests.shouldUploadAndPersistAdminGameMedia`) também falhou por depender da ordem de retorno da auditoria de mídias (assumia que o item recém-enviado seria sempre o primeiro da lista `disponiveis`, o que só é verdade quando não há outros jogos publicados com mídia). O teste foi ajustado para verificar a presença do item pelo `public_id`, independentemente de posição — sem alterar o comportamento do serviço.

## 2. Sem controle de quantidade no carrinho

**Diagnóstico:** o backend já suportava presentes com quantidade de 1 a 10 (`CarrinhoItemService.atualizarQuantidadePresente`, endpoint `PATCH /api/carrinho/itens/{produtoId}`, e todo o fluxo de geração de códigos resgatáveis em `GameGiftFlowTests`), mas **o frontend nunca expunha essa funcionalidade** — não havia como marcar um item como presente ao adicioná-lo ao carrinho, então a quantidade era sempre 1.

**Correção:**

- `GamePage.js`: novo botão "Comprar de presente", que adiciona o item ao carrinho com `para_presente: true`.
- `CartPage.js`: itens marcados como presente exibem um controle +/- de quantidade (1 a 10), que chama o endpoint `PATCH` existente; itens de compra pessoal continuam com quantidade fixa em 1 (regra de negócio documentada no README: "compra pessoal unitária").
- `account.service.js` / `actions.js`: novos métodos `updateCartItemQuantity` / `atualizarQuantidadeCarrinho`.

**Validação:** testes novos em `cart-page.test.js` cobrindo renderização do stepper, limites (1–10) e chamada à store ao clicar em "+"; suíte completa executada com sucesso (ver seção 4).

## 2.1. Schema do banco rejeitava mídia do tipo "poster"

Ao validar `docker compose up --build` do zero (volume novo, sem dados de execuções anteriores), o seed falhava:

```
ERROR: new row for relation "fotos" violates check constraint "fotos_tipo_check"
```

**Causa:** `infra/database/postgres/script_bd.sql` define `tipo VARCHAR(20) NOT NULL CHECK (tipo IN ('cover', 'banner', 'screenshot'))`, mas o enum `TipoFoto` do backend e o próprio seed usam também `'poster'` (capa quadrada usada na grade "Todos os jogos", conforme `GameResourceForm.js`). Como a instalação existente nesta máquina tinha um volume Postgres de execuções anteriores (dados nunca realmente recriados do zero), esse defeito nunca havia sido percebido — mas bloqueia qualquer instalação nova, exatamente o cenário que uma correção/apresentação usa.

**Correção:** `'poster'` adicionado à `CHECK` e ao índice único `uk_fotos_unicas`. Validado destruindo o volume local (`docker volume rm`) e subindo a stack do zero: seed concluído sem erro, os 4 serviços saudáveis.

## 3. Fluxo completo

Validado manualmente após a correção do backend, com `docker compose up --build`:

cadastro → login → catálogo (busca e filtro) → detalhes do jogo → adicionar ao carrinho (compra pessoal e presente) → checkout → biblioteca → resgate de presente por outro usuário → wishlist → área administrativa (dashboard, usuários, jogos, mídias, gift cards).

Os testes de integração do backend (`AuthenticationFlowTests`, `CartFlowTests`, `GameGiftFlowTests`, `WalletFlowTests`, `AdminFlowTests`) cobrem esse mesmo fluxo de ponta a ponta no nível de API.

## 4. Testes frontend em Node 22

**Diagnóstico:** a máquina de desenvolvimento usada nesta correção tinha Node 25 instalado (mais recente que o Node 22 usado pelo projeto — ver `frontend/Dockerfile`). Sob Node 25, `new JSDOM(...)` (usado pelo ambiente `jsdom` do Vitest) trava indefinidamente — reproduzido isoladamente com `node -e "require('jsdom')"`, sem qualquer código do projeto envolvido. Essa é exatamente a falha "ambiente/localStorage/workers" relatada no feedback.

**Correção:** nenhuma mudança de configuração foi necessária — o projeto já está corretamente pinado em Node 22 (`Dockerfile`, `README`). A suíte foi executada dentro de um container `node:22.18.0-alpine` (mesma imagem de produção) para validar:

```
docker run --rm -v "$(pwd)/frontend:/app" -v <volume>:/app/node_modules \
  -w /app node:22.18.0-alpine sh -c "npm ci && npx vitest run"
```

Resultado após as correções de quantidade no carrinho e dos itens abaixo: **todos os arquivos de teste passam** (148+ testes).

Durante essa validação, 4 falhas pré-existentes e não relacionadas ao carrinho foram encontradas e corrigidas:

| Teste | Causa raiz | Correção |
| --- | --- | --- |
| `accessibility-page.test.js` | Texto do hero mudou ("experiência" singular) mas o teste ainda esperava a redação antiga | Teste atualizado para o texto atual |
| `admin-page.test.js` (organização do formulário de jogo) | Refatoração que extraiu `GameResourceForm` deixou `aria-labelledby="...-content-title"` e `"...-publication-title"` apontando para IDs inexistentes — **bug real de acessibilidade**, não só teste desatualizado | Títulos `<h3>` com os IDs corretos restaurados em `GameResourceForm.js` |
| `wallet.test.js` (mensagem de status) | `setupWalletDialog` escreve em `#wallet-status`, mas o elemento tinha sido removido do template — **usuário não recebia nenhuma confirmação/erro ao adicionar saldo** | Elemento `#wallet-status` (com `role="status"`) restaurado em `WalletDialog.js` |
| `wallet.test.js` (`aria-describedby`/ícone do título) | `aria-describedby="wallet-description"` sem elemento correspondente; ícone decorativo do título removido | `#wallet-description` e `.wallet-dialog__title-icon` restaurados, com CSS já existente (órfã) reaproveitada |

## 5. Acessibilidade

- **Teclado:** navegação por Tab/Shift+Tab e fechamento de menus com Escape cobertos por `keyboard.test.js`; diálogos (`admin-dialog`, `wallet-dialog`) usam `<dialog>` nativo, que já gerencia foco e captura de teclado.
- **Contraste:** **bug real encontrado e corrigido.** O commit mais recente do histórico ("style: refactoring stylesheet") colapsou toda a rampa de cores da marca (`--color-brand-100` a `--color-brand-700`) para um único valor (`#9a89e5`), derrubando o contraste de todo botão `.button-primary` (texto branco sobre a cor da marca) para 2.96:1 — abaixo do mínimo de 4.5:1 do WCAG AA. Restaurados os tons distintos que existiam antes desse commit, recuperando 5.70:1.
- **`aria-required-children`:** **bug real encontrado e corrigido.** Os pontos de navegação do carrossel de capturas de tela usavam `role="tablist"` sem filhos `role="tab"` (ARIA inválido). Trocado para `role="group"`.
- **Zoom:** layout em `rem`/`%` com `max-width` fluido; sem unidades fixas em `px` para tipografia.
- **`lang="pt-BR"`:** definido no HTML raiz do frontend.
- **Responsividade 360px/desktop:** breakpoints em `responsive.css` cobrindo mobile (até 480px), tablet (720px) e desktop; grid do carrinho e formulários administrativos colapsam para coluna única nesses pontos.
- Os dois bugs de `aria-labelledby`/`aria-describedby` quebrados no formulário de admin e na carteira (seção 4) também foram corrigidos como parte desta checagem.
- **Resultado mensurado:** Lighthouse Acessibilidade **100/100** em `/hub` e em `/game/:slug` após as correções acima (ver [`lighthouse-report.md`](./lighthouse-report.md)).

## 6. Relatório Lighthouse

Ver [`lighthouse-report.md`](./lighthouse-report.md): 3 execuções na página inicial (`/hub`) e em uma página interna (`/game/:slug`). Acessibilidade, boas práticas e SEO atingiram ≥ 90 (100/100/92). **Performance ficou abaixo da meta** (72 na home, 87 na página interna) — causa raiz é arquitetural (imagem de destaque só é descoberta pelo navegador depois que a SPA busca dados via JavaScript, um padrão inerente a client-side rendering sem SSR) e está documentada em detalhe no relatório, junto com a mitigação aplicada (hints de `preconnect`/`dns-prefetch`) e por que uma correção completa (pré-renderização) ficou fora do escopo desta rodada de correções.

## Concentração de commits

`git log --format='%an' | sort | uniq -c` mostra:

| Autor/alias | Commits |
| --- | --- |
| Davi Silva | 72 |
| meguito | 26 |
| davisilva | 7 |
| arthurMachado2501 | 10 |
| cadubellomo / CaduBellomo | 7 |

Os três aliases de Davi (`Davi Silva`, `meguito`, `davisilva` — mesma pessoa, configurações de Git diferentes entre máquinas/commits) somam 105 de 125 commits (84%), acima do limite de 70% da rubrica.

**Explicação para a banca:** o projeto usa uma SPA sem framework fortemente acoplada (roteador, store e serviços HTTP compartilhados por todas as páginas), então a maior parte da integração entre frontend e backend, infraestrutura Docker e documentação passou por Davi como ponto de integração — o que infla a contagem de commits sem refletir proporcionalmente a autoria de lógica de negócio. Arthur concentrou o desenvolvimento do backend/persistência (schema, entidades, regras de domínio como o fluxo de presentes) e Cadu prototipou a arquitetura de IA (GameBot); ambos os módulos são identificáveis por diretório (`backend/api` vs. `backend/python`) e por autor no histórico do Git, independentemente do número absoluto de commits.
