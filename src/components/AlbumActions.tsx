"use client";

import { useState } from "react";
import type { Album } from "@/types";
import { downloadCsv } from "@/lib/csv";
import { loadSettings } from "@/lib/settings";
import SlskdSearchModal from "./SlskdSearchModal";

interface AlbumActionsProps {
  album: Album;
}

export default function AlbumActions({ album }: AlbumActionsProps) {
  const [showSlskd, setShowSlskd] = useState(false);
  const [scanStatus, setScanStatus] = useState<"idle" | "scanning" | "done" | "error">("idle");

  const handleExportCsv = () => {
    downloadCsv([album], `${album.artist} - ${album.title}.csv`);
  };

  const handleRescan = async () => {
    setScanStatus("scanning");
    const settings = loadSettings();
    try {
      const res = await fetch("/api/subsonic/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: settings.subsonic.url,
          username: settings.subsonic.username,
          password: settings.subsonic.password,
        }),
      });
      if (!res.ok) throw new Error("Scan request failed");
      const data = await res.json();
      if (data.error) throw new Error(data.error);

      // Poll for completion
      const params = new URLSearchParams({
        url: settings.subsonic.url,
        username: settings.subsonic.username,
        password: settings.subsonic.password,
      });
      const pollInterval = setInterval(async () => {
        try {
          const statusRes = await fetch(`/api/subsonic/status?${params}`);
          const statusData = await statusRes.json();
          if (!statusData.scanning) {
            clearInterval(pollInterval);
            setScanStatus("done");
            setTimeout(() => setScanStatus("idle"), 3000);
          }
        } catch {
          clearInterval(pollInterval);
          setScanStatus("error");
        }
      }, 2000);
    } catch {
      setScanStatus("error");
      setTimeout(() => setScanStatus("idle"), 3000);
    }
  };

  return (
    <>
      <div className="w-full max-w-sm flex flex-col gap-2">
        <button
          onClick={handleExportCsv}
          className="w-full px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-lg transition-colors"
        >
          Export to CLZ (CSV)
        </button>
        <button
          onClick={() => setShowSlskd(true)}
          className="w-full px-4 py-2.5 bg-purple-600 hover:bg-purple-500 text-white text-sm font-medium rounded-lg transition-colors"
        >
          Search Soulseek
        </button>
        <button
          onClick={handleRescan}
          disabled={scanStatus === "scanning"}
          className="w-full px-4 py-2.5 bg-amber-600 hover:bg-amber-500 disabled:bg-zinc-700 disabled:text-zinc-500 text-white text-sm font-medium rounded-lg transition-colors"
        >
          {scanStatus === "scanning"
            ? "Scanning..."
            : scanStatus === "done"
              ? "Scan Complete"
              : scanStatus === "error"
                ? "Scan Failed"
                : "Rescan Subsonic Library"}
        </button>
      </div>

      {showSlskd && (
        <SlskdSearchModal
          album={album}
          onClose={() => setShowSlskd(false)}
        />
      )}
    </>
  );
}
