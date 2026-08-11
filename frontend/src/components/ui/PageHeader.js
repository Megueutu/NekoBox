export function PageHeader({ title, subtitle }) {
  return `
    <header class="page-heading">
      <h1 class="type-page-title">${title}</h1>
      ${subtitle ? `<p class="type-subtitle text-muted mt-2 max-w-2xl">${subtitle}</p>` : ""}
    </header>
  `;
}
