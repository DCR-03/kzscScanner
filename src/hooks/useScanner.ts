"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { normalizeBarcode, isValidBarcode } from "@/lib/barcode";
import type { ScannedBarcode } from "@/types";

const CONFIDENCE_THRESHOLD = 3;
const CONFIDENCE_WINDOW_MS = 2000;

export function useScanner() {
  const [isScanning, setIsScanning] = useState(false);
  const [lastResult, setLastResult] = useState<ScannedBarcode | null>(null);
  const [error, setError] = useState<string | null>(null);
  const quaggaRef = useRef<typeof import("@ericblade/quagga2").default | null>(null);
  const readsRef = useRef<Map<string, number[]>>(new Map());
  const scannerRef = useRef<HTMLElement | null>(null);

  const start = useCallback(async (target: HTMLElement) => {
    setError(null);
    scannerRef.current = target;
    readsRef.current.clear();

    try {
      const Quagga = (await import("@ericblade/quagga2")).default;
      quaggaRef.current = Quagga;

      const { getQuaggaConfig } = await import("@/lib/quagga-config");
      const config = getQuaggaConfig(target);

      await new Promise<void>((resolve, reject) => {
        Quagga.init(config, (err: unknown) => {
          if (err) {
            reject(err);
            return;
          }
          resolve();
        });
      });

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      Quagga.onDetected((result: any) => {
        const code: string | undefined = result?.codeResult?.code ?? undefined;
        const format: string = result?.codeResult?.format || "unknown";
        if (!code || !isValidBarcode(code)) return;

        const normalized = normalizeBarcode(code);
        const now = Date.now();
        const reads = readsRef.current;

        // Get existing reads for this code
        const existing = reads.get(normalized) || [];
        // Filter to recent window
        const recent = existing.filter((t) => now - t < CONFIDENCE_WINDOW_MS);
        recent.push(now);
        reads.set(normalized, recent);

        if (recent.length >= CONFIDENCE_THRESHOLD) {
          // We have enough confident reads
          setLastResult({
            code: normalized,
            format,
            confidence: recent.length,
            timestamp: now,
          });
          // Stop scanning after confident read
          Quagga.stop();
          setIsScanning(false);
        }
      });

      Quagga.start();
      setIsScanning(true);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to start scanner";
      if (message.includes("Permission") || message.includes("NotAllowed")) {
        setError("Camera permission denied. Please allow camera access and try again.");
      } else {
        setError(message);
      }
      setIsScanning(false);
    }
  }, []);

  const stop = useCallback(() => {
    if (quaggaRef.current) {
      quaggaRef.current.stop();
      quaggaRef.current.offDetected();
    }
    setIsScanning(false);
  }, []);

  const reset = useCallback(() => {
    setLastResult(null);
    setError(null);
    readsRef.current.clear();
  }, []);

  useEffect(() => {
    return () => {
      if (quaggaRef.current) {
        try { quaggaRef.current.stop(); } catch { /* ignore */ }
      }
    };
  }, []);

  return { isScanning, lastResult, error, start, stop, reset };
}
