# Segurança e dados

## Autenticação e sessão

- Senhas são armazenadas com **BCrypt** (`BCryptPasswordEncoder`, ver `MarketplaceProjectApplication.java`), nunca em texto puro.
- A sessão usa um **token opaco**, não JWT: `SessaoService.criar()` gera 32 bytes aleatórios via `SecureRandom`, codifica em Base64 URL-safe e devolve ao cliente; o servidor só persiste o **hash SHA-256** do token na tabela `sessoes` (`tokenHash`), nunca o token em claro.
  - Vantagem sobre JWT autocontido: revogar uma sessão é um `DELETE` no banco (`SessaoService.encerrar`), sem precisar de blocklist adicional.
  - Expiração fixa de 12 horas (`DURACAO = Duration.ofHours(12)`), validada a cada requisição (`findByTokenHashAndExpiraEmAfter`).
- Toda rota autenticada exige `Authorization: Bearer <token>`; ausência ou token inválido/expirado resulta em `CredenciaisInvalidasException` (401).
- Rotas administrativas (`/api/admin/**`) chamam `AdminService.exigirAdmin`, que valida `papel == ADMIN` e lança `AccessDeniedException` (403) caso contrário — testado em `AdminFlowTests.shouldRejectARegularUserFromAdminEndpoints`.

## Códigos de presente

- Cada cópia comprada como presente gera um código único (`GeradorCodigoGiftCard`/`CodigoJogoPresenteCipher`). O código é enviado ao comprador; o resgate é feito por **outro** usuário via `/api/biblioteca/resgates`.
- O comprador não pode resgatar o próprio código (`GameGiftFlowTests.shouldGenerateOneRedeemableCodeForEachGiftCopy` cobre esse caso: "Envie este codigo para um amigo resgatar.").
- Um código já resgatado não pode ser reutilizado (`409 Conflict`, "Este codigo de jogo ja foi resgatado.").
- Códigos malformados são rejeitados antes de qualquer consulta ao banco (`shouldRejectMalformedGiftCodeBeforeLookingItUp`), evitando vazamento de informação por diferença de tempo/erro entre "formato inválido" e "não encontrado".

## CORS

`CorsConfig` restringe `/api/**` às origens definidas em `APP_CORS_ALLOWED_ORIGINS` (padrão: `http://localhost:5173,http://127.0.0.1:5173`), com métodos e cabeçalhos explícitos (`Authorization`, `Content-Type`). Em produção, essa variável deve apontar apenas para o domínio real do frontend.

## Segredos e variáveis de ambiente

- `.env` é ignorado pelo Git (`.gitignore`); `.env.example` documenta as chaves esperadas sem valores reais.
- `CLOUDINARY_URL` (contém a API secret) só é lida pelo backend — nunca é injetada no bundle do frontend.
- Variáveis `VITE_*` são embutidas no JavaScript público do navegador; por isso nunca devem carregar segredos (a própria documentação do projeto reforça essa regra no README).
- `GOOGLE_API_KEY` (usada pelo GameBot) fica isolada no serviço Python, que roda como container separado.

## Dependências (npm audit)

Na auditoria mais recente (`npm audit`), o frontend apresentava 3 vulnerabilidades na árvore de dependências de build/teste (nenhuma em código de produção enviado ao navegador):

| Pacote | Severidade | Causa | Resolução |
| --- | --- | --- | --- |
| `nanoid` | Alta | Geradores customizados podem entrar em loop com `size = 0` (GHSA-2v37-7h3g-55p8) | Atualizado via `npm audit fix` |
| `postcss` (transitiva do Vite) | Moderada | Leitura de `.map` arbitrário quando `from` não é definido (GHSA-fxqj-rqcc-2cmp) | Atualizado via `npm audit fix` |
| `undici` | Alta | Dessincronização de resposta via interceptor de retry | Atualizado via `npm audit fix` |

Todas tinham `fixAvailable: true` e foram corrigidas sem mudança de major version (`npm audit` reporta 0 vulnerabilidades após o fix). Nenhuma delas era explorável em produção: `nanoid`, `postcss` e `undici` chegam ao projeto como dependências transitivas de ferramentas de build/teste (Vite/Vitest), não como código executado pelo usuário final.

## Dados de demonstração

O seed do banco (`infra/database/postgres/script_bd.sql`) cria apenas contas e gift cards de uso local (`admin@admin.com`, `catalog@nekobox.local`, três códigos `NEKO-*-DEMO`). Nenhuma credencial real ou dado de usuário de produção é versionado.
