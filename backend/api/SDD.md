# SDD — Marketplace Project (backend/api)

> Fonte de verdade das decisões técnicas do backend. Atualize este arquivo sempre que uma decisão de arquitetura mudar — não deixe o conhecimento só no código ou na cabeça de quem mexeu por último.

Última atualização: 2026-07-20 (revisão: catálogo de endpoints validado contra instância real — ver [API.md](API.md))

> Para o contrato de cada endpoint (parâmetros, corpo, resposta, códigos de erro) e o registro da bateria de testes executada contra a instância real, ver [API.md](API.md).

## 1. Visão geral

API REST em Spring Boot para um marketplace de jogos digitais: usuários compram/vendem produtos (jogos), com carrinho, checkout com saldo interno, biblioteca de jogos possuídos e avaliações. Upload de imagens (avatar e fotos de produto) vai para o Cloudinary. **Não há autenticação nem autorização nesta fase** — é um MVP simples; o único resquício de segurança é o hash de senha (`PasswordEncoder`). Toda restrição de acesso que existe é "só o dono pode alterar o que é dele" — não há papel de admin. Ver seção 5.

## 2. Stack e escolhas técnicas

| Área | Escolha | Motivo |
|---|---|---|
| Framework | Spring Boot 4.0.6 (`spring-boot-starter-webmvc`) | já definido no projeto |
| Persistência | Spring Data JPA + PostgreSQL (Aiven, remoto) | já definido no projeto |
| Autenticação/Autorização | **Nenhuma.** Sem JWT, sem sessão, sem `SecurityFilterChain`. Decisão explícita do usuário: MVP simples. | Ver seção 5. |
| Hash de senha | `BCryptPasswordEncoder` (único resquício de `spring-boot-starter-security`, instanciado manualmente como `@Bean` em `MarketplaceProjectApplication`) | as senhas **não eram hasheadas antes** (bug corrigido — ver seção 7); mantido mesmo sem login/JWT porque é sobre a senha ficar em texto puro no banco, não sobre autenticação |
| Upload de imagem | Cloudinary SDK `com.cloudinary:cloudinary-http5` 2.3.0 | pedido explicitamente pelo usuário |
| Identidade do usuário nas rotas | `@RequestParam Integer usuarioId` em toda rota que precisaria de "usuário logado" | substitui o principal do Spring Security; o chamador informa quem é a cada chamada (sem token/sessão) |
| Validação de entrada | Inline nos próprios Services, sem classe utilitária de validação | pedido explícito do usuário — `Util/validacao.java` foi apagada |
| DTOs | `record`s aninhados dentro de cada Controller (não há pacote `Dto`) | pedido explícito de "sem muito encapsulamento"; mantém o contrato HTTP colado ao controller que o usa |
| Erros HTTP | `GlobalExceptionHandler` único (`@RestControllerAdvice`) mapeando as exceções de domínio existentes | evita `try/catch` repetido em cada controller |
| Lazy loading em controllers | `spring.jpa.open-in-view` deixado no padrão (`true`) | permite navegar relações lazy (`produto.getUsuario().getNomeUsuario()`) direto no controller sem `LazyInitializationException`. Trade-off consciente: risco de N+1 silencioso: não resolvido nesta fase — ver seção 9 |

## 3. Estrutura de pacotes

```
Controller/   9 controllers REST (um por recurso do enunciado)
Service/      regras de negócio + validação inline (sem camada de validação separada)
Repository/   Spring Data JPA
Entity/       entidades JPA + Entity/Enuns (TipoFoto, StatusPagamento + converters)
Exception/    exceções de domínio + GlobalExceptionHandler
```

Não existe mais `Util/`. O arquivo `Util/validacao.java` foi apagado; toda validação (formato de email, senha, ids, normalização de texto/valores) foi movida para dentro do Service que a usa, como método privado quando repetida na própria classe.

## 4. Modelo de dados — alterações feitas no schema

O `script_bd.sql` (raiz do projeto) e as entidades JPA foram atualizados. **Estas colunas são novas e precisam ser aplicadas manualmente no banco Aiven remoto** (não há `ddl-auto=update` configurado em produção, de propósito — ver seção 9):

