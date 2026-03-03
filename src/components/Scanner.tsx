"use client";

import { useRef, useCallback } from "react";
import { useScanner } from "@/hooks/useScanner";
import type { ScannedBarcode } from "@/types";

interface ScannerProps {
  onScan: (result: ScannedBarcode) => void;
  disabled?: boolean;
}

export default function Scanner({ onScan, disabled }: ScannerProps) {
  const viewfinderRef = useRef<HTMLDivElement>(null);
  const { isScanning, lastResult, error, start, stop, reset } = useScanner();
  const onScanRef = useRef(onScan);
  onScanRef.current = onScan;

  const handleStart = useCallback(() => {
    if (viewfinderRef.current) {
      reset();
      start(viewfinderRef.current);
    }
  }, [start, reset]);

  // Fire onScan when lastResult changes
  const prevResultRef = useRef<string | null>(null);
  if (lastResult && lastResult.code !== prevResultRef.current) {
    prevResultRef.current = lastResult.code;
    onScanRef.current(lastResult);
  }

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Viewfinder */}
      <div className="relative w-full max-w-sm aspect-[4/3] bg-black rounded-xl overflow-hidden">
        <div ref={viewfinderRef} className="w-full h-full [&>video]:w-full [&>video]:h-full [&>video]:object-cover" />

        {/* Targeting overlay */}
        {isScanning && (
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-[20%] left-[20%] right-[20%] bottom-[20%] border-2 border-emerald-400/60 rounded-lg">
              <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-emerald-400 rounded-tl-md" />
              <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-emerald-400 rounded-tr-md" />
              <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-emerald-400 rounded-bl-md" />
              <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-emerald-400 rounded-br-md" />
            </div>
            {/* Scanning line animation */}
            <div className="absolute top-[20%] left-[20%] right-[20%] h-0.5 bg-emerald-400/80 animate-pulse" />
          </div>
        )}

        {!isScanning && !lastResult && (
          <div className="absolute inset-0 flex items-center justify-center text-zinc-500 text-sm">
            Camera preview
          </div>
        )}
      </div>

      {/* Controls */}
      {!isScanning ? (
        <button
          onClick={handleStart}
          disabled={disabled}
          className="w-full max-w-sm px-6 py-3 bg-emerald-600 hover:bg-emerald-500 disabled:bg-zinc-700 disabled:text-zinc-500 text-white font-medium rounded-xl transition-colors"
        >
          Start Scanning
        </button>
      ) : (
        <button
          onClick={stop}
          className="w-full max-w-sm px-6 py-3 bg-red-600 hover:bg-red-500 text-white font-medium rounded-xl transition-colors"
        >
          Stop Scanning
        </button>
      )}

      {error && (
        <div className="w-full max-w-sm p-3 bg-red-900/30 border border-red-800 rounded-lg text-red-400 text-sm">
          {error}
        </div>
      )}
    </div>
  );
}
