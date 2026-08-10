import { Icon, icons } from "../../components/ui/Icon";

export function renderErrorPage(type) {
  let title = "";
  let description = "";
  let actionHtml = "";

  if (type === "load-error") {
    title = "Não foi possível carregar esta página";
    description = "Algo interrompeu o carregamento. Verifique sua conexão e tente novamente.";
    actionHtml = `
      <button id="btn-retry-page" type="button" class="button-primary error-page__retry">
        ${Icon(icons.reset, { className: "w-4 h-4", strokeWidth: 2.2 })}
        Tentar novamente
      </button>
    `;
  }

  if (type === "not-found") {
    title = "Página não encontrada";
    description = "O título buscado não foi indexado ou foi movido do catálogo de lançamentos.";
    actionHtml = `
      <a href="/hub" data-link class="button-primary error-page__retry">
        Retornar ao Hub
      </a>
    `;
  }

  return `
    <main class="error-page" aria-labelledby="error-page-title">
      <section class="error-page__card">
        <h1 id="error-page-title">${title}</h1>
        <p class="error-page__description">
          ${description}
        </p>
        ${actionHtml}
      </section>
    </main>
  `;
}