```sql
ALTER TABLE usuarios ADD COLUMN avatar_public_id TEXT;
ALTER TABLE fotos ADD COLUMN public_id TEXT;
```

Motivo:
- `usuarios.avatar_public_id` / `fotos.public_id`: o `public_id` do Cloudinary é obrigatório para poder apagar o asset remoto depois (`cloudinary.uploader().destroy(publicId)`). Sem guardar isso, um DELETE de avatar/foto só apagaria a linha do banco e deixaria o arquivo órfão no Cloudinary — exatamente o que o enunciado do usuário já alertava para fotos, e o mesmo problema existe para avatar.

Nenhuma tabela nova foi criada. Nenhuma coluna existente teve o tipo alterado. **Não existe mais `usuarios.is_admin`** — o conceito de admin foi removido do domínio inteiro a pedido do usuário (só dono pode alterar o que é dele, sem papel especial nenhum). A tabela `buscas` (histórico de busca/clique) também não existe mais no schema — a feature foi descontinuada e o `BuscaController`/`BuscaService`/`Entity.Busca` correspondentes foram removidos do código para não ficarem órfãos.

### Enum `TipoFoto` — nota de nomenclatura
O enunciado descreve `tipo=capa|screenshot`, mas o enum `TipoFoto` já existente no código (com converter JPA já plugado) usa `BANNER`, `POSTER`, `DEMO`. Optei por **manter os valores existentes** em vez de renomear, porque:
1. Já havia um `AttributeConverter` funcionando com esses valores.
2. Renomear é cosmético e não estava claro se o enunciado queria valores literais ou só estava dando exemplo.

Se o time preferir os nomes do enunciado, é uma troca mecânica em `TipoFoto.java` (e no converter) — sinalizando aqui para não passar despercebido.

## 5. Segurança (ou a ausência dela — decisão explícita)

**Não há JWT, sessão, filtro de autenticação nem `SecurityFilterChain`.** Decisão do usuário: é um MVP simples, sem essa camada por enquanto. O que existe hoje:

1. `POST /api/usuarios` cadastra e já grava a senha com hash BCrypt (`PasswordEncoder`, `@Bean` manual em `MarketplaceProjectApplication`).
2. `POST /api/auth/login` (email + senha) confere a senha com `PasswordEncoder.matches(...)` e devolve os dados do usuário (`usuarioId`, `nomeUsuario`, `email`) — **sem token nenhum**. É só uma checagem de credencial; o front guarda o `usuarioId` retornado e passa em toda chamada seguinte.
3. Toda rota que precisaria de "usuário logado" recebe `@RequestParam Integer usuarioId` — o chamador simplesmente informa quem ele é a cada requisição. Não há como o servidor validar que quem está mandando o `usuarioId` é realmente esse usuário; isso é aceito conscientemente para esta fase.
4. `spring-boot-starter-security` continua no `pom.xml` só para fornecer `BCryptPasswordEncoder`. Como isso normalmente faz o Spring Boot trancar **todas** as rotas atrás de HTTP Basic com uma senha aleatória gerada no log, `MarketplaceProjectApplication` exclui explicitamente as autoconfigurações que fariam isso:
   ```java
   @SpringBootApplication(exclude = {
       SecurityAutoConfiguration.class,
       UserDetailsServiceAutoConfiguration.class,
       ServletWebSecurityAutoConfiguration.class
   })
   ```
   Sem isso, a aplicação sobe com todo endpoint pedindo autenticação HTTP Basic — o oposto do que se quer aqui.
5. **Não existe conceito de admin.** Foi removido de propósito (a pedido do usuário) — não há coluna `is_admin`, nem papel, nem bypass nenhum. A única regra de autorização que existe é "dono do recurso": o Controller busca o `Usuario`/recurso pelo `usuarioId` recebido, compara com o dono (`produto.getUsuario().getId()`, `avaliacao.getUsuario().getId()`, etc.) e lança `org.springframework.security.access.AccessDeniedException` se não bater (mapeada para 403 pelo `GlobalExceptionHandler` — a classe é só reaproveitada pela conveniência do 403, não implica que o Spring Security esteja ativo). Esse helper `verificarDono` está duplicado em `ProdutoController`, `FotoController`, `PagamentoController` e `AvaliacaoController` — são poucas linhas cada, não vale uma classe/base controller só pra isso.
6. `CategoriaController` (`POST`/`DELETE /api/categorias`) não tem nenhuma checagem de dono nem de admin — categoria não pertence a ninguém no schema, então qualquer chamada pode criar/excluir categoria. Isso é uma consequência direta de não existir mais admin, não um esquecimento.

