import { formatPrice } from "../../utils/format";

let cleanupLandingEffects = () => {};

export const LANDING_HERO_INTERVAL_MS = 7000;

export function getLandingHeroMeta(game) {
  return {
    price: formatPrice(game.price),
    category: game.categories?.[0] || "",
  };
}

export function setupLandingHero(slides) {
  cleanupLandingEffects();

  const hero = document.querySelector("[data-hero-carousel]");
  const heroImage = hero?.querySelector("[data-hero-image]");
  const heroTitle = hero?.querySelector("#landing-title");
  const heroDescription = hero?.querySelector("[data-hero-description]");
  const heroPrice = hero?.querySelector("[data-hero-price]");
  const heroCategory = hero?.querySelector("[data-hero-category]");
  const heroDetails = hero?.querySelector("[data-hero-details]");
  const heroPause = hero?.querySelector("[data-hero-pause]");
  const heroIndicators = Array.from(hero?.querySelectorAll("[data-hero-slide]") || []);
  const prefersReducedMotion =
    window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
    document.documentElement.dataset.motion === "reduced";
  const revealTargets = Array.from(document.querySelectorAll("[data-reveal]"));
  let activeSlide = 0;
  let rotationTimer = null;
  let userPaused = prefersReducedMotion;
  let observer = null;

  slides.slice(1).forEach(({ url }) => {
    const image = new Image();
    image.src = url;
  });

  const renderSlide = (index) => {
    const slide = slides[index];
    if (!slide || !hero) return;

    const { game, url } = slide;
    const meta = getLandingHeroMeta(game);
    activeSlide = index;
    hero.classList.remove("storefront-hero--changing");
    void hero.offsetWidth;
    hero.classList.add("storefront-hero--changing");

    heroImage.src = url;
    heroTitle.textContent = game.title;
    heroDescription.textContent = game.short_description;
    heroPrice.textContent = meta.price;
    heroCategory.hidden = !meta.category;
    heroCategory.textContent = meta.category;
    heroDetails.href = `/game/${game.slug}`;
    heroIndicators.forEach((indicator, indicatorIndex) => {
      if (indicatorIndex === index) indicator.setAttribute("aria-current", "true");
      else indicator.removeAttribute("aria-current");
    });
  };

  const stopRotation = () => {
    if (rotationTimer !== null) window.clearInterval(rotationTimer);
    rotationTimer = null;
  };

  const startRotation = () => {
    stopRotation();
    if (userPaused || document.hidden || slides.length < 2) return;
    rotationTimer = window.setInterval(() => {
      renderSlide((activeSlide + 1) % slides.length);
    }, LANDING_HERO_INTERVAL_MS);
  };

  heroIndicators.forEach((indicator) => {
    indicator.addEventListener("click", () => {
      renderSlide(Number(indicator.dataset.heroSlide));
      startRotation();
    });
  });

  heroPause?.addEventListener("click", () => {
    userPaused = !userPaused;
    heroPause.setAttribute("aria-pressed", String(userPaused));
    heroPause.textContent = userPaused
      ? "Retomar troca automática"
      : "Pausar troca automática";
    if (userPaused) stopRotation();
    else startRotation();
  });

  const onVisibilityChange = () => {
    if (document.hidden) stopRotation();
    else startRotation();
  };
  document.addEventListener("visibilitychange", onVisibilityChange);
  startRotation();

  if (prefersReducedMotion || !("IntersectionObserver" in window)) {
    revealTargets.forEach((element) => element.classList.add("is-visible"));
  } else {
    observer = new IntersectionObserver(
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
  }

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
    stopRotation();
    observer?.disconnect();
    document.removeEventListener("visibilitychange", onVisibilityChange);
    window.removeEventListener("scroll", onScroll);
    window.removeEventListener("rerender", cleanup);
    window.removeEventListener("popstate", cleanup);
  };

  cleanupLandingEffects = cleanup;
  window.addEventListener("rerender", cleanup, { once: true });
  window.addEventListener("popstate", cleanup, { once: true });
}
