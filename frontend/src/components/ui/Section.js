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