### Consequência direta (documentando o óbvio)
Qualquer chamada pode se passar por qualquer usuário só trocando o `usuarioId` na query string, inclusive pra editar/excluir produto, avaliação ou perfil de outra pessoa. Isso é aceitável **só** enquanto for MVP sem exposição real. Se/quando entrar autenticação de verdade, o ponto de entrada natural é trocar `@RequestParam Integer usuarioId` por algo derivado de uma sessão/token em cada controller — a lógica de negócio (dono do recurso) não muda, só de onde vem o `usuarioId`.

### Segredos
`application.properties` não tem mais nenhuma credencial hardcoded — só placeholders sem default: `spring.datasource.url=${BD_URL}`, `spring.datasource.username=${BD_ADMIN}`, `spring.datasource.password=${BD_SENHA}`, `cloudinary.url=${CLOUDINARY_URL}`. Sem essas variáveis definidas, a aplicação falha ao subir (fail-fast intencional).

Essas variáveis vêm de um arquivo `.env` na raiz do módulo (`backend/api/.env`, mesmo nível do `pom.xml`), **gitignorado** (`backend/api/.gitignore`). O Spring Boot não lê `.env` nativamente — em vez de puxar uma lib de terceiros (tentei `me.paulschwarz:spring-dotenv`, mas não conseguiu registrar corretamente contra o Spring Boot 4.0.6 desta versão do projeto; os placeholders continuavam sem resolver), existe `Config/DotenvEnvironmentPostProcessor` (`EnvironmentPostProcessor` registrado via `src/main/resources/META-INF/spring.factories`): lê `.env` linha a linha (`CHAVE=valor`, ignora comentários `#` e linhas vazias, tira aspas) e injeta como `PropertySource` de prioridade baixa (`addLast` — uma variável de ambiente real ou `-D` sempre vence se existir). Testado de ponta a ponta: subindo a aplicação de verdade, o Hikari conectou no Postgres do Aiven e o `CloudinaryService` construiu o client a partir do `.env` sem erro.

## 6. Regra de negócio do checkout (redesenhado)

O enunciado original tinha um fluxo em duas etapas (criar pagamento PENDENTE → aprovar depois). Isso não bate com a lista de endpoints pedida agora, que só tem `POST /api/pagamentos/checkout` (nenhum endpoint de aprovar/cancelar pagamento). Então o `PagamentoService` foi **redesenhado para ser tudo-ou-nada, dentro de uma única `@Transactional`**:

1. Soma o preço de todos os itens do carrinho.
2. Se `saldo do comprador < total` → `SaldoInsuficienteException` (402), nada é criado, carrinho intacto.
3. Senão, para cada item: debita o comprador, credita o vendedor, cria o `Pagamento` já com status `APROVADO`, chama `BibliotecaUsuarioService.adicionarProduto(...)` (reaproveitado — ele já validava "pagamento aprovado existe" antes de inserir na biblioteca).
4. Esvazia o carrinho.

Por que tudo-ou-nada: o próprio enunciado pede `@Transactional` cobrindo saldo + pagamento + biblioteca — isso só faz sentido como unidade atômica se for tudo aprovado ou nada. Checkout parcial (aprovar alguns itens e rejeitar outros por saldo) quebraria a ideia de transação única.

