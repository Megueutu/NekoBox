import { Icon } from "./Icon";

export function EmptyState({ icon, title, description, ctaHref, ctaLabel }) {
  return `
    <div class="bg-surface rounded-[var(--radius-card)] p-10 sm:p-14 text-center" role="status">
      ${Icon(icon, { className: "w-12 h-12 text-[var(--color-muted-2)] mx-auto mb-5", strokeWidth: 1.5 })}
      <h2 class="text-[var(--color-ink)] text-lg font-semibold mb-3">${title}</h2>
      <p class="text-[var(--color-muted-2)] text-sm mb-7">${description}</p>
      ${
        ctaHref
          ? `<a href="${ctaHref}" data-link class="button-primary px-5 py-2.5 text-sm">
               ${ctaLabel}
             </a>`
          : ""
      }
    </div>
  `;
}
