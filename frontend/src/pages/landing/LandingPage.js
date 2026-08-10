import { PublicLayout } from "../../app/layouts/PublicLayout";
import { ContentHero } from "../../components/ui/ContentHero";
import { GameCard } from "../../components/ui/GameCard";
import { GamesService } from "../../services/games/games.service";
import { getBannerUrl } from "../../utils/media";
import { getGameBannerRotation } from "../../utils/random-banner";
import { bindNavigationScroll } from "../../utils/nav-scroll";
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
  const membershipGame =
    games.find((game) => game.slug === "hades") ||
    highlights[0] ||
    featuredGame;


  const content = `
    <div class="landing-page">
      <section class="storefront-hero" aria-labelledby="landing-title" data-hero-carousel>
        <img src="${featuredBannerUrl}" alt="" class="storefront-hero__image" data-hero-image data-hero-parallax fetchpriority="high" />
        <div class="storefront-hero__shade" aria-hidden="true"></div>
        <div class="site-container storefront-hero__content">
          <div class="storefront-hero__copy panel" data-reveal>
            <h1 id="landing-title" class="type-hero-title">${featuredGame.title}</h1>
            <div class="storefront-hero__meta" aria-label="Informações do jogo">
              <span class="chip" data-hero-price>${featuredMeta.price}</span>
              <span class="storefront-hero__tags" data-hero-categories>${featuredMeta.categories.map((category) => `<span class="chip">${category}</span>`).join("")}</span>
            </div>
            <div class="storefront-actions">
              <a href="/game/${featuredGame.slug}" data-link data-hero-details class="button-primary px-5 py-3">Ver detalhes</a>
              <a href="/hub" data-link class="button-outline px-5 py-3">Explorar catálogo</a>
            </div>
          </div>
        </div>
      </section>

      <div class="site-container landing-content">
        <section id="destaques" aria-labelledby="highlights-title" data-reveal>
          <div class="section-heading">
            <div>
              <p class="section-heading__eyebrow mb-1">Seleção da semana</p>
              <h2 id="highlights-title" class="type-section-title">Jogos para começar agora</h2>
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
              <h2 id="collections-title" class="type-section-title">Nossas principais coleções</h2>
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
                      <strong>${label}</strong>
                      <span>${description}</span>
                    </span>
                  </a>
                `
              )
              .join("")}
          </div>
        </section>

        ${ContentHero({
          tag: "section",
          className: "landing-membership",
          attributes: "data-reveal",
          titleId: "membership-title",
          headingTag: "h2",
          title: "Salve. Escolha. Jogue.",
          description: "Crie sua lista de desejos, organize sua biblioteca e encontre seu próximo jogo sem sair do NekoBox.",
          bannerUrl: getBannerUrl(membershipGame),
          actionsHtml: `
            <a href="/login" data-link class="button-primary px-5 py-3">Criar conta</a>
            <a href="/hub" data-link class="button-outline px-5 py-3">Explorar catálogo</a>
          `,
        })}
      </div>
    </div>
  `;

  return PublicLayout(content, { showChatbot: true });
}

export function afterRender() {
  setupLandingHero(landingHeroSlides);
  bindNavigationScroll(".site-nav--landing");
}
