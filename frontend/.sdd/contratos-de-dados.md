# Contratos de dados

Os exemplos abaixo representam o formato consumido pelas telas. Uma API futura deve manter esses campos ou introduzir um adaptador no service layer.

## Jogo

```json
{
  "id": "uuid",
  "owner_id": "user-id",
  "title": "Cyberpunk 2077",
  "slug": "cyberpunk-2077",
  "short_description": "Resumo para cards e catálogo",
  "long_description": "Descrição completa",
  "price": 199.90,
  "release_date": "2020-12-10",
  "status": "published",
  "media": [],
  "categories": ["RPG", "Ação"],
  "tags": ["Mundo Aberto"],
  "publisher": { "id": "publisher-id", "name": "CD PROJEKT RED", "logo_url": "" },
  "system_requirements": [],
  "languages": [],
  "updates": [],
  "reviews": []
}
```

`price` deve ser numérico e representar reais; a formatação BRL acontece no frontend. `status` deve permitir filtrar produtos publicáveis. `slug` precisa ser estável e único, pois é usado na URL.

## Mídia

```json
{
  "id": "media-id",
  "type": "cover",
  "public_id": "nekobox/games/cyberpunk-2077/cover",
  "url": "https://example.com/fallback.webp",
  "position": 1
}
```

Tipos reconhecidos: `cover`, `banner` e `screenshot`. `public_id` é preferível para Cloudinary; `url` é o fallback. `position` ordena mídias do mesmo tipo.

Para arquivos inseridos manualmente no Cloudinary, o catálogo local reconhece esta convenção de `public_id`:

```text
nekobox/games/{slug}/cover
nekobox/games/{slug}/banner
nekobox/games/{slug}/screenshot-1
nekobox/games/{slug}/screenshot-2
...
nekobox/games/{slug}/screenshot-10
```

Cada jogo aceita de 0 a 10 screenshots. Sem screenshots, a página mantém a seção e exibe o estado “Sem imagens disponíveis deste jogo”. A galeria mantém o grid com até 4 imagens e usa um carrossel horizontal quando houver entre 5 e 10. Capas e banners ausentes usam um fallback local de mídia indisponível.

A extensão original (`.png`, `.jpg`, `.avif`) não faz parte do `public_id`. Assim, um PNG enviado como `nekobox/games/hades/cover` é resolvido pelo mesmo identificador.

## Avaliação e dados auxiliares

```json
{ "id": "review-id", "username": "player", "recommended": true, "review_text": "...", "created_at": "2024-01-01", "votes": 10 }
```

A taxa de recomendação é `round(avaliações positivas / total de avaliações * 100)`. Sem avaliações, o frontend não exibe percentual.

Requisitos usam `type` (`minimum` ou `recommended`) e os campos `os`, `cpu`, `ram`, `gpu` e `storage`. Idiomas usam `name`, `interface`, `subtitles` e `audio`.

## Usuário e estado local

```json
{
  "user": { "id": "user-id", "username": "player", "email": "player@example.com", "avatar_url": "https://...", "bio": "", "is_developer": false },
  "cart": ["Game"],
  "wishlist": ["Game"],
  "library": ["Game"],
  "loading": false
}
```

Atualmente carrinho, wishlist e biblioteca armazenam objetos completos de jogo. Em produção, é mais seguro persistir relações por `game_id` e buscar dados atuais do catálogo, evitando preço e metadados obsoletos.
