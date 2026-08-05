# NekoBox

Marketplace de jogos digitais desenvolvido como MVP da disciplina Desenvolvimento de Aplicações Dinâmicas. O produto reúne catálogo, busca, detalhes, carrinho persistente, checkout simulado, biblioteca, presentes digitais, autenticação e administração.

## Stack e arquitetura

- frontend: JavaScript vanilla, ES Modules, Vite, Tailwind CSS e CSS próprio;
- backend: Java 21, Spring Boot, Spring MVC e Spring Data JPA;
- banco: PostgreSQL 16;
- ambiente: Docker e Docker Compose;
- testes: Vitest no frontend e JUnit/Spring MockMvc no backend;
- integrações opcionais: Cloudinary para mídias e GameBot com Google AI.

```text
Navegador → SPA JavaScript → API REST Spring Boot → PostgreSQL
```

O frontend é uma SPA com roteador próprio, páginas carregadas por import dinâmico, store observável e serviços HTTP. A API separa controllers, services, repositories e entities. Mais detalhes estão em [`.docs/arquitetura-e-pontos-chave.md`](./.docs/arquitetura-e-pontos-chave.md).

## Funcionalidades

- catálogo dinâmico com oito produtos no seed;
- busca por texto e filtro por categoria;
- detalhes com imagens, descrição, preço, requisitos, idiomas e avaliações;
- carrinho persistido para usuário autenticado;
- compra pessoal unitária e presentes com quantidade de 1 a 10;
- checkout acessível com validação e confirmação;
- códigos de presente protegidos, consultáveis pelo comprador e resgatáveis na biblioteca;
- wishlist e biblioteca;
- perfil, preferências de acessibilidade e sessão persistente;
- área administrativa para usuários, produtos, mídias e gift cards.

## Pré-requisitos

Instale o Git e o Docker Desktop com Docker Compose v2. Java, Maven, Node.js e PostgreSQL não precisam estar instalados no Windows.

Abra o Docker Desktop e aguarde o engine ficar disponível. Depois, confirme:

```powershell
docker --version
docker compose version
```

## Configuração inicial

Clone o repositório, entre na pasta e crie o arquivo local de variáveis:

```powershell
git clone <URL_DO_REPOSITORIO>
cd marketplace-project
Copy-Item .env.example .env
```

No Prompt de Comando, use `copy .env.example .env` no lugar do `Copy-Item`.

O `.env` é ignorado pelo Git. Os valores de exemplo permitem executar o catálogo e o login local, mas as integrações externas exigem credenciais próprias:

- Cloudinary: substitua `CLOUDINARY_URL` e `VITE_CLOUDINARY_CLOUD_NAME`;
- GameBot: preencha `GOOGLE_API_KEY` e mantenha `VITE_CHATBOT_API_URL` apontando para o serviço Python.

`CLOUDINARY_URL` contém o segredo da API e é enviada somente ao backend. Variáveis `VITE_*` são incorporadas ao JavaScript público do navegador e nunca devem conter senhas ou `API_SECRET`.

## Executar com um comando

Na raiz do projeto:

```powershell
docker compose up --build -d
```

O Compose constrói as imagens, inicializa os serviços na ordem correta e aguarda os healthchecks. Confira o resultado:

```powershell
docker compose ps
```

Serviços locais:

| Serviço | Endereço |
| --- | --- |
| Frontend | `http://localhost:5173` |
| API | `http://localhost:8080` |
| PostgreSQL | `localhost:5433` |

As portas podem ser alteradas em `.env` por meio de `FRONTEND_PORT`, `API_PORT` e `POSTGRES_PORT`. Se mudar a porta da API ou do frontend, ajuste também `VITE_API_BASE_URL` e `APP_CORS_ALLOWED_ORIGINS`.

Para acompanhar a inicialização:

```powershell
docker compose logs -f
```

Use `Ctrl+C` para sair dos logs sem encerrar os containers.

## Usuários e dados de demonstração

As credenciais abaixo existem apenas no ambiente local:

| Perfil | E-mail | Senha | Observação |
| --- | --- | --- | --- |
| Administrador | `admin@admin.com` | `Batata123` | Acesso ao marketplace e à área `/admin` |
| Catálogo | `catalog@nekobox.local` | Não aplicável | Conta técnica usada como proprietária dos jogos; o login é bloqueado |

O seed também cria a conta `usert@nekobox.local`, mas sua senha original não está disponível em texto no repositório. Para testes manuais, use a conta administrativa ou cadastre um novo usuário pela tela de login.

O banco inicia com oito jogos publicados e saldo inicial de `R$ 1.000,00` para novos usuários. Há três gift cards de uso único:

| Código | Valor |
| --- | ---: |
| `NEKO-25-DEMO` | R$ 25,00 |
| `NEKO-50-DEMO` | R$ 50,00 |
| `NEKO-100-DEMO` | R$ 100,00 |

