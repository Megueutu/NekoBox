# Relatório Lighthouse

Auditoria executada em 24/07/2026 com Lighthouse `13.4.0`, Chrome em modo headless/anônimo, perfil Desktop e apenas a categoria Acessibilidade. Cada página recebeu três execuções consecutivas; os relatórios JSON brutos estão versionados em [`lighthouse`](./lighthouse).

## Página principal — `/`

| Execução | Data e hora (BRT) | Score | Evidência |
| --- | --- | ---: | --- |
| 1 | 24/07/2026 23:24:02 | 100 | [`home-1.json`](./lighthouse/home-1.json) |
| 2 | 24/07/2026 23:24:29 | 100 | [`home-2.json`](./lighthouse/home-2.json) |
| 3 | 24/07/2026 23:24:29 | 100 | [`home-3.json`](./lighthouse/home-3.json) |
| **Mediana** | — | **100** | — |

## Página interna — `/game/cyberpunk-2077`

| Execução | Data e hora (BRT) | Score | Evidência |
| --- | --- | ---: | --- |
| 1 | 24/07/2026 23:24:29 | 100 | [`game-1.json`](./lighthouse/game-1.json) |
| 2 | 24/07/2026 23:24:30 | 100 | [`game-2.json`](./lighthouse/game-2.json) |
| 3 | 24/07/2026 23:24:31 | 100 | [`game-3.json`](./lighthouse/game-3.json) |
| **Mediana** | — | **100** | — |

## Resultado

As duas páginas superaram o mínimo de 90 pontos. O Lighthouse classifica `label-content-name-mismatch` como auditoria manual sem peso e sem itens concretos na página; ela permanece registrada nos JSON, sem ocultação.

## Protocolo reproduzível

```bash
npx --yes lighthouse@13.4.0 http://localhost:5173/ \
  --only-categories=accessibility \
  --preset=desktop \
  --chrome-flags="--headless --no-sandbox --disable-gpu" \
  --output=json
```

Repetir três vezes para `/` e para `/game/cyberpunk-2077`.

## Checklist manual complementar

- [x] imagens principais possuem texto alternativo ou nome acessível;
- [x] foco visível coberto por CSS e testes automatizados;
- [x] HTML declara `lang="pt-BR"`;
- [x] checkout possui labels, erros acessíveis e foco no primeiro campo inválido;
- [x] mediana Lighthouse ≥90;
- [ ] registrar medição de contraste no WebAIM;
- [ ] registrar navegação presencial de carrinho e checkout sem mouse;
- [ ] registrar teste de zoom a 200%;
- [ ] registrar teste com filtro de daltonismo;
- [ ] anexar capturas da interface do Lighthouse executado em sala.