**Limitação conhecida:** não há lock pessimista (`SELECT ... FOR UPDATE`) no saldo do usuário durante o checkout. Em alta concorrência (dois checkouts do mesmo usuário ao mesmo tempo) existe uma janela teórica de race condition no saldo. O código anterior tentava resolver isso com `usuarioService.buscarPorIdParaAtualizacao(...)` e `pagamentoRepository.findByIdParaAtualizacao(...)` — **métodos que não existiam, o projeto não compilava**. Removi essa tentativa em vez de reconstruí-la, para não adicionar complexidade de locking sem necessidade real neste estágio (não há carga concorrente real ainda). Se isso importar depois, é adicionar `@Lock(LockModeType.PESSIMISTIC_WRITE)` no `findById` de `UsuarioRepository`.

## 7. Bugs corrigidos (o projeto não compilava antes)

1. `PagamentoService` chamava `usuarioService.buscarPorIdParaAtualizacao(...)` — método inexistente.
2. `PagamentoService` chamava `pagamentoRepository.findByIdParaAtualizacao(...)` — método inexistente.
3. `AvaliacaoService` tinha `private final validacao validacao;` — `validacao` não era um bean Spring (construtor privado, sem `@Component`), então a injeção de dependência quebrava o contexto do Spring assim que esse service fosse instanciado.
4. `AvaliacaoService.atualizarAvaliacao` recebia `Short nota` enquanto a entidade usa `double nota` — inconsistente com `criarAvaliacao` (que usa `double`). Unificado para `double` nos dois.
5. Senhas eram salvas **em texto puro** (`usuario.setSenha(usuario.getSenha().trim())`, sem hash). Corrigido com `BCryptPasswordEncoder`.
6. `BibliotecaUsuarioService.atualizarTempoJogo` **sobrescrevia** `tempoJogoMinutos` em vez de incrementar, apesar do endpoint pedido ser "incrementar tempo jogado". Renomeado para `incrementarTempoJogo`, agora soma.
7. `GET /api/produtos` (sem `titulo` informado) devolvia 500 contra o Postgres real: `LOWER(CONCAT('%', ?, '%'))` com `?` nulo era inferido como `bytea` pelo driver, e `lower(bytea)` não existe no Postgres. Corrigido adicionando `CAST(:titulo AS string)` na query de `ProdutoRepository.buscar(...)`. Só apareceu ao testar contra Postgres de verdade — o teste automatizado (`contextLoads`, H2) nunca executava essa query. Achado e corrigido durante a bateria de testes — ver API.md.

## 8. Métodos/fluxos removidos (código morto)

Removidos porque nenhum endpoint da lista pedida os usa, e o pedido foi explícito ("o que não for usado deve ser apagado"):

- `UsuarioService`: `adicionarSaldo`, `excluirUsuario`, `atualizarUsuario` (genérico, virou `atualizarPerfil` só com nome/bio), `buscarPorNomeUsuario`.
- `ProdutoService`: `listarPorUsuario`, `listarPorCategoria` (o filtro por categoria virou parte de `listar(...)` paginado), a sobrecarga `buscarPorId(usuarioId, produtoId)` que registrava busca como efeito colateral de todo GET de detalhe (esse acoplamento foi quebrado — na época virou `POST /api/buscas` explícito; hoje esse endpoint nem existe mais, ver o item sobre `Busca` mais abaixo).
- `CategoriaService`: `atualizarCategoria` (não existe PUT categoria no enunciado), `buscarPorNome`.
- `CarrinhoService`: `criarCarrinho` e `buscarCarrinhoDoUsuario` eram **cópias idênticas** de `obterOuCriarCarrinho` — consolidado em um método só.
- `FotoService`: `definirTipo` (não existe endpoint pra trocar tipo de foto isolado).
- `PagamentoService`: `criarPagamento`, `criarPagamentosDoCarrinho`, `aprovarPagamento`, `cancelarPagamento`, `consultarPorUsuarioEProduto` — todos substituídos pelo fluxo único `checkout(...)` (seção 6).
- `AvaliacaoRepository`: `findByUsuario_Id` (usado só por `listarPorUsuario`, removido), `findByUsuario_IdAndProduto_Id` (já estava sem uso antes até).
- `PagamentoRepository`: `findTopByUsuario_IdAndProduto_IdOrderByIdDesc` (usado só pelo método removido acima).
- `Entity.Busca`, `Service.BuscaService`, `Repository.BuscaRepository`, `Controller.BuscaController`: a tabela `buscas` saiu do schema, então a feature inteira de histórico de busca/clique foi removida do código (não fazia mais sentido manter um controller apontando para uma entidade que não existe).
- Todo o conceito de admin: coluna `usuarios.is_admin`, campo `Usuario.admin`, e as checagens `usuario.isAdmin()` em `ProdutoController`, `FotoController`, `CategoriaController` e `PagamentoController` — a pedido do usuário, "apenas o dono pode alterar seus produtos e perfil", sem papel de administrador nesta fase.

