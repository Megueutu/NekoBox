/**
 * Hero de página com imagem de fundo em tela cheia (banner + overlay + conteúdo).
 * Usado por Termos/Privacidade/Acessibilidade (via LegalDocument) e pela landing.
 */
export function ContentHero({
  eyebrow,
  titleId,
  title,
  headingTag = "h1",
  description,
  bannerUrl,
  actionsHtml = "",
  tag = "header",
  className = "",
  attributes = "",
}) {
  return `
    <${tag} class="site-container content-hero ${className}" aria-labelledby="${titleId}" ${attributes}>
      <img src="${bannerUrl}" alt="" class="content-hero__image" fetchpriority="high" />
      <div class="content-hero__backdrop" aria-hidden="true"></div>
      <div class="content-hero__content">
        <${headingTag} id="${titleId}" class="content-hero__title">${title}</${headingTag}>
        <p class="content-hero__lead">${description}</p>
        ${actionsHtml ? `<div class="content-hero__actions">${actionsHtml}</div>` : ""}
      </div>
    </${tag}>
  `;
}
