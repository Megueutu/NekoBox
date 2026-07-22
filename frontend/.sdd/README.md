# SDD do NekoBox

O NekoBox é um marketplace de jogos digitais. A aplicação permite navegar pelo catálogo, consultar detalhes de um jogo, autenticar-se, salvar títulos na lista de desejos, montar um carrinho e visualizar uma biblioteca pessoal.

Esta documentação descreve o comportamento observado no frontend atual. Quando algo ainda é apenas uma expectativa para uma API futura, isso é indicado explicitamente.

## Índice

- [Arquitetura](./arquitetura.md)
- [Domínio e fluxos](./dominio-e-fluxos.md)
- [Contratos de dados](./contratos-de-dados.md)
- [Configuração e execução](./configuracao.md)
- [Design system visual](./design-system-visual.md)
- [Lacunas e evolução](./lacunas-e-evolucao.md)

## Estado atual em uma frase

É uma SPA (Single Page Application) em JavaScript vanilla, compilada pelo Vite, que renderiza HTML por templates, usa um store observável próprio e executa autenticação e catálogo com Firebase/mocks.

## Termos do domínio

- **Jogo**: produto digital publicado no catálogo.
- **Catálogo**: conjunto de jogos disponíveis para consulta e compra.
- **Lista de desejos**: coleção local de jogos que o usuário deseja acompanhar.
- **Carrinho**: coleção local de jogos que o usuário pretende comprar.
- **Biblioteca**: coleção local de jogos adquiridos pelo usuário.
- **Usuário**: identidade autenticada que possui as áreas privadas.
