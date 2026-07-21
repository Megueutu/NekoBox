import { PublicLayout } from "../../app/layouts/PublicLayout";
import { GameCard } from "../../components/ui/GameCard";
import { GamesService } from "../../services/games/games.service";
import { formatPrice, getRecommendationRate } from "../../utils/format";
import { getBannerUrl } from "../../utils/media";

export default async function LandingPage() {
  const games = await GamesService.getAll();
  const featuredGame = games.find((game) => game.slug === "god-of-war-ragnarok") || games[0];
  const featuredRate = getRecommendationRate(featuredGame.reviews);
  const highlights = games.filter((game) => game.id !== featuredGame.id).slice(0, 5);
  const collections = [
    { label: "Grandes jornadas", description: "Mundos extensos, decisões difíceis e histórias para lembrar.", game: games.find((game) => game.slug === "the-witcher-3") || games[1] },
    { label: "Ação sem pausa", description: "Combate preciso e aventuras que começam em alta velocidade.", game: games.find((game) => game.slug === "red-dead-redemption-2") || games[2] },
    { label: "Indies essenciais", description: "Ideias autorais que transformaram a forma de jogar.", game: games.find((game) => game.slug === "hollow-knight") || games[3] },
  ];

  const content = `
    <div class="landing-page">
      <section class="storefront-hero" aria-labelledby="landing-title">
        <img src="${getBannerUrl(featuredGame)}" alt="" class="storefront-hero__image" fetchpriority="high" />
        <div class="storefront-hero__shade" aria-hidden="true"></div>
        <div class="site-container storefront-hero__content">
          <div class="storefront-hero__copy">
            <p class="storefront-kicker">Em destaque na NexusPlay</p>
            <h1 id="landing-title">${featuredGame.title}</h1>
            <p>${featuredGame.short_description}</p>
            <div class="storefront-hero__meta" aria-label="Informações do jogo">
              <span>${formatPrice(featuredGame.price)}</span>
              ${featuredRate !== null ? `<span>${featuredRate}% recomendado</span>` : ""}
            </div>
            <div class="storefront-actions">
              <a href="/game/${featuredGame.slug}" data-link class="button-primary px-5 py-3">Ver detalhes</a>
              <a href="/hub" data-link class="button-secondary px-5 py-3">Explorar catálogo</a>
            </div>
          </div>
        </div>
      </section>

      <nav class="site-container landing-shortcuts" aria-label="Atalhos desta página">
        <a href="#destaques">Destaques</a>
        <a href="#colecoes">Coleções</a>
        <a href="/hub" data-link>Todos os jogos</a>
      </nav>

      <div class="site-container landing-content">
        <section id="destaques" aria-labelledby="highlights-title">
          <div class="section-heading">
            <div>
              <p class="section-heading__eyebrow mb-1">Seleção da semana</p>
              <h2 id="highlights-title" class="font-display text-3xl sm:text-4xl font-bold">Jogos para começar agora</h2>
            </div>
            <a href="/hub" data-link class="landing-section-link">Ver catálogo completo</a>
          </div>
          <div class="landing-game-rail" aria-label="Jogos em destaque">
            ${highlights.map((game) => `<div>${GameCard(game, { variant: "catalog" })}</div>`).join("")}
          </div>
        </section>

        <section id="colecoes" aria-labelledby="collections-title">
          <div class="section-heading">
            <div>
              <p class="section-heading__eyebrow mb-1">Escolha seu ritmo</p>
              <h2 id="collections-title" class="font-display text-3xl sm:text-4xl font-bold">Coleções em foco</h2>
            </div>
          </div>
          <div class="landing-collections">
            ${collections
              .map(
                ({ label, description, game }, index) => `
                  <a href="/game/${game.slug}" data-link class="collection-card ${index === 0 ? "collection-card--wide" : ""}">
                    <img src="${getBannerUrl(game)}" alt="" loading="lazy" />
                    <span class="collection-card__shade" aria-hidden="true"></span>
                    <span class="collection-card__content">
                      <span class="collection-card__index" aria-hidden="true">0${index + 1}</span>
                      <strong>${label}</strong>
                      <span>${description}</span>
                    </span>
                  </a>
                `
              )
              .join("")}
          </div>
        </section>

        <section class="landing-membership" aria-labelledby="membership-title">
          <div>
            <p class="section-heading__eyebrow mb-2">Sua coleção, do seu jeito</p>
            <h2 id="membership-title" class="font-display text-3xl sm:text-5xl font-bold">Salve. Escolha. Jogue.</h2>
            <p>Crie sua lista de desejos, organize sua biblioteca e encontre seu próximo jogo sem sair da NexusPlay.</p>
          </div>
          <div class="storefront-actions">
            <a href="/login" data-link class="button-primary px-5 py-3">Criar conta</a>
            <a href="/hub" data-link class="button-secondary px-5 py-3">Conhecer a loja</a>
          </div>
        </section>
      </div>
    </div>
  `;

  return PublicLayout(content);
}
