# Lacunas e evolução planejada

Este arquivo separa o que já está implementado do que será necessário para transformar o protótipo em marketplace real.

## Backend e persistência

- Substituir `mockGames` por `GamesService` baseado em API.
- Persistir perfil, wishlist, carrinho, biblioteca e pedidos por usuário.
- Definir paginação, filtros e busca no servidor para catálogos maiores.
- Criar adaptadores/normalizadores para manter o contrato das páginas estável.

## Checkout real

- Criar pedido com snapshot de preço e itens.
- Integrar provedor de pagamento no backend.
- Modelar estados como `pending`, `paid`, `failed`, `refunded` e `cancelled`.
- Só conceder licença na confirmação do pagamento; o botão atual concede acesso imediatamente.
- Tratar idempotência, duplicidade e concorrência.

## Autenticação e segurança

- Trocar mocks de login, cadastro e recuperação por chamadas reais.
- Validar token no backend e restaurar a sessão ao recarregar a página.
- Não usar `fbUser.accessToken` como se fosse necessariamente um token de API sem definir o contrato de autenticação.
- Escapar texto e validar URLs antes de interpolá-los em `innerHTML` e `style`, principalmente dados vindos de usuários ou APIs.

## Catálogo e conteúdo

- Definir permissões para `owner_id`, desenvolvedor, publicador e administrador.
- Validar `status` antes de exibir o jogo.
- Modelar preços, moeda, promoções, disponibilidade regional e impostos.
- Definir moderação de reviews, votos e atualizações.

## Experiência e qualidade

- Adicionar estados de erro e retry específicos para cada serviço.
- Testar regras de store, serviços e fluxos de autenticação além do roteador.
- Garantir fallback de imagens sem depender de serviço externo em produção.
- Substituir a navegação por `innerHTML` por uma estratégia com escaping/DOM seguro caso o conteúdo remoto seja confiável apenas parcialmente.
- Monitorar acessibilidade por teclado e leitor de tela nos componentes que usam `role="img"` e backgrounds.
