import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  applyPreferences,
  defaultPreferences,
  getPreferences,
  resetPreferences,
  savePreferences,
} from "../app/preferences/preferences";

const PREFERENCES_KEY = "nekobox_preferences";

beforeEach(() => {
  localStorage.clear();
  document.documentElement.removeAttribute("data-base");
  document.documentElement.removeAttribute("data-accent");
  document.documentElement.removeAttribute("data-text-size");
  document.documentElement.removeAttribute("data-density");
  document.documentElement.removeAttribute("data-motion");
  vi.restoreAllMocks();
});

describe("Visual preferences", () => {
  it("should apply and persist a valid customization", () => {
    const preferences = {
      base: "midnight",
      accent: "cyan",
      textSize: "large",
      density: "compact",
      motion: "reduced",
    };

    savePreferences(preferences);

    expect(getPreferences()).toEqual(preferences);
  });

  it("should reflect preferences on the document root", () => {
    applyPreferences({ ...defaultPreferences, accent: "lime" });

    expect(document.documentElement.dataset.accent).toBe("lime");
  });

  it("should replace invalid stored values with safe defaults", () => {
    localStorage.setItem(PREFERENCES_KEY, JSON.stringify({ accent: "invisible", base: null }));

    const preferences = getPreferences();

    expect(preferences).toEqual(defaultPreferences);
  });

  it("should recover when stored JSON is corrupted", () => {
    localStorage.setItem(PREFERENCES_KEY, "{broken");

    const preferences = getPreferences();

    expect(preferences).toEqual(defaultPreferences);
  });

  it("should migrate legacy NexusPlay preferences", () => {
    const legacyPreferences = { ...defaultPreferences, accent: "cyan" };
    localStorage.setItem("nexusplay_preferences", JSON.stringify(legacyPreferences));

    expect(getPreferences()).toEqual(legacyPreferences);
    expect(localStorage.getItem(PREFERENCES_KEY)).toBe(JSON.stringify(legacyPreferences));
    expect(localStorage.getItem("nexusplay_preferences")).toBeNull();
  });

  it("should restore the NekoBox default appearance", () => {
    savePreferences({ ...defaultPreferences, base: "graphite", accent: "pink" });

    const preferences = resetPreferences();

    expect(preferences).toEqual(defaultPreferences);
  });
});
