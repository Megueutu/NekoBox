/**
 * Wrapper de seção com cabeçalho padronizado (título + linha divisória).
 * Usado nas páginas de detalhe (ex.: GamePage) para evitar repetir a mesma
 * estrutura de <section><h2>...</h2>...</section> em cada bloco de conteúdo.
 */
export function Section({ title, heading = "", body }) {
  return `
    <section class="game-section space-y-4">
      <h2 class="font-display text-xl font-semibold">
        ${title}${heading}
      </h2>
      ${body}
    </section>
  `;
}
