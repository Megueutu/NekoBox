## Firebase no frontend

O frontend usa Firebase Auth via variáveis de ambiente do Vite.

Crie um arquivo `frontend/.env.local` com as chaves abaixo, copiando o modelo de `frontend/.env.example`:

- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_AUTH_DOMAIN`
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_STORAGE_BUCKET`
- `VITE_FIREBASE_MESSAGING_SENDER_ID`
- `VITE_FIREBASE_APP_ID`

O fluxo atual autentica com email/senha e Google, escuta `onAuthStateChanged` e alterna entre login e hub automaticamente.