Como o volume do PostgreSQL é persistente, um código já resgatado continua indisponível após reiniciar os containers.

## API e banco

Principais recursos REST:

| Domínio | Rotas |
| --- | --- |
| Autenticação | `/api/auth` |
| Usuários e perfil | `/api/usuarios` |
| Catálogo | `/api/games`, `/api/produtos`, `/api/categorias` |
| Carrinho | `/api/carrinho` |
| Checkout e pagamentos | `/api/pagamentos` |
| Biblioteca e presentes | `/api/biblioteca` |
| Wishlist | `/api/wishlist` |
| Administração | `/api/admin` |

O schema versionado está em [`infra/database/postgres/script_bd.sql`](./infra/database/postgres/script_bd.sql). Ele cria usuários, produtos, mídias, categorias, carrinho, pagamentos, biblioteca, avaliações, sessões, gift cards e códigos de jogos-presente, incluindo chaves, relacionamentos, índices e restrições.

## Testes locais opcionais

Os testes também podem ser executados fora do Docker se Java 21 e Node.js 22 estiverem instalados.

Backend no PowerShell:

```powershell
cd backend\api
.\mvnw.cmd test
```

Frontend:

```powershell
cd frontend
npx vitest run
npm run build
```

## Equipe

As identidades e responsabilidades abaixo foram levantadas a partir dos arquivos alterados no histórico Git. A equipe deve apenas confirmar a grafia dos nomes antes da apresentação.

| Integrante/identidade | Atuação observada |
| --- | --- |
| Davi Silva (`meguito`/`davisilva`) | frontend, integração, infraestrutura e documentação |
| Arthur Machado (`arthurMachado2501`) | backend e persistência |
| Cadu Bellomo | prototipação da arquitetura de IA |

## Uso de Inteligência Artificial

Este projeto utilizou HubAI Nitro/Codex como apoio em revisão de código, refatoração, testes, diagnóstico e documentação. Todas as sugestões foram revisadas e validadas com testes, build, inspeção de diff e verificação funcional. Produto, decisões finais e domínio do código permanecem sob responsabilidade da equipe.

A declaração detalhada está em [`.docs/declaracao-uso-ia.md`](./.docs/declaracao-uso-ia.md).

## Documentação da entrega

- [matriz de conformidade](./.docs/matriz-requisitos.md);
- [execução e validação](./.docs/execucao-e-validacao.md);
- [relatório Lighthouse](./.docs/lighthouse-report.md);
- [roteiro do pitch em PDF](./.docs/roteiro-pitch.pdf);
- [fonte editável do roteiro](./.docs/roteiro-pitch.md);
- [segurança e dados](./.docs/seguranca-e-dados.md).

## Encerrar o ambiente

```powershell
docker compose down
```

Esse comando remove os containers e preserva os dados do PostgreSQL no volume Docker. Não use `docker compose down -v` se quiser manter usuários, jogos e gift cards.

## Solução de problemas

### `docker compose` não é reconhecido

Confirme que o Docker Desktop está instalado, aberto e atualizado. O projeto usa Compose v2 (`docker compose`, sem hífen).

### Porta já está em uso

As portas padrão são:

- `5173`: frontend;
- `8080`: API;
- `5433`: PostgreSQL no host.

Encerre o processo que ocupa a porta ou altere `FRONTEND_PORT`, `API_PORT` ou `POSTGRES_PORT` no `.env`.

### API não conecta ao banco

Confira se o container está saudável:

```powershell
docker compose ps
docker compose logs postgres
```

Dentro do Compose, `BD_URL`, `BD_ADMIN` e `BD_SENHA` são derivados das variáveis `POSTGRES_*`. Não troque `localhost` pelo nome do container manualmente: o Compose já configura a API para acessar `postgres:5432`.

### Alterações no seed não aparecem

Reconstrua e reinicie apenas o serviço do banco:

```powershell
docker compose up --build -d postgres
```

O script de seed é idempotente e roda a cada inicialização do container, sem apagar o volume.

### GameBot ou upload de imagem falha

O GameBot depende de `GOOGLE_API_KEY` e o upload de imagem depende das credenciais opcionais do Cloudinary no `.env`. O login local por e-mail e senha e a navegação pelo catálogo continuam disponíveis sem elas.

### Falha de certificado durante o build

O primeiro build baixa imagens e dependências do Docker Hub, Maven Central e npm. Em redes com inspeção TLS corporativa, o Docker pode rejeitar o certificado intermediário. Use a configuração de proxy/certificados aprovada pela sua organização no Docker Desktop ou faça o build em uma rede autorizada.

O projeto não inclui certificados corporativos, truststores locais ou opções para desabilitar a validação TLS.