Se alguma dessas capacidades for necessária no futuro (ex: usuário recarregar saldo, excluir a própria conta), é reintroduzir o método no service + o endpoint correspondente — o schema já suporta.

## 9. Pontos em aberto / riscos conhecidos

- ~~Credenciais do banco em texto puro no `application.properties`~~ **Resolvido.** `application.properties` só tem `${BD_URL}`/`${BD_ADMIN}`/`${BD_SENHA}`/`${CLOUDINARY_URL}` (sem default), carregados de `backend/api/.env` (gitignorado) via `spring.config.import=optional:file:.env[.properties]`. A senha antiga que ficou exposta no histórico do git continua exposta nesse histórico — rotacionar no Aiven ainda é recomendado, mas não é mais urgente para o estado atual do arquivo.
- **Migração de schema é manual.** `spring.jpa.hibernate.ddl-auto` não está setado para o datasource real (Postgres), então nada roda automaticamente contra o Aiven. Rode o `ALTER TABLE` da seção 4 (ou o `script_bd.sql` atualizado, se for banco novo) antes de subir esta versão.
- **`spring.jpa.open-in-view=true` (padrão).** Convém para simplicidade agora, mas mascara N+1 queries. Se a listagem de produtos ficar lenta, é o primeiro lugar a olhar (trocar para DTO projection via JPQL).
- **Sem paginação em avaliações, biblioteca, histórico de pagamentos.** O enunciado não pediu, não implementei — mas em produção essas listas crescem.
- **Sem autenticação/autorização real.** Qualquer chamada informa `usuarioId` livremente, sem prova de identidade — ver seção 5. Decisão explícita para este MVP, não é descuido.
- **`TipoFoto` usa banner/poster/demo, não capa/screenshot** — ver seção 4.
- **`avaliacoes.nota` trunca casas decimais.** Coluna `SMALLINT` no banco, tipo `double` no código/JSON — enviar `4.5` é aceito e vira `4` silenciosamente. Achado durante a bateria de testes (ver API.md). Não corrigido — decidir entre `NUMERIC(2,1)` no schema ou restringir a API a inteiros.

## 10. Endpoints implementados

Resumo (ver os Controllers para o contrato exato de request/response — os DTOs são `record`s aninhados em cada classe). Endpoints marcados com 🔒 exigem `usuarioId` do dono do recurso; os demais são abertos (qualquer `usuarioId` válido, ou nem isso):

