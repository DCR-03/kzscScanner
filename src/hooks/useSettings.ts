"use client";

import { useState, useCallback, useEffect } from "react";
import type { ServiceSettings } from "@/types";
import { DEFAULT_SETTINGS } from "@/types";
import { loadSettings, saveSettings } from "@/lib/settings";

export function useSettings() {
  const [settings, setSettingsState] = useState<ServiceSettings>(DEFAULT_SETTINGS);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setSettingsState(loadSettings());
    setLoaded(true);
  }, []);

  const updateSettings = useCallback(
    (update: Partial<ServiceSettings>) => {
      setSettingsState((prev) => {
        const next = { ...prev, ...update };
        saveSettings(next);
        return next;
      });
    },
    []
  );

  return { settings, updateSettings, loaded };
}
