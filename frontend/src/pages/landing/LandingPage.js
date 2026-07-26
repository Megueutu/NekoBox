import { PublicLayout } from "../../app/layouts/PublicLayout";
import { GameCard } from "../../components/ui/GameCard";
import { GamesService } from "../../services/games/games.service";
import { formatPrice, getRecommendationRate } from "../../utils/format";
import { getBannerUrl } from "../../utils/media";

let cleanupLandingEffects = () => {};

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

      <section class="storefront-hero" aria-labelledby="landing-title">
        <img src="${getBannerUrl(featuredGame)}" alt="" class="storefront-hero__image" data-hero-parallax fetchpriority="high" />
        <div class="storefront-hero__shade" aria-hidden="true"></div>
        <div class="site-container storefront-hero__content">
          <div class="storefront-hero__copy glass-panel" data-reveal>
            <p class="storefront-kicker"><span class="storefront-kicker__dot" aria-hidden="true"></span>Em destaque no NekoBox</p>
            <h1 id="landing-title">${featuredGame.title}</h1>
            <p>${featuredGame.short_description}</p>
            <div class="storefront-hero__meta" aria-label="Informações do jogo">
              <span class="glass-chip glass-chip--price">${formatPrice(featuredGame.price)}</span>
              ${featuredRate !== null ? `<span class="glass-chip">${featuredRate}% recomendado</span>` : ""}
              ${featuredGame.categories?.[0] ? `<span class="glass-chip">${featuredGame.categories[0]}</span>` : ""}
            </div>
            <div class="storefront-actions">
              <a href="/game/${featuredGame.slug}" data-link class="button-neon px-5 py-3">Ver detalhes</a>
              <a href="/hub" data-link class="button-glass px-5 py-3">Explorar catálogo</a>
            </div>
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
  cleanupLandingEffects();

  const prefersReducedMotion =
    window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
    document.documentElement.dataset.motion === "reduced";
  const revealTargets = Array.from(document.querySelectorAll("[data-reveal]"));

  if (prefersReducedMotion || !("IntersectionObserver" in window)) {
    revealTargets.forEach((element) => element.classList.add("is-visible"));
    cleanupLandingEffects = () => {};
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15, rootMargin: "0px 0px -8% 0px" }
  );

  revealTargets.forEach((element) => observer.observe(element));

  const heroImage = document.querySelector("[data-hero-parallax]");
  let ticking = false;
  const onScroll = () => {
    if (!heroImage || ticking) return;
    ticking = true;
    window.requestAnimationFrame(() => {
      const offset = Math.min(window.scrollY, 600);
      heroImage.style.transform = `translate3d(0, ${offset * 0.18}px, 0) scale(1.06)`;
      ticking = false;
    });
  };

  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  const cleanup = () => {
    observer.disconnect();
    window.removeEventListener("scroll", onScroll);
    window.removeEventListener("rerender", cleanup);
    window.removeEventListener("popstate", cleanup);
  };

  cleanupLandingEffects = cleanup;
  window.addEventListener("rerender", cleanup, { once: true });
  window.addEventListener("popstate", cleanup, { once: true });
}
