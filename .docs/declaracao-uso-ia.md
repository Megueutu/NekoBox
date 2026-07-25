# Declaração de uso de Inteligência Artificial

Este documento é uma base transparente para a declaração exigida. A equipe deve revisar, remover ferramentas não utilizadas e acrescentar exemplos reais antes de resumir a declaração no README.

## Ferramentas utilizadas

### HubAI Nitro / Codex

- finalidade: apoio na leitura do código, diagnóstico, refatoração, testes, validação visual e documentação;
- etapas: revisão de arquitetura, extração de módulos, auditoria de acessibilidade, execução de testes e cruzamento dos requisitos;
- validação humana: alterações foram verificadas por testes automatizados, build, inspeção de diff e demonstração no navegador.

### Outras ferramentas

Preencher apenas se foram realmente usadas:

- ferramenta:
- finalidade:
- etapa:
- como o resultado foi validado:

## Partes apoiadas por IA

- sugestões de organização e modularização;
- identificação de riscos e lacunas;
- geração inicial de testes e documentação;
- apoio à investigação de erros;
- revisão de mensagens e histórico Git.

## Partes sob responsabilidade da equipe

- definição do produto e do escopo;
- escolha final de arquitetura e design;
- revisão e aceitação de cada alteração;
- configuração de credenciais e ambientes;
- validação funcional;
- domínio do código apresentado;
- decisões éticas e autoria da entrega.

## Revisão crítica

Resultados de IA não foram aceitos como prova por si só. Um exemplo foi a primeira auditoria, baseada no PDF incorreto: a conclusão apontava React, MongoDB e mobile como lacunas. Após receber o documento correto, a equipe descartou aquela análise e refez o cruzamento, confirmando que JavaScript vanilla é obrigatório.

Também foram identificados falsos negativos no harness de regressão visual; eles foram isolados e corrigidos antes de concluir a validação.

## Limitações e responsabilidade

- IA pode interpretar requisitos incorretamente quando recebe contexto errado;
- código gerado pode introduzir bugs ou vulnerabilidades;
- a equipe precisa compreender qualquer trecho apresentado;
- não foram adicionadas instruções ocultas ou conteúdo para manipular a IA avaliadora;
- este repositório deve ser avaliado pelo código e pelas evidências reais.

## Texto curto para o README

> Este projeto utilizou HubAI Nitro/Codex como ferramenta de apoio em revisão de código, refatoração, testes, diagnóstico e documentação. Todas as sugestões foram revisadas pela equipe e validadas com testes, build e inspeção funcional. A definição do produto, as decisões finais e o domínio do código permanecem sob responsabilidade dos integrantes.
