export function EmptyState({ icon, title, description, ctaHref, ctaLabel }) {
  return `
    <div class="bg-surface border border-[var(--color-border)] rounded-[var(--radius-card)] p-10 sm:p-14 text-center" role="status">
      <svg aria-hidden="true" class="w-12 h-12 text-[var(--color-muted-2)] mx-auto mb-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.5">
        <path stroke-linecap="round" stroke-linejoin="round" d="${icon}"/>
      </svg>
      <h2 class="text-[var(--color-ink)] text-lg font-semibold mb-3">${title}</h2>
      <p class="text-[var(--color-muted-2)] text-sm mb-7">${description}</p>
      ${
        ctaHref
          ? `<a href="${ctaHref}" data-link class="px-5 py-2.5 bg-gradient-to-r from-[var(--color-brand-500)] to-[var(--color-brand-700)] text-white font-bold text-sm rounded-lg hover:brightness-110 transition-all glow-brand inline-block">
               ${ctaLabel}
             </a>`
          : ""
      }
    </div>
  `;
}
