## Firebase no frontend

O frontend usa Firebase Auth via variáveis de ambiente do Vite.

Copie o `.env.example` da raiz para `.env`. O Vite lê desse arquivo apenas as variáveis públicas com prefixo `VITE_`:

- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_AUTH_DOMAIN`
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_STORAGE_BUCKET`
- `VITE_FIREBASE_MESSAGING_SENDER_ID`
- `VITE_FIREBASE_APP_ID`

O fluxo atual autentica com email/senha e Google, escuta `onAuthStateChanged` e alterna entre login e hub automaticamente.
