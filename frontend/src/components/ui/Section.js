/**
 * Wrapper de seção com cabeçalho padronizado (título + linha divisória).
 * Usado nas páginas de detalhe (ex.: GamePage) para evitar repetir a mesma
 * estrutura de <section><h2>...</h2>...</section> em cada bloco de conteúdo.
 */
export function Section({ title, heading = "", actions = "", body }) {
  return `
    <section class="game-section space-y-4">
      <div class="game-section__heading">
        <h2 class="type-content-title">
          ${title}${heading}
        </h2>
        ${actions}
      </div>
      ${body}
    </section>
  `;
}
