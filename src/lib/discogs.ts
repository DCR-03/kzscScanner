import type { Album, Track } from "@/types";
import type {
  DiscogsSearchResponse,
  DiscogsRelease,
} from "@/types/discogs";

const DISCOGS_BASE = "https://api.discogs.com";

export async function searchByBarcode(
  barcode: string,
  token: string
): Promise<Album | null> {
  const headers: Record<string, string> = {
    "User-Agent": "kzscScanner/1.0.0",
  };
  if (token) {
    headers["Authorization"] = `Discogs token=${token}`;
  }

  const searchRes = await fetch(
    `${DISCOGS_BASE}/database/search?barcode=${barcode}&type=release&per_page=5`,
    { headers }
  );
  if (!searchRes.ok) return null;

  const data: DiscogsSearchResponse = await searchRes.json();
  if (!data.results?.length) return null;

  const result = data.results[0];

  // Fetch full release for tracks
  const releaseRes = await fetch(result.resource_url, { headers });
  if (!releaseRes.ok) return null;

  const release: DiscogsRelease = await releaseRes.json();

  const tracks: Track[] = release.tracklist
    .filter((t) => t.position) // skip headings
    .map((t, i) => ({
      position: i + 1,
      title: t.title,
      duration: t.duration || "",
    }));

  const artist = release.artists
    ?.map((a) => a.name.replace(/ \(\d+\)$/, "") + (a.join || ""))
    .join("")
    || result.title.split(" - ")[0]
    || "Unknown Artist";

  const coverUrl =
    release.images?.find((img) => img.type === "primary")?.uri150 ||
    result.cover_image ||
    "";

  return {
    title: release.title.includes(" - ")
      ? release.title.split(" - ").slice(1).join(" - ")
      : release.title,
    artist,
    barcode,
    year: release.year?.toString() || result.year || "",
    label: release.labels?.[0]?.name || result.label?.[0] || "",
    catalogNumber: release.labels?.[0]?.catno || result.catno || "",
    country: release.country || result.country || "",
    format: release.formats?.[0]?.name || result.format?.[0] || "CD",
    genre: release.genres?.[0] || result.genre?.[0] || "",
    coverUrl,
    tracks,
    source: "discogs",
    discogsId: release.id,
  };
}
