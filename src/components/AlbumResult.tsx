"use client";

import type { Album } from "@/types";
import TrackList from "./TrackList";

interface AlbumResultProps {
  album: Album;
}

export default function AlbumResult({ album }: AlbumResultProps) {
  return (
    <div className="w-full max-w-sm bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
      {/* Header with cover art */}
      <div className="flex gap-4 p-4">
        {album.coverUrl ? (
          <img
            src={album.coverUrl}
            alt={`${album.title} cover`}
            className="w-24 h-24 rounded-lg object-cover flex-shrink-0 bg-zinc-800"
          />
        ) : (
          <div className="w-24 h-24 rounded-lg bg-zinc-800 flex items-center justify-center flex-shrink-0">
            <svg className="w-8 h-8 text-zinc-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
            </svg>
          </div>
        )}
        <div className="min-w-0 flex-1">
          <h2 className="text-white font-semibold text-lg leading-tight truncate">
            {album.title}
          </h2>
          <p className="text-zinc-400 text-sm truncate">{album.artist}</p>
          <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-xs text-zinc-500">
            {album.year && <span>{album.year}</span>}
            {album.label && <span>{album.label}</span>}
            {album.format && <span>{album.format}</span>}
            {album.country && <span>{album.country}</span>}
          </div>
          <div className="mt-1 text-xs text-zinc-600">
            {album.barcode} &middot; via {album.source}
          </div>
        </div>
      </div>

      {/* Tracks */}
      {album.tracks.length > 0 && <TrackList tracks={album.tracks} />}
    </div>
  );
}
