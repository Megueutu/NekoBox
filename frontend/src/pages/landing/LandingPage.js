import { PublicLayout } from "../../app/layouts/PublicLayout";
import { GameCard } from "../../components/ui/GameCard";
import { GamesService } from "../../services/games/games.service";
import { getRecommendationRate } from "../../utils/format";
import { getBannerUrl } from "../../utils/media";
import { getGameBannerRotation } from "../../utils/random-banner";
import {
  getLandingHeroMeta,
  LANDING_HERO_INTERVAL_MS,
  setupLandingHero,
} from "./landing-hero";

let landingHeroSlides = [];

export { LANDING_HERO_INTERVAL_MS };

export default async function LandingPage() {
  const games = await GamesService.getAll();
  landingHeroSlides = getGameBannerRotation(games, { limit: 5 });
  const randomBanner = landingHeroSlides[0];
  const featuredGame =
    randomBanner?.game ||
    games.find((game) => game.slug === "god-of-war-ragnarok") ||
    games[0];
  const featuredBannerUrl = randomBanner?.url || getBannerUrl(featuredGame);
  const featuredMeta = getLandingHeroMeta(featuredGame);
  if (landingHeroSlides.length === 0) {
    landingHeroSlides = [{ game: featuredGame, url: featuredBannerUrl }];
  }
  const highlights = games.filter((game) => game.id !== featuredGame.id).slice(0, 5);
  const collections = [
    { label: "Grandes jornadas", description: "Mundos extensos, decisões difíceis e histórias para lembrar.", game: games.find((game) => game.slug === "the-witcher-3") || games[1] },
    { label: "Ação sem pausa", description: "Combate preciso e aventuras que começam em alta velocidade.", game: games.find((game) => game.slug === "red-dead-redemption-2") || games[2] },
    { label: "Indies essenciais", description: "Ideias autorais que transformaram a forma de jogar.", game: games.find((game) => game.slug === "hollow-knight") || games[3] },
  ];

  const totalGames = games.length;
  const genreCount = new Set(games.flatMap((game) => game.categories || [])).size;
  const rates = games.map((game) => getRecommendationRate(game.reviews)).filter((rate) => rate !== null);
  const avgRate = rates.length ? Math.round(rates.reduce((sum, rate) => sum + rate, 0) / rates.length) : null;

  const stats = [
    { value: `${totalGames}+`, label: "Títulos no catálogo" },
    { value: `${genreCount}`, label: "Gêneros diferentes" },
    avgRate !== null ? { value: `${avgRate}%`, label: "Média de recomendação" } : null,
    { value: "24/7", label: "Acesso à sua biblioteca" },
  ].filter(Boolean);

  const content = `
    <div class="landing-page">
      <div class="landing-aurora" aria-hidden="true">
        <span class="landing-aurora__blob landing-aurora__blob--one"></span>
        <span class="landing-aurora__blob landing-aurora__blob--two"></span>
        <span class="landing-aurora__grid"></span>
      </div>

      <section class="storefront-hero" aria-labelledby="landing-title" data-hero-carousel>
        <img src="${featuredBannerUrl}" alt="" class="storefront-hero__image" data-hero-image data-hero-parallax fetchpriority="high" />
        <div class="storefront-hero__shade" aria-hidden="true"></div>
        <div class="site-container storefront-hero__content">
          <div class="storefront-hero__copy glass-panel" data-reveal>
            <p class="storefront-kicker"><span class="storefront-kicker__dot" aria-hidden="true"></span>Em destaque no NekoBox</p>
            <h1 id="landing-title">${featuredGame.title}</h1>
            <p data-hero-description>${featuredGame.short_description}</p>
            <div class="storefront-hero__meta" aria-label="Informações do jogo">
              <span class="glass-chip glass-chip--price" data-hero-price>${featuredMeta.price}</span>
              <span class="glass-chip" data-hero-rate ${featuredMeta.rate === null ? "hidden" : ""}>${featuredMeta.rate ?? ""}% recomendado</span>
              <span class="glass-chip" data-hero-category ${featuredMeta.category ? "" : "hidden"}>${featuredMeta.category}</span>
            </div>
            <div class="storefront-actions">
              <a href="/game/${featuredGame.slug}" data-link data-hero-details class="button-neon px-5 py-3">Ver detalhes</a>
              <a href="/hub" data-link class="button-glass px-5 py-3">Explorar catálogo</a>
            </div>
            ${
              landingHeroSlides.length > 1
                ? `
                  <div class="storefront-hero__rotation" aria-label="Controles do destaque">
                    <div class="storefront-hero__indicators" role="group" aria-label="Selecionar jogo em destaque">
                      ${landingHeroSlides
                        .map(
                          ({ game }, index) => `
                            <button type="button" data-hero-slide="${index}"
                                    aria-label="Mostrar ${game.title}"
                                    ${index === 0 ? 'aria-current="true"' : ""}></button>
                          `
                        )
                        .join("")}
                    </div>
                    <button type="button" class="storefront-hero__pause" data-hero-pause aria-pressed="false">
                      Pausar troca automática
                    </button>
                  </div>
                `
                : ""
            }
          </div>
        </div>
      </section>

      <div class="site-container">
        <dl class="landing-stats" data-reveal aria-label="Números do NekoBox">
          ${stats
            .map(
              (stat) => `
                <div class="landing-stat glass-panel">
                  <dt class="landing-stat__value">${stat.value}</dt>
                  <dd class="landing-stat__label">${stat.label}</dd>
                </div>
              `
            )
            .join("")}
        </dl>
      </div>

      <nav class="site-container landing-shortcuts" aria-label="Atalhos desta página">
        <a href="#destaques">Destaques</a>
        <a href="#colecoes">Coleções</a>
        <a href="/hub" data-link>Todos os jogos</a>
      </nav>

      <div class="site-container landing-content">
        <section id="destaques" aria-labelledby="highlights-title" data-reveal>
          <div class="section-heading">
            <div>
              <p class="section-heading__eyebrow mb-1">Seleção da semana</p>
              <h2 id="highlights-title" class="font-display text-3xl sm:text-4xl font-bold">Jogos para começar agora</h2>
            </div>
            <a href="/hub" data-link class="landing-section-link">Ver catálogo completo</a>
          </div>
          <div class="landing-game-rail" aria-label="Jogos em destaque">
            ${highlights.map((game) => `<div class="landing-rail-item">${GameCard(game, { variant: "catalog" })}</div>`).join("")}
          </div>
        </section>

        <section id="colecoes" aria-labelledby="collections-title" data-reveal>
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

        <section class="landing-membership glass-panel glass-panel--glow" aria-labelledby="membership-title" data-reveal>
          <div>
            <p class="section-heading__eyebrow mb-2">Sua coleção, do seu jeito</p>
            <h2 id="membership-title" class="font-display text-3xl sm:text-5xl font-bold">Salve. Escolha. Jogue.</h2>
            <p>Crie sua lista de desejos, organize sua biblioteca e encontre seu próximo jogo sem sair do NekoBox.</p>
          </div>
          <div class="storefront-actions">
            <a href="/login" data-link class="button-neon px-5 py-3">Criar conta</a>
            <a href="/hub" data-link class="button-glass px-5 py-3">Conhecer a loja</a>
          </div>
        </section>
      </div>
    </div>
  `;

  return PublicLayout(content);
}

export function afterRender() {
  setupLandingHero(landingHeroSlides);
}