| Recurso | Controller | Endpoints |
|---|---|---|
| Usuários | `UsuarioController` | POST /api/usuarios · GET /api/usuarios/{id} · GET /api/usuarios/me 🔒 · PUT /api/usuarios/me 🔒 · PATCH /api/usuarios/me/senha 🔒 · POST /api/usuarios/me/avatar 🔒 (multipart) · DELETE /api/usuarios/me/avatar 🔒 |
| Auth | `AuthController` | POST /api/auth/login |
| Produtos | `ProdutoController` | GET /api/produtos (paginado, filtros titulo/categoriaId/precoMinimo/precoMaximo) · GET /api/produtos/{id} · POST /api/produtos · PUT /api/produtos/{id} 🔒 · DELETE /api/produtos/{id} 🔒 |
| Categorias em produto | `ProdutoController` | POST /api/produtos/{id}/categorias/{categoriaId} 🔒 (dono do produto) · DELETE /api/produtos/{id}/categorias/{categoriaId} 🔒 (dono do produto) |
| Fotos | `FotoController` | POST /api/produtos/{id}/fotos 🔒 (dono do produto, multipart) · DELETE /api/produtos/{id}/fotos/{fotoId} 🔒 (dono do produto) |
| Categorias | `CategoriaController` | GET /api/categorias · POST /api/categorias (aberto) · DELETE /api/categorias/{id} (aberto) |
| Carrinho | `CarrinhoController` | GET /api/carrinho 🔒 · POST /api/carrinho/itens 🔒 · DELETE /api/carrinho/itens/{produtoId} 🔒 · DELETE /api/carrinho 🔒 |
| Pagamento | `PagamentoController` | POST /api/pagamentos/checkout 🔒 · GET /api/pagamentos 🔒 · GET /api/pagamentos/{id} 🔒 (só o comprador) |
| Biblioteca | `BibliotecaController` | GET /api/biblioteca 🔒 · PATCH /api/biblioteca/{produtoId}/tempo-jogo 🔒 (incrementa) |
| Avaliações | `AvaliacaoController` | GET /api/produtos/{id}/avaliacoes · POST /api/produtos/{id}/avaliacoes 🔒 (exige produto na biblioteca) · PUT /api/avaliacoes/{id} 🔒 (só o autor) · DELETE /api/avaliacoes/{id} 🔒 (só o autor) |

O recurso de Buscas (histórico/analytics) foi removido do enunciado e do código — ver seção 4 e 8.

Fluxo Cloudinary (avatar e foto de produto) segue exatamente o descrito pelo usuário: o Controller recebe o `MultipartFile`, chama `CloudinaryService.upload(arquivo, pasta)`, e salva `url` + `publicId` retornados. No DELETE, o Controller busca a entidade primeiro para pegar o `publicId`, chama `CloudinaryService.remover(publicId)`, e só depois apaga a linha do banco.

## 11. Onde o projeto parou / próximos passos

**Feito nesta rodada:**
- Services e entidades revisados, `Util/validacao.java` apagada, validação movida para dentro de cada Service.
- Bugs de compilação corrigidos (seção 7).
- Métodos mortos removidos (seção 8).
- Dependências de Cloudinary adicionadas (JWT foi adicionado numa primeira rodada e depois removido — ver abaixo).
- `CloudinaryService` completo.
- `GlobalExceptionHandler` completo.
- Todos os 9 grupos de Controllers criados, cobrindo a lista de endpoints do enunciado.
- **Revisão 1:** JWT e Spring Security removidos a pedido do usuário (MVP simples). Identidade do usuário agora é `@RequestParam Integer usuarioId` em toda rota que precisa saber "quem está chamando"; `PasswordEncoder` (BCrypt) é o único resquício de segurança que ficou (ver seção 5).
- **Revisão 2:** conceito de admin removido por completo (coluna, campo, checagens) — a pedido do usuário, só dono pode alterar produto/perfil/avaliação. `CategoriaController` ficou sem nenhuma restrição de acesso (categoria não é de ninguém). Feature de Buscas (histórico/clique) também saiu, junto com a tabela `buscas` do schema.
- Projeto compila (`mvn compile`) e o contexto Spring sobe limpo em teste automatizado (`mvn test`, com H2).

**Não feito / próximo passo lógico:**
1. Rodar o `ALTER TABLE` da seção 4 contra o Postgres real do Aiven (ou recriar o schema com o `script_bd.sql` atualizado, se for ambiente novo).
2. Definir `CLOUDINARY_URL` real no ambiente (dev/prod) — sem isso a aplicação não sobe fora dos testes.
3. Testar manualmente (ou escrever testes de integração `@SpringBootTest` + `MockMvc`) os fluxos ponta-a-ponta: cadastro → login → criar produto → upload de foto → adicionar ao carrinho → checkout → biblioteca → avaliação. Nada disso tem teste automatizado ainda além do `contextLoads()` que já existia.
4. Decidir sobre os pontos da seção 9 (credenciais no git, paginação, ausência de autenticação real) — não bloqueiam o funcionamento, mas valem uma conversa antes de produção.
5. Quando (se) entrar autenticação de verdade, trocar `@RequestParam Integer usuarioId` pelo mecanismo escolhido em cada controller — a lógica de negócio de dono do recurso não muda.
