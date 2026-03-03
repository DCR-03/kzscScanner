"use client";

import { useState, useCallback } from "react";
import Scanner from "@/components/Scanner";
import FileUploadScanner from "@/components/FileUploadScanner";
import ImageCapture from "@/components/ImageCapture";
import AlbumResult from "@/components/AlbumResult";
import AlbumActions from "@/components/AlbumActions";
import { useAlbumLookup } from "@/hooks/useAlbumLookup";
import { useGeminiIdentify } from "@/hooks/useGeminiIdentify";
import { useScanHistory } from "@/hooks/useScanHistory";
import type { ScannedBarcode } from "@/types";

type Mode = "camera" | "upload" | "identify";

export default function HomePage() {
  const [mode, setMode] = useState<Mode>("camera");
  const [scannedBarcode, setScannedBarcode] = useState<string | null>(null);
  const [identifyActive, setIdentifyActive] = useState(false);
  const {
    album: barcodeAlbum,
    isLoading: barcodeLoading,
    error: barcodeError,
    lookup,
    reset: resetBarcode,
  } = useAlbumLookup();
  const {
    album: geminiAlbum,
    isLoading: geminiLoading,
    error: geminiError,
    identify,
    reset: resetGemini,
  } = useGeminiIdentify();
  const { addEntry } = useScanHistory();

  // Derive active state based on mode
  const activeAlbum = mode === "identify" ? geminiAlbum : barcodeAlbum;
  const activeLoading = mode === "identify" ? geminiLoading : barcodeLoading;
  const activeError = mode === "identify" ? geminiError : barcodeError;
  const hasResult = scannedBarcode || identifyActive;

  const handleScan = useCallback(
    async (result: ScannedBarcode) => {
      setScannedBarcode(result.code);
      const found = await lookup(result.code);
      addEntry(result.code, found);
    },
    [lookup, addEntry]
  );

  const handleImageCapture = useCallback(
    async (base64: string, mimeType: string) => {
      setIdentifyActive(true);
      const found = await identify(base64, mimeType);
      addEntry("gemini-identify", found);
    },
    [identify, addEntry]
  );

  const handleReset = () => {
    setScannedBarcode(null);
    setIdentifyActive(false);
    resetBarcode();
    resetGemini();
  };

  return (
    <div className="flex flex-col items-center gap-6">
      {/* Mode toggle */}
      {!hasResult && (
        <div className="flex bg-zinc-900 rounded-lg p-1 w-full max-w-sm">
          <button
            onClick={() => setMode("camera")}
            className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${
              mode === "camera"
                ? "bg-zinc-700 text-white"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            Camera
          </button>
          <button
            onClick={() => setMode("upload")}
            className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${
              mode === "upload"
                ? "bg-zinc-700 text-white"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            Upload Photo
          </button>
          <button
            onClick={() => setMode("identify")}
            className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${
              mode === "identify"
                ? "bg-zinc-700 text-white"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            AI Identify
          </button>
        </div>
      )}

      {/* Scanner / Image capture */}
      {!hasResult && mode === "camera" && (
        <Scanner onScan={handleScan} disabled={activeLoading} />
      )}
      {!hasResult && mode === "upload" && (
        <FileUploadScanner onScan={handleScan} disabled={activeLoading} />
      )}
      {!hasResult && mode === "identify" && (
        <ImageCapture onCapture={handleImageCapture} disabled={activeLoading} />
      )}

      {/* Scanned barcode info */}
      {scannedBarcode && (
        <div className="w-full max-w-sm text-center">
          <div className="text-sm text-zinc-500 mb-1">Scanned barcode</div>
          <div className="text-lg font-mono text-white">{scannedBarcode}</div>
        </div>
      )}

      {/* Loading state */}
      {activeLoading && (
        <div className="flex items-center gap-3 text-zinc-400">
          <div className="animate-spin w-5 h-5 border-2 border-zinc-600 border-t-emerald-400 rounded-full" />
          {mode === "identify" ? "Identifying album..." : "Looking up album..."}
        </div>
      )}

      {/* Error */}
      {activeError && (
        <div className="w-full max-w-sm p-3 bg-red-900/30 border border-red-800 rounded-lg text-red-400 text-sm">
          {activeError}
        </div>
      )}

      {/* Album result */}
      {activeAlbum && (
        <>
          <AlbumResult album={activeAlbum} />
          <AlbumActions album={activeAlbum} />
        </>
      )}

      {/* Reset button */}
      {hasResult && !activeLoading && (
        <button
          onClick={handleReset}
          className="w-full max-w-sm px-4 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-sm font-medium rounded-lg transition-colors"
        >
          Scan Another CD
        </button>
      )}
    </div>
  );
}
