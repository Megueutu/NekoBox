# Domínio e fluxos de negócio

## Catálogo

O Hub carrega todos os jogos via `GamesService.getAll()`. O primeiro item é usado como destaque da semana. A seção “Em Alta” exclui esse destaque, calcula a taxa de recomendações das avaliações, ordena descendentemente e exibe até cinco títulos.

O filtro de categoria compara `game.categories` por igualdade. A busca localiza o termo em título, descrição curta e tags. A tela de detalhes é acessada por `/game/:slug`; um slug inexistente produz uma tela de “Jogo não encontrado”.

## Compra

1. Usuário autenticado abre o detalhe de um jogo.
2. Se o jogo já estiver na biblioteca, a compra é bloqueada visualmente.
3. Se já estiver no carrinho, a interface oferece o link para `/cart`.
4. Caso contrário, `adicionarAoCarrinho` adiciona o jogo, impedindo duplicidade por `id`.
5. O carrinho soma os preços dos itens e exibe o total.
6. “Finalizar Compra” chama `finalizarCheckoutCarrinho`: itens que ainda não estão na biblioteca são copiados para ela e o carrinho é esvaziado.

No estado atual, essa etapa é uma simulação local. Não há criação de pedido, pagamento, estoque, recibo ou chamada a um backend.

## Lista de desejos

`alternarListaDesejos` funciona como toggle: o jogo entra se não existir e sai se já existir. Na página de wishlist, o usuário pode remover o item ou adicioná-lo ao carrinho. A ação de adicionar ao carrinho não remove automaticamente o item da wishlist.

## Biblioteca

A biblioteca contém os objetos de jogo transferidos pelo checkout. Não há licença, pedido ou data de aquisição modelados. O botão “Jogar Agora” leva ao detalhe do jogo; não existe integração com launcher ou download.

## Autenticação

Há três fluxos de interface:

- Login com e-mail e senha.
- Login com Google via Firebase quando configurado.
- Cadastro e recuperação de senha.

No modo mock, login/cadastro aceitam dados não vazios, cadastro exige senha com pelo menos seis caracteres e geram um token local. A confirmação de senha é validada na página. Ao autenticar, o usuário volta para `redirect_target` ou `/hub`.

Logout remove token e rota pendente, limpa usuário, carrinho, wishlist e biblioteca e volta ao Hub.

## Perfil

O usuário pode alterar username, bio e URL do avatar. O e-mail é somente leitura. A atualização modifica apenas o objeto em memória/persistência local; não há sincronização remota.
