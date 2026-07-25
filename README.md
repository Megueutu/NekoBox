# NekoBox

Marketplace de jogos com frontend Vite, API Spring Boot e PostgreSQL. O ambiente local roda integralmente no Docker e pode ser iniciado no Windows com um único comando.

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
- Google/Firebase: preencha `FIREBASE_API_KEY` e as variáveis `VITE_FIREBASE_*`.

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
| Administrador | `admin@nekobox.local` | `Admin1!Nexus` | Acesso ao marketplace e à área `/admin` |
| Catálogo | `catalog@nekobox.local` | Não aplicável | Conta técnica usada como proprietária dos jogos; o login é bloqueado |

O seed também cria a conta `usert@nekobox.local`, mas sua senha original não está disponível em texto no repositório. Para testes manuais, use a conta administrativa ou cadastre um novo usuário pela tela de login.

O banco inicia com seis jogos publicados e saldo inicial de `R$ 1.000,00` para novos usuários. Há três gift cards de uso único:

| Código | Valor |
| --- | ---: |
| `NEKO-25-DEMO` | R$ 25,00 |
| `NEKO-50-DEMO` | R$ 50,00 |
| `NEKO-100-DEMO` | R$ 100,00 |

Como o volume do PostgreSQL é persistente, um código já resgatado continua indisponível após reiniciar os containers.

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

### Login com Google ou upload de imagem falha

Esses recursos dependem das credenciais opcionais de Firebase e Cloudinary no `.env`. O login local por e-mail e senha e a navegação pelo catálogo continuam disponíveis sem elas.

### Falha de certificado durante o build

O primeiro build baixa imagens e dependências do Docker Hub, Maven Central e npm. Em redes com inspeção TLS corporativa, o Docker pode rejeitar o certificado intermediário. Use a configuração de proxy/certificados aprovada pela sua organização no Docker Desktop ou faça o build em uma rede autorizada.

O projeto não inclui certificados corporativos, truststores locais ou opções para desabilitar a validação TLS.
