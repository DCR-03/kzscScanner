"use client";

import { useScanHistory } from "@/hooks/useScanHistory";
import { downloadCsv } from "@/lib/csv";
import type { Album } from "@/types";

export default function HistoryPage() {
  const { history, clearHistory } = useScanHistory();

  const albumsWithData = history
    .filter((e) => e.album !== null)
    .map((e) => e.album as Album);

  const handleBatchExport = () => {
    if (!albumsWithData.length) return;
    downloadCsv(albumsWithData, `kzsc-batch-export-${Date.now()}.csv`);
  };

  const formatTime = (ts: number) => {
    const d = new Date(ts);
    return d.toLocaleString();
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-white">Scan History</h1>
        <span className="text-sm text-zinc-500">{history.length} scans</span>
      </div>

      {/* Actions */}
      {history.length > 0 && (
        <div className="flex gap-2">
          <button
            onClick={handleBatchExport}
            disabled={!albumsWithData.length}
            className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:bg-zinc-800 disabled:text-zinc-600 text-white text-sm font-medium rounded-lg transition-colors"
          >
            Export All to CLZ ({albumsWithData.length})
          </button>
          <button
            onClick={clearHistory}
            className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-400 text-sm rounded-lg transition-colors"
          >
            Clear
          </button>
        </div>
      )}

      {/* History list */}
      {history.length === 0 ? (
        <div className="text-center py-12 text-zinc-600">
          No scans yet. Go scan some CDs!
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {history.map((entry) => (
            <div
              key={entry.id}
              className="bg-zinc-900 border border-zinc-800 rounded-lg p-3 flex gap-3"
            >
              {entry.album?.coverUrl ? (
                <img
                  src={entry.album.coverUrl}
                  alt=""
                  className="w-12 h-12 rounded object-cover flex-shrink-0 bg-zinc-800"
                />
              ) : (
                <div className="w-12 h-12 rounded bg-zinc-800 flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-zinc-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                  </svg>
                </div>
              )}
              <div className="min-w-0 flex-1">
                {entry.album ? (
                  <>
                    <div className="text-sm text-white font-medium truncate">
                      {entry.album.title}
                    </div>
                    <div className="text-xs text-zinc-400 truncate">
                      {entry.album.artist}
                    </div>
                  </>
                ) : (
                  <div className="text-sm text-zinc-500">No album found</div>
                )}
                <div className="text-xs text-zinc-600 mt-0.5">
                  {entry.barcode} &middot; {formatTime(entry.scannedAt)}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
