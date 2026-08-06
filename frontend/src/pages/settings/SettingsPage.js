import { PrivateLayout } from "../../app/layouts/PrivateLayout";
import { navigate } from "../../app/router/navigate";
import {
  getPreferences,
  resetPreferences,
  savePreferences,
} from "../../app/preferences/preferences";
import { AuthService } from "../../services/auth/auth.service";
import { Icon, icons } from "../../components/ui/Icon";
import { PageHeader } from "../../components/ui/PageHeader";

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
    <div class="settings-page space-y-8">
      ${PageHeader({
        title: "Configurações",
        subtitle: "Personalize a aparência e o conforto de leitura. As escolhas ficam salvas neste dispositivo.",
      })}

      <form id="settings-form" class="settings-layout">
        <div class="settings-main">
          <section class="settings-section panel" aria-labelledby="appearance-title">
            <div class="settings-section__heading">
             <h2 id="appearance-title">Aparência</h2>
              <span>Escolha o tom da interface que fica mais confortável para você.</span>
            </div>

            <div class="settings-section__content">
              <fieldset class="settings-fieldset">
                <legend>Tom da interface</legend>
                <div class="setting-choice-grid">
                  ${baseOptions.map(({ value, label, description }) => radioOption("base", value, label, description, preferences.base)).join("")}
                </div>
              </fieldset>
            </div>
          </section>

          <section class="settings-section panel" aria-labelledby="reading-title">
            <div class="settings-section__heading">
              <h2 id="reading-title">Leitura e conforto</h2>
              <span>Ajuste texto, espaçamento e movimento.</span>
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

        <div class="settings-actions">
          <p>As alterações são aplicadas e salvas automaticamente.</p>
          <button id="reset-settings" type="button" class="button-secondary settings-reset">
            ${Icon(icons.reset, { className: "w-4 h-4" })} Restaurar padrão
          </button>
          <p id="settings-status" class="sr-only" role="status" aria-live="polite"></p>
        </div>
      </form>
    </div>
  `;

  return PrivateLayout(content);
}

function readFormPreferences(form) {
  const data = new FormData(form);
  return {
    base: data.get("base"),
    textSize: data.get("textSize"),
    density: data.get("density"),
    motion: form.elements.reducedMotion.checked ? "reduced" : "system",
  };
}

export function afterRender() {
  const form = document.getElementById("settings-form");
  const status = document.getElementById("settings-status");
  if (!form) return;

  form.addEventListener("change", () => {
    savePreferences(readFormPreferences(form));
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
    status.textContent = "Configurações padrão restauradas.";
  });

  document.getElementById("btn-sidebar-logout")?.addEventListener("click", async () => {
    await AuthService.logout();
    navigate("/hub");
  });
}
