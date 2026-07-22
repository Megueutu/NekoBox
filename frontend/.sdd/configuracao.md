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
VITE_CLOUDINARY_MEDIA_AUDIT=true
```

Sem essa variável, imagens com `public_id` não são transformadas e o frontend cai para `media.url` ou para o fallback `picsum.photos`.

Em desenvolvimento, `VITE_CLOUDINARY_MEDIA_AUDIT=true` faz o catálogo e o detalhe do jogo solicitarem ao backend a verificação dos arquivos no Cloudinary e emitirem um `console.warn` com capas/banners ausentes, jogos sem screenshots e divergências de nome. `CLOUDINARY_MEDIA_ROOT` define a pasta e `CLOUDINARY_SCREENSHOT_COUNT` define o máximo de screenshots procurados por jogo; screenshots são opcionais. O padrão máximo é 10; a página usa grid para até 4 e carrossel horizontal de 5 a 10. A auditoria fica desligada no build de produção para não afetar o carregamento do catálogo.

## Alias e estilos

O alias `@` aponta para `src`. O Tailwind é integrado pelo plugin do Vite; estilos globais e tokens visuais ficam em `src/style.css`.

Os ícones de interface usam `lucide` na versão fixada no manifesto e são expostos pelo componente `src/components/ui/Icon.js`. `react-icons` não deve ser usado porque esta aplicação não possui runtime React.

## Cuidados de configuração

As variáveis `VITE_*` são incorporadas ao bundle e não são local apropriado para segredos. Chaves privadas do Firebase Admin, Cloudinary API Secret e credenciais de pagamento devem permanecer no backend.
