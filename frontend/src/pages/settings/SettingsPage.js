import { PublicLayout } from "../../app/layouts/PublicLayout";
import {
  getPreferences,
  resetPreferences,
  savePreferences,
} from "../../app/preferences/preferences";
import { Icon, icons } from "../../components/ui/Icon";

const accentOptions = [
  { value: "violet", label: "Violeta Nexus", color: "#a78bfa" },
  { value: "cyan", label: "Ciano elétrico", color: "#22d3ee" },
  { value: "lime", label: "Lima neon", color: "#a3e635" },
  { value: "coral", label: "Coral intenso", color: "#fb7185" },
  { value: "pink", label: "Rosa pulse", color: "#f472b6" },
];

const baseOptions = [
  { value: "obsidian", label: "Obsidiana", description: "Preto profundo e cinematográfico" },
  { value: "midnight", label: "Meia-noite", description: "Base escura com nuance azul" },
  { value: "graphite", label: "Grafite", description: "Cinza escuro com superfícies claras" },
];

function radioOption(name, value, label, description, selected) {
  return `
    <label class="setting-choice">
      <input type="radio" name="${name}" value="${value}" ${selected === value ? "checked" : ""} />
      <span>
        <strong>${label}</strong>
        <small>${description}</small>
      </span>
    </label>
  `;
}

export default function SettingsPage() {
  const preferences = getPreferences();
  const content = `
    <div class="settings-page">
      <header class="site-container settings-hero">
        <div>
          <p class="section-heading__eyebrow mb-2">Seu espaço, suas regras</p>
          <h1>Configurações</h1>
          <p>Personalize a aparência e o ritmo do NekoBox. As escolhas ficam salvas neste dispositivo.</p>
        </div>
        <div class="settings-preview" aria-hidden="true">
          <span></span><span></span><span></span>
          <strong>NEKOBOX</strong>
          <small>Prévia ao vivo</small>
        </div>
      </header>

      <form id="settings-form" class="site-container settings-layout">
        <div class="settings-main">
          <section class="settings-section" aria-labelledby="color-title">
            <div class="settings-section__heading">
              <p>01</p>
              <div><h2 id="color-title">Cor vibrante</h2><span>Escolha a energia que contrasta com a base escura.</span></div>
            </div>
            <fieldset class="accent-picker">
              <legend class="sr-only">Cor vibrante da interface</legend>
              ${accentOptions.map(({ value, label, color }) => `
                <label class="accent-option" style="--swatch-color: ${color}">
                  <input type="radio" name="accent" value="${value}" ${preferences.accent === value ? "checked" : ""} />
                  <span class="accent-option__swatch"></span>
                  <strong>${label}</strong>
                  <small aria-hidden="true">Selecionar</small>
                </label>
              `).join("")}
            </fieldset>
          </section>

          <section class="settings-section" aria-labelledby="base-title">
            <div class="settings-section__heading">
              <p>02</p>
              <div><h2 id="base-title">Tom da interface</h2><span>A identidade permanece escura, com diferentes profundidades.</span></div>
            </div>
            <fieldset class="setting-choice-grid">
              <legend class="sr-only">Tom escuro da interface</legend>
              ${baseOptions.map(({ value, label, description }) => radioOption("base", value, label, description, preferences.base)).join("")}
            </fieldset>
          </section>

          <section class="settings-section" aria-labelledby="reading-title">
            <div class="settings-section__heading">
              <p>03</p>
              <div><h2 id="reading-title">Leitura e conforto</h2><span>Ajustes que ajudam a interface a acompanhar vc.</span></div>
            </div>
            <div class="settings-control-list">
              <fieldset class="settings-control-row">
                <legend><strong>Tamanho do texto</strong><small>Aumenta textos sem aplicar zoom às imagens.</small></legend>
                <div class="segmented-control">
                  ${radioOption("textSize", "default", "Padrão", "100%", preferences.textSize)}
                  ${radioOption("textSize", "large", "Ampliado", "112%", preferences.textSize)}
                </div>
              </fieldset>
              <fieldset class="settings-control-row">
                <legend><strong>Densidade</strong><small>Controla o espaço entre os elementos.</small></legend>
                <div class="segmented-control">
                  ${radioOption("density", "comfortable", "Confortável", "Mais respiro", preferences.density)}
                  ${radioOption("density", "compact", "Compacta", "Mais conteúdo", preferences.density)}
                </div>
              </fieldset>
              <label class="settings-switch-row">
                <span><strong>Reduzir movimento</strong><small>Minimiza transições e efeitos de aproximação.</small></span>
                <input type="checkbox" name="reducedMotion" ${preferences.motion === "reduced" ? "checked" : ""} />
                <span class="settings-switch" aria-hidden="true"></span>
              </label>
            </div>
          </section>
        </div>

        <aside class="settings-summary" aria-labelledby="summary-title">
          <p class="section-heading__eyebrow mb-2">Aplicado agora</p>
          <h2 id="summary-title">Sua combinação</h2>
          <div class="settings-summary__sample" aria-hidden="true"><span></span><strong>Jogue do seu jeito.</strong><small>Uma prévia da identidade escolhida.</small><i>Ação em destaque</i></div>
          <dl id="settings-summary-values"></dl>
          <button id="reset-settings" type="button" class="button-secondary settings-reset">
            ${Icon(icons.reset, { className: "w-4 h-4" })} Restaurar padrão
          </button>
          <p id="settings-status" class="sr-only" role="status" aria-live="polite"></p>
        </aside>
      </form>
    </div>
  `;

  return PublicLayout(content);
}

function readFormPreferences(form) {
  const data = new FormData(form);
  return {
    accent: data.get("accent"),
    base: data.get("base"),
    textSize: data.get("textSize"),
    density: data.get("density"),
    motion: form.elements.reducedMotion.checked ? "reduced" : "system",
  };
}

function updateSummary(preferences) {
  const accent = accentOptions.find((option) => option.value === preferences.accent);
  const base = baseOptions.find((option) => option.value === preferences.base);
  const values = document.getElementById("settings-summary-values");
  if (!values) return;

  values.innerHTML = `
    <div><dt>Cor</dt><dd>${accent.label}</dd></div>
    <div><dt>Base</dt><dd>${base.label}</dd></div>
    <div><dt>Texto</dt><dd>${preferences.textSize === "large" ? "Ampliado" : "Padrão"}</dd></div>
    <div><dt>Movimento</dt><dd>${preferences.motion === "reduced" ? "Reduzido" : "Do sistema"}</dd></div>
  `;
}

export function afterRender() {
  const form = document.getElementById("settings-form");
  const status = document.getElementById("settings-status");
  if (!form) return;

  updateSummary(getPreferences());

  form.addEventListener("change", () => {
    const preferences = savePreferences(readFormPreferences(form));
    updateSummary(preferences);
    status.textContent = "Preferências aplicadas e salvas neste dispositivo.";
  });

  document.getElementById("reset-settings")?.addEventListener("click", () => {
    const preferences = resetPreferences();
    form.reset();
    Object.entries(preferences).forEach(([name, value]) => {
      if (name === "motion") {
        form.elements.reducedMotion.checked = value === "reduced";
        return;
      }
      const input = form.querySelector(`[name="${name}"][value="${value}"]`);
      if (input) input.checked = true;
    });
    updateSummary(preferences);
    status.textContent = "Configurações padrão restauradas.";
  });
}
