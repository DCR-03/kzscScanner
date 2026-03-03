import type { Album, Track } from "@/types";
import type { MBSearchResponse, MBReleaseDetail } from "@/types/musicbrainz";

const MB_BASE = "https://musicbrainz.org/ws/2";
const COVER_BASE = "https://coverartarchive.org";
const USER_AGENT = "kzscScanner/1.0.0 (https://github.com/kzsc-scanner)";

export async function searchByBarcode(barcode: string): Promise<Album | null> {
  const searchRes = await fetch(
    `${MB_BASE}/release/?query=barcode:${barcode}&fmt=json&limit=5`,
    { headers: { "User-Agent": USER_AGENT } }
  );
  if (!searchRes.ok) return null;

  const data: MBSearchResponse = await searchRes.json();
  if (!data.releases?.length) return null;

  const release = data.releases[0];

  // Fetch full release with recordings
  const detailRes = await fetch(
    `${MB_BASE}/release/${release.id}?inc=recordings+artist-credits+labels&fmt=json`,
    { headers: { "User-Agent": USER_AGENT } }
  );

  let tracks: Track[] = [];
  let label = "";
  let catalogNumber = "";
  let format = "";

  if (detailRes.ok) {
    const detail: MBReleaseDetail = await detailRes.json();
    if (detail.media?.length) {
      format = detail.media[0].format || "CD";
      tracks = detail.media.flatMap((m) =>
        (m.tracks || []).map((t) => ({
          position: t.position,
          title: t.recording?.title || t.title,
          duration: t.recording?.length
            ? formatDuration(t.recording.length)
            : t.length
              ? formatDuration(t.length)
              : "",
        }))
      );
    }
    if (detail["label-info"]?.length) {
      label = detail["label-info"][0]?.label?.name || "";
      catalogNumber = detail["label-info"][0]?.["catalog-number"] || "";
    }
  }

  const artist = release["artist-credit"]
    ?.map((ac) => ac.artist.name + (ac.joinphrase || ""))
    .join("")
    || "Unknown Artist";

  // Try cover art
  let coverUrl = "";
  try {
    const coverRes = await fetch(`${COVER_BASE}/release/${release.id}/front-250`, {
      redirect: "follow",
    });
    if (coverRes.ok) {
      coverUrl = coverRes.url;
    }
  } catch {
    // Cover art not available
  }

  return {
    title: release.title,
    artist,
    barcode,
    year: release.date?.substring(0, 4) || "",
    label,
    catalogNumber,
    country: release.country || "",
    format: format || "CD",
    genre: "",
    coverUrl,
    tracks,
    source: "musicbrainz",
    mbid: release.id,
  };
}

function formatDuration(ms: number): string {
  const totalSeconds = Math.round(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}
