"use client";

import { useState } from "react";
import type { Track } from "@/types";

interface TrackListProps {
  tracks: Track[];
}

export default function TrackList({ tracks }: TrackListProps) {
  const [expanded, setExpanded] = useState(false);
  const shown = expanded ? tracks : tracks.slice(0, 5);

  return (
    <div className="border-t border-zinc-800">
      <div className="px-4 py-2">
        <h3 className="text-xs font-medium text-zinc-500 uppercase tracking-wider">
          Tracks ({tracks.length})
        </h3>
      </div>
      <ul className="divide-y divide-zinc-800/50">
        {shown.map((track) => (
          <li
            key={track.position}
            className="px-4 py-2 flex items-center gap-3 text-sm"
          >
            <span className="text-zinc-600 w-6 text-right flex-shrink-0">
              {track.position}
            </span>
            <span className="text-zinc-300 truncate flex-1">
              {track.title}
            </span>
            {track.duration && (
              <span className="text-zinc-600 flex-shrink-0">
                {track.duration}
              </span>
            )}
          </li>
        ))}
      </ul>
      {tracks.length > 5 && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="w-full px-4 py-2 text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
        >
          {expanded ? "Show less" : `Show all ${tracks.length} tracks`}
        </button>
      )}
    </div>
  );
}
