# Declaração de uso de Inteligência Artificial

## Ferramentas utilizadas

- **HubAI Nitro/Codex** — apoio contínuo ao longo do desenvolvimento: revisão de código, refatoração, testes, diagnóstico e documentação (conforme já indicado no README).
- **Claude Code (Anthropic)** — utilizado na reta final da entrega para: corrigir o erro de compilação do backend (`import` ausente em `AdminService.java`), implementar o controle de quantidade no carrinho de presentes no frontend (fluxo "Comprar de presente" + stepper de quantidade), corrigir um teste de integração com dependência de ordenação (`AdminFlowTests`), diagnosticar a falha da suíte Vitest (incompatibilidade do `jsdom` com uma versão de Node muito recente instalada localmente) e redigir esta documentação de entrega.

## O que foi gerado com apoio de IA

- Trechos de código de UI (botão "Comprar de presente" em `GamePage.js`, stepper de quantidade em `CartPage.js` e seu CSS) e do teste de integração correspondente em `cart-page.test.js`.
- Ajuste do teste `AdminFlowTests.shouldUploadAndPersistAdminGameMedia`, que assumia incorretamente que a mídia recém-enviada seria sempre o primeiro item da auditoria de catálogo.
- O texto desta pasta `.docs/` (matriz de requisitos, execução e validação, arquitetura, segurança, este arquivo e o roteiro do pitch).

## O que **não** foi gerado por IA

- As decisões de domínio e regra de negócio (ex.: compra pessoal unitária vs. presente com quantidade 1–10, mecanismo de código de presente resgatável uma única vez) já existiam implementadas e testadas no backend antes desta sessão; o trabalho de IA nesta etapa foi **expor no frontend** uma funcionalidade que já estava pronta e coberta por testes no backend (`GameGiftFlowTests`), não inventá-la.
- A arquitetura geral do projeto (SPA sem framework com roteador próprio, camadas Controller/Service/Repository/Entity no backend, separação de serviços via Docker Compose).

## Processo de validação

Todo código sugerido por IA foi revisado antes de ser aceito:

1. **Backend**: compilação (`mvn compile`) e suíte completa (`mvn test`, 24 testes) executadas e confirmadas verdes após cada mudança.
2. **Frontend**: testes novos/alterados executados dentro de um container Docker com Node 22 (a versão-alvo do projeto, definida no `Dockerfile`), já que a máquina de desenvolvimento local tinha uma versão de Node mais recente incompatível com o `jsdom` usado pela suíte.
3. **Inspeção manual de diff** de cada arquivo alterado antes de prosseguir.

Produto, decisões finais de escopo e domínio do código permanecem sob responsabilidade da equipe.
