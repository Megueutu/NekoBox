/**
 * Cabeçalho padrão de página autenticada (título + subtítulo opcional).
 * Usado por Library, Wishlist, Cart e Profile para manter tipografia consistente.
 */
export function PageHeader({ title, subtitle }) {
  return `
    <header class="page-heading page-heading--neon">
      <h1 class="type-page-title">${title}</h1>
      ${subtitle ? `<p class="type-subtitle text-muted mt-2 max-w-2xl">${subtitle}</p>` : ""}
    </header>
  `;
}
