import type { ServiceSettings } from "@/types";
import { DEFAULT_SETTINGS } from "@/types";

const STORAGE_KEY = "kzsc-settings";

export function loadSettings(): ServiceSettings {
  if (typeof window === "undefined") return DEFAULT_SETTINGS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveSettings(settings: ServiceSettings): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
}
