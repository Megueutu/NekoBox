# Configuração e execução

## Requisitos

- Node.js compatível com o Vite instalado no projeto.
- Dependências instaladas com `npm install`.
- Para desenvolvimento sem serviços externos, nenhuma variável de ambiente é obrigatória.

## Scripts

```bash
npm run dev       # servidor de desenvolvimento
npm run build     # build de produção
npm run preview   # serve o build localmente
```

Os testes existentes podem ser executados diretamente com `npx vitest run`.

## Variáveis de ambiente

O arquivo `.env` não deve ser versionado. O Firebase lê:

```text
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
```

Se `VITE_FIREBASE_API_KEY` não existir, `firebase.js` não inicializa o Firebase e `AuthService` usa o mock local.

Cloudinary lê:

```text
VITE_CLOUDINARY_CLOUD_NAME=
```

Sem essa variável, imagens com `public_id` não são transformadas e o frontend cai para `media.url` ou para o fallback `picsum.photos`.

## Alias e estilos

O alias `@` aponta para `src`. O Tailwind é integrado pelo plugin do Vite; estilos globais e tokens visuais ficam em `src/style.css`.

## Cuidados de configuração

As variáveis `VITE_*` são incorporadas ao bundle e não são local apropriado para segredos. Chaves privadas do Firebase Admin, Cloudinary API Secret e credenciais de pagamento devem permanecer no backend.
