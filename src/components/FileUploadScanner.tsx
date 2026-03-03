"use client";

import { useState, useCallback, useRef } from "react";
import { normalizeBarcode, isValidBarcode } from "@/lib/barcode";
import type { ScannedBarcode } from "@/types";

interface FileUploadScannerProps {
  onScan: (result: ScannedBarcode) => void;
  disabled?: boolean;
}

export default function FileUploadScanner({
  onScan,
  disabled,
}: FileUploadScannerProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(
    async (file: File) => {
      setIsProcessing(true);
      setError(null);

      try {
        const Quagga = (await import("@ericblade/quagga2")).default;
        const { getDecodeSingleConfig } = await import(
          "@/lib/quagga-config"
        );

        const dataUrl = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.readAsDataURL(file);
        });

        const result = await new Promise<ScannedBarcode | null>(
          (resolve) => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            Quagga.decodeSingle(
              getDecodeSingleConfig(dataUrl) as any,
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              (res: any) => {
                const code = res?.codeResult?.code;
                const format = res?.codeResult?.format || "unknown";
                if (code && typeof code === "string" && isValidBarcode(code)) {
                  resolve({
                    code: normalizeBarcode(code),
                    format,
                    confidence: 1,
                    timestamp: Date.now(),
                  });
                } else {
                  resolve(null);
                }
              }
            );
          }
        );

        if (result) {
          onScan(result);
        } else {
          setError("No barcode found in image. Try a clearer photo.");
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to process image");
      } finally {
        setIsProcessing(false);
      }
    },
    [onScan]
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
    // Reset so the same file can be selected again
    e.target.value = "";
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleChange}
        className="hidden"
      />
      <button
        onClick={() => fileInputRef.current?.click()}
        disabled={disabled || isProcessing}
        className="w-full max-w-sm px-6 py-3 bg-zinc-700 hover:bg-zinc-600 disabled:bg-zinc-800 disabled:text-zinc-600 text-white font-medium rounded-xl transition-colors"
      >
        {isProcessing ? "Processing..." : "Upload Barcode Photo"}
      </button>
      {error && (
        <div className="w-full max-w-sm p-3 bg-red-900/30 border border-red-800 rounded-lg text-red-400 text-sm">
          {error}
        </div>
      )}
    </div>
  );
}
