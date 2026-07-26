const PREFERENCES_KEY = "nekobox_preferences";
const LEGACY_PREFERENCES_KEY = "nexusplay_preferences";

export const defaultPreferences = Object.freeze({
  base: "obsidian",
  accent: "violet",
  textSize: "default",
  density: "comfortable",
  motion: "system",
});

const allowedValues = Object.freeze({
  base: ["obsidian", "midnight", "graphite"],
  accent: ["violet", "cyan", "lime", "coral", "pink"],
  textSize: ["default", "large"],
  density: ["comfortable", "compact"],
  motion: ["system", "reduced"],
});

function sanitizePreferences(value = {}) {
  return Object.fromEntries(
    Object.entries(defaultPreferences).map(([key, fallback]) => [
      key,
      allowedValues[key].includes(value[key]) ? value[key] : fallback,
    ])
  );
}

export function getPreferences() {
  try {
    const currentValue = localStorage.getItem(PREFERENCES_KEY);
    const legacyValue = localStorage.getItem(LEGACY_PREFERENCES_KEY);
    const stored = JSON.parse(currentValue || legacyValue || "null");

    if (!currentValue && legacyValue) {
      localStorage.setItem(PREFERENCES_KEY, legacyValue);
      localStorage.removeItem(LEGACY_PREFERENCES_KEY);
    }

    return sanitizePreferences(stored || defaultPreferences);
  } catch {
    return { ...defaultPreferences };
  }
}

export function applyPreferences(preferences = getPreferences()) {
  const safePreferences = sanitizePreferences(preferences);
  const root = document.documentElement;

  Object.entries(safePreferences).forEach(([key, value]) => {
    root.dataset[key] = value;
  });

  return safePreferences;
}

export function savePreferences(preferences) {
  const safePreferences = sanitizePreferences(preferences);
  try {
    localStorage.setItem(PREFERENCES_KEY, JSON.stringify(safePreferences));
  } catch {
    // A preferência continua válida na sessão mesmo se o navegador bloquear armazenamento local.
  }
  applyPreferences(safePreferences);
  return safePreferences;
}

export function resetPreferences() {
  return savePreferences(defaultPreferences);
}
