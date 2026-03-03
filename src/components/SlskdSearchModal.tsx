"use client";

import { useState, useEffect, useCallback } from "react";
import type { Album } from "@/types";
import type { SlskdSearchResponse, SlskdFile } from "@/types/slskd";
import { loadSettings } from "@/lib/settings";

interface SlskdSearchModalProps {
  album: Album;
  onClose: () => void;
}

interface SelectedFile {
  username: string;
  file: SlskdFile;
}

export default function SlskdSearchModal({ album, onClose }: SlskdSearchModalProps) {
  const [results, setResults] = useState<SlskdSearchResponse | null>(null);
  const [isSearching, setIsSearching] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<SelectedFile[]>([]);
  const [downloadStatus, setDownloadStatus] = useState<"idle" | "downloading" | "done" | "error">("idle");

  const searchQuery = `${album.artist} ${album.title}`;

  useEffect(() => {
    let cancelled = false;

    async function doSearch() {
      const settings = loadSettings();
      try {
        const startRes = await fetch("/api/slskd/search", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            searchText: searchQuery,
            url: settings.slskd.url,
            apiKey: settings.slskd.apiKey,
          }),
        });
        if (!startRes.ok) throw new Error("Search failed to start");
        const { id } = await startRes.json();

        // Poll for results
        const params = new URLSearchParams({
          id,
          url: settings.slskd.url,
          apiKey: settings.slskd.apiKey,
        });
        const poll = async () => {
          if (cancelled) return;
          const res = await fetch(`/api/slskd/search?${params}`);
          if (!res.ok) throw new Error("Failed to get results");
          const data: SlskdSearchResponse = await res.json();

          if (!cancelled) setResults(data);

          if (data.state === "Completed" || data.state === "completed") {
            setIsSearching(false);
          } else {
            setTimeout(poll, 2000);
          }
        };

        setTimeout(poll, 2000);
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Search failed");
          setIsSearching(false);
        }
      }
    }

    doSearch();
    return () => { cancelled = true; };
  }, [searchQuery]);

  const toggleFile = useCallback((username: string, file: SlskdFile) => {
    setSelected((prev) => {
      const exists = prev.find(
        (s) => s.username === username && s.file.filename === file.filename
      );
      if (exists) {
        return prev.filter(
          (s) => !(s.username === username && s.file.filename === file.filename)
        );
      }
      return [...prev, { username, file }];
    });
  }, []);

  const handleDownload = async () => {
    if (!selected.length) return;
    setDownloadStatus("downloading");
    const settings = loadSettings();

    try {
      // Group by username
      const byUser = new Map<string, SlskdFile[]>();
      for (const s of selected) {
        const files = byUser.get(s.username) || [];
        files.push(s.file);
        byUser.set(s.username, files);
      }

      for (const [username, files] of byUser) {
        const res = await fetch("/api/slskd/download", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            username,
            files: files.map((f) => ({ filename: f.filename, size: f.size })),
            url: settings.slskd.url,
            apiKey: settings.slskd.apiKey,
          }),
        });
        if (!res.ok) throw new Error(`Download queue failed for ${username}`);
      }

      setDownloadStatus("done");
    } catch {
      setDownloadStatus("error");
    }
  };

  const formatSize = (bytes: number) => {
    if (bytes > 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    return `${(bytes / 1024).toFixed(0)} KB`;
  };

  const getFilename = (path: string) => {
    const parts = path.split(/[/\\]/);
    return parts[parts.length - 1];
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-end sm:items-center justify-center">
      <div className="bg-zinc-900 w-full max-w-lg max-h-[85vh] rounded-t-2xl sm:rounded-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-zinc-800">
          <div>
            <h2 className="text-white font-semibold">Soulseek Search</h2>
            <p className="text-xs text-zinc-500 truncate">{searchQuery}</p>
          </div>
          <button
            onClick={onClose}
            className="text-zinc-500 hover:text-white p-1"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {error && (
            <div className="p-3 bg-red-900/30 border border-red-800 rounded-lg text-red-400 text-sm mb-4">
              {error}
            </div>
          )}

          {isSearching && !results?.responses?.length && (
            <div className="text-center py-8 text-zinc-500">
              <div className="animate-spin w-6 h-6 border-2 border-zinc-600 border-t-emerald-400 rounded-full mx-auto mb-3" />
              Searching...
            </div>
          )}

          {results?.responses?.map((response) => (
            <div key={response.username} className="mb-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-sm font-medium text-zinc-300">
                  {response.username}
                </span>
                <span className="text-xs text-zinc-600">
                  {response.fileCount} files
                  {response.hasFreeUploadSlot && " | free slot"}
                </span>
              </div>
              <ul className="space-y-1">
                {response.files.map((file) => {
                  const isSelected = selected.some(
                    (s) =>
                      s.username === response.username &&
                      s.file.filename === file.filename
                  );
                  return (
                    <li
                      key={file.filename}
                      onClick={() => toggleFile(response.username, file)}
                      className={`p-2 rounded-md cursor-pointer text-xs transition-colors ${
                        isSelected
                          ? "bg-emerald-900/30 border border-emerald-800"
                          : "bg-zinc-800/50 hover:bg-zinc-800 border border-transparent"
                      }`}
                    >
                      <div className="text-zinc-300 truncate">
                        {getFilename(file.filename)}
                      </div>
                      <div className="text-zinc-600 mt-0.5">
                        {formatSize(file.size)}
                        {file.bitRate ? ` | ${file.bitRate}kbps` : ""}
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}

          {!isSearching && !results?.responses?.length && !error && (
            <div className="text-center py-8 text-zinc-500">No results found</div>
          )}
        </div>

        {/* Footer */}
        {selected.length > 0 && (
          <div className="p-4 border-t border-zinc-800">
            <button
              onClick={handleDownload}
              disabled={downloadStatus === "downloading"}
              className="w-full px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:bg-zinc-700 text-white text-sm font-medium rounded-lg transition-colors"
            >
              {downloadStatus === "downloading"
                ? "Queueing..."
                : downloadStatus === "done"
                  ? `Downloaded ${selected.length} files`
                  : downloadStatus === "error"
                    ? "Download failed - try again"
                    : `Download ${selected.length} file${selected.length > 1 ? "s" : ""}`}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
