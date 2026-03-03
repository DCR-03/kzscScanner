"use client";

import { useState, useCallback, useEffect } from "react";
import type { Album, ScanHistoryEntry } from "@/types";

const STORAGE_KEY = "kzsc-scan-history";

function loadHistory(): ScanHistoryEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function persistHistory(entries: ScanHistoryEntry[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
}

export function useScanHistory() {
  const [history, setHistory] = useState<ScanHistoryEntry[]>([]);

  useEffect(() => {
    setHistory(loadHistory());
  }, []);

  const addEntry = useCallback(
    (barcode: string, album: Album | null) => {
      setHistory((prev) => {
        const entry: ScanHistoryEntry = {
          id: `${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          barcode,
          album,
          scannedAt: Date.now(),
        };
        const next = [entry, ...prev];
        persistHistory(next);
        return next;
      });
    },
    []
  );

  const clearHistory = useCallback(() => {
    setHistory([]);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  return { history, addEntry, clearHistory };
}
