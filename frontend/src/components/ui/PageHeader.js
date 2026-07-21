/**
 * Cabeçalho padrão de página autenticada (título + subtítulo opcional).
 * Usado por Library, Wishlist, Cart e Profile para manter tipografia consistente.
 */
export function PageHeader({ title, subtitle }) {
  return `
    <header class="page-heading">
      <h1 class="font-display text-3xl sm:text-4xl font-bold">${title}</h1>
      ${subtitle ? `<p class="text-muted text-sm sm:text-base mt-2 max-w-2xl">${subtitle}</p>` : ""}
    </header>
  `;
}
