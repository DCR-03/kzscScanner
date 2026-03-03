"use client";

import { useState, useCallback } from "react";
import type { Album } from "@/types";
import { loadSettings } from "@/lib/settings";

export function useAlbumLookup() {
  const [album, setAlbum] = useState<Album | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const lookup = useCallback(async (barcode: string) => {
    setIsLoading(true);
    setError(null);
    setAlbum(null);

    const settings = loadSettings();

    try {
      // Try MusicBrainz first
      const mbRes = await fetch(`/api/musicbrainz?barcode=${barcode}`);
      if (mbRes.ok) {
        const data = await mbRes.json();
        if (data.album) {
          setAlbum(data.album);
          setIsLoading(false);
          return data.album as Album;
        }
      }

      // Fallback to Discogs
      const params = new URLSearchParams({ barcode });
      if (settings.discogs.token) params.set("token", settings.discogs.token);
      const dcRes = await fetch(`/api/discogs?${params}`);
      if (dcRes.ok) {
        const data = await dcRes.json();
        if (data.album) {
          setAlbum(data.album);
          setIsLoading(false);
          return data.album as Album;
        }
      }

      setError("No album found for this barcode");
      setIsLoading(false);
      return null;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Lookup failed");
      setIsLoading(false);
      return null;
    }
  }, []);

  const reset = useCallback(() => {
    setAlbum(null);
    setError(null);
  }, []);

  return { album, isLoading, error, lookup, reset };
}
