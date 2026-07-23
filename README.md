# NekoBox

Marketplace de jogos com frontend em Vite, API Spring Boot e PostgreSQL. Este guia descreve como executar o ambiente local no Windows usando PowerShell ou Prompt de Comando.

## Pré-requisitos

Instale:

- Git;
- Docker Desktop com Docker Compose v2;
- Java 21;
- Node.js 22 LTS com npm.

Não é necessário instalar Maven: o projeto inclui o Maven Wrapper para Windows (`mvnw.cmd`).

Antes de continuar, abra o Docker Desktop e aguarde o engine ficar disponível. Confirme as instalações:

```powershell
docker --version
docker compose version
java -version
node --version
npm --version
```

## Configuração inicial

Clone o repositório, entre na pasta do projeto e crie o arquivo local de variáveis:

```powershell
git clone <URL_DO_REPOSITORIO>
cd marketplace-project
Copy-Item .env.example .env
```

No Prompt de Comando, substitua a última linha por:

```cmd
copy .env.example .env
```

O `.env.example` já contém a configuração necessária para PostgreSQL, API e frontend locais. O arquivo `.env` é ignorado pelo Git e não deve ser versionado.

As integrações externas são opcionais para o fluxo básico:

- login por e-mail e senha funciona sem Firebase;
- login com Google exige preencher `FIREBASE_API_KEY` e as variáveis `VITE_FIREBASE_*`;
- upload de imagens exige substituir o valor de exemplo de `CLOUDINARY_URL` e informar `VITE_CLOUDINARY_CLOUD_NAME`.

## Executar o projeto

Use três terminais, sempre a partir da raiz do repositório.

### 1. Banco de dados

No primeiro terminal:

```powershell
docker compose up --build -d postgres
docker compose ps
```

O PostgreSQL fica disponível em `localhost:5433`. O container cria o schema e aplica o seed automaticamente; aguarde o status `healthy` antes de iniciar a API.

Para acompanhar a inicialização:

```powershell
docker compose logs -f postgres
```

Use `Ctrl+C` para sair dos logs sem encerrar o container.

### 2. Backend

No segundo terminal:

```powershell
cd backend\api
.\mvnw.cmd spring-boot:run
```

A API fica disponível em `http://localhost:8080`.

### 3. Frontend

No terceiro terminal:

```powershell
cd frontend
npm ci
npm run dev
```

Acesse `http://localhost:5173`.

Nas próximas execuções, `npm ci` só precisa ser repetido quando o `package-lock.json` mudar.

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

## Testes e build

Backend:

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

Encerre backend e frontend com `Ctrl+C` nos respectivos terminais. Depois, na raiz do projeto:

```powershell
docker compose down
```

Esse comando remove o container e preserva os dados do PostgreSQL no volume Docker.

## Solução de problemas

### `docker compose` não é reconhecido

Confirme que o Docker Desktop está instalado, aberto e atualizado. O projeto usa Compose v2 (`docker compose`, sem hífen).

### Porta já está em uso

As portas padrão são:

- `5173`: frontend;
- `8080`: API;
- `5433`: PostgreSQL no host.

Encerre o processo que ocupa a porta. Para alterar somente a porta do PostgreSQL, edite `POSTGRES_PORT` e ajuste a porta de `BD_URL` no `.env`.

### API não conecta ao banco

Confira se o container está saudável:

```powershell
docker compose ps
docker compose logs postgres
```

Também confirme que `BD_URL`, `BD_ADMIN` e `BD_SENHA` no `.env` correspondem a `POSTGRES_DB`, `POSTGRES_USER`, `POSTGRES_PASSWORD` e `POSTGRES_PORT`.

### Alterações no seed não aparecem

Reconstrua e reinicie apenas o serviço do banco:

```powershell
docker compose up --build -d postgres
```

O script de seed é idempotente e roda a cada inicialização do container, sem apagar o volume.

### Login com Google ou upload de imagem falha

Esses recursos dependem das credenciais opcionais de Firebase e Cloudinary no `.env`. O login local por e-mail e senha e a navegação pelo catálogo continuam disponíveis sem elas.
