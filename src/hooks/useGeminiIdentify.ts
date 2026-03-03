"use client";

import { useState, useCallback } from "react";
import type { Album } from "@/types";
import { loadSettings } from "@/lib/settings";

export function useGeminiIdentify() {
  const [album, setAlbum] = useState<Album | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const identify = useCallback(async (base64: string, mimeType: string) => {
    setIsLoading(true);
    setError(null);
    setAlbum(null);

    const settings = loadSettings();
    const apiKey = settings.gemini.apiKey;

    if (!apiKey) {
      setError("Gemini API key not configured. Go to Settings to add one.");
      setIsLoading(false);
      return null;
    }

    try {
      const res = await fetch("/api/gemini/identify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: base64, mimeType, apiKey }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Gemini identification failed");
        setIsLoading(false);
        return null;
      }

      let finalAlbum: Album = data.album;

      // If Gemini detected a barcode, try to enrich via MusicBrainz/Discogs
      if (data.detectedBarcode) {
        try {
          const mbRes = await fetch(
            `/api/musicbrainz?barcode=${data.detectedBarcode}`
          );
          if (mbRes.ok) {
            const mbData = await mbRes.json();
            if (mbData.album) {
              finalAlbum = mbData.album;
            }
          }

          if (finalAlbum.source === "gemini") {
            const params = new URLSearchParams({
              barcode: data.detectedBarcode,
            });
            if (settings.discogs.token)
              params.set("token", settings.discogs.token);
            const dcRes = await fetch(`/api/discogs?${params}`);
            if (dcRes.ok) {
              const dcData = await dcRes.json();
              if (dcData.album) {
                finalAlbum = dcData.album;
              }
            }
          }
        } catch {
          // Enrichment failed — keep Gemini result
        }
      }

      setAlbum(finalAlbum);
      setIsLoading(false);
      return finalAlbum;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Identification failed");
      setIsLoading(false);
      return null;
    }
  }, []);

  const reset = useCallback(() => {
    setAlbum(null);
    setError(null);
  }, []);

  return { album, isLoading, error, identify, reset };
}
