FROM node:22.18.0-alpine AS build

WORKDIR /workspace/frontend

COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci

COPY frontend/ ./

ARG VITE_API_BASE_URL=http://localhost:8080
ARG VITE_CHATBOT_API_URL=http://localhost:8000
ARG VITE_CLOUDINARY_CLOUD_NAME=
ARG VITE_CLOUDINARY_MEDIA_AUDIT=true

RUN npm run build

FROM node:22.18.0-alpine

WORKDIR /app

RUN addgroup -S nekobox \
    && adduser -S -G nekobox nekobox

COPY --from=build --chown=nekobox:nekobox /workspace/frontend/dist ./dist
COPY --chown=nekobox:nekobox frontend/server.mjs ./server.mjs

USER nekobox

ENV PORT=8080
EXPOSE 8080

CMD ["node", "server.mjs"]
