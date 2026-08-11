# Declaração de uso de Inteligência Artificial

## Ferramentas utilizadas

- **Claude Code (Anthropic)** — utilizado na reta final da entrega para: corrigir o erro de compilação do backend (`import` ausente em `AdminService.java`), implementar o controle de quantidade no carrinho de presentes no frontend (fluxo "Comprar de presente" + stepper de quantidade), corrigir um teste de integração com dependência de ordenação (`AdminFlowTests`), diagnosticar a falha da suíte Vitest (incompatibilidade do `jsdom` com uma versão de Node muito recente instalada localmente) e redigir esta documentação de entrega.

Observação: A ferramenta foi utilizada de maneira consciente e formal. Não passamos pelo débito cognitivo com seu uso, e é muito importante deixar claro que todos os 4 integrantes do grupo, se comprometeram com o constante uso consciente, não como forma de implementação, mas como ferramenta de auxílio e agilidade em uma reta final tão importante.

## O que foi gerado com apoio de IA

- Testes unitários
- Documentos de entrega na pasta `.docs/` (matriz de requisitos, execução e validação, arquitetura, segurança, este arquivo e o roteiro do pitch).

## O que **não** foi gerado por IA

- As decisões de domínio e regra de negócio (ex.: compra pessoal unitária, mecanismo de código de presente resgatável uma única vez) já existiam implementadas e testadas no backend antes desta sessão; o trabalho de IA nesta etapa foi **expor no frontend** uma funcionalidade que já estava pronta e coberta por testes no backend (`GameGiftFlowTests`), não inventá-la.
- A arquitetura geral do projeto (SPA sem framework com roteador próprio, camadas Controller/Service/Repository/Entity no backend, separação de serviços via Docker Compose).
- Decisões de negócios e internas
- Cloudinary completo, com todas as inserções de imagens feitas manualmente

## Processo de validação

Todo código sugerido por IA foi revisado antes de ser aceito:

1. **Backend**: compilação (`mvn compile`) e suíte completa (`mvn test`, 24 testes na versão desse documento) executadas e confirmadas verdes após cada mudança.
2. **Frontend**: testes novos/alterados executados dentro de um container Docker com Node 22 (a versão-alvo do projeto, definida no `Dockerfile`), já que a máquina de desenvolvimento local tinha uma versão de Node mais recente incompatível com o `jsdom` usado pela suíte.
3. **Inspeção manual de diff** de cada arquivo alterado antes de prosseguir.

Produto, decisões finais de escopo e domínio do código permanecem sob responsabilidade da equipe.
