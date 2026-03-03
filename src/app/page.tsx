"use client";

import { useState, useCallback } from "react";
import Scanner from "@/components/Scanner";
import FileUploadScanner from "@/components/FileUploadScanner";
import AlbumResult from "@/components/AlbumResult";
import AlbumActions from "@/components/AlbumActions";
import { useAlbumLookup } from "@/hooks/useAlbumLookup";
import { useScanHistory } from "@/hooks/useScanHistory";
import type { ScannedBarcode } from "@/types";

export default function HomePage() {
  const [mode, setMode] = useState<"camera" | "upload">("camera");
  const [scannedBarcode, setScannedBarcode] = useState<string | null>(null);
  const { album, isLoading, error, lookup, reset: resetLookup } = useAlbumLookup();
  const { addEntry } = useScanHistory();

  const handleScan = useCallback(
    async (result: ScannedBarcode) => {
      setScannedBarcode(result.code);
      const found = await lookup(result.code);
      addEntry(result.code, found);
    },
    [lookup, addEntry]
  );

  const handleReset = () => {
    setScannedBarcode(null);
    resetLookup();
  };

  return (
    <div className="flex flex-col items-center gap-6">
      {/* Mode toggle */}
      {!scannedBarcode && (
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
        </div>
      )}

      {/* Scanner */}
      {!scannedBarcode && (
        mode === "camera" ? (
          <Scanner onScan={handleScan} disabled={isLoading} />
        ) : (
          <FileUploadScanner onScan={handleScan} disabled={isLoading} />
        )
      )}

      {/* Scanned barcode info */}
      {scannedBarcode && (
        <div className="w-full max-w-sm text-center">
          <div className="text-sm text-zinc-500 mb-1">Scanned barcode</div>
          <div className="text-lg font-mono text-white">{scannedBarcode}</div>
        </div>
      )}

      {/* Loading state */}
      {isLoading && (
        <div className="flex items-center gap-3 text-zinc-400">
          <div className="animate-spin w-5 h-5 border-2 border-zinc-600 border-t-emerald-400 rounded-full" />
          Looking up album...
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="w-full max-w-sm p-3 bg-red-900/30 border border-red-800 rounded-lg text-red-400 text-sm">
          {error}
        </div>
      )}

      {/* Album result */}
      {album && (
        <>
          <AlbumResult album={album} />
          <AlbumActions album={album} />
        </>
      )}

      {/* Reset button */}
      {scannedBarcode && !isLoading && (
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
