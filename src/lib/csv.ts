import type { Album } from "@/types";

const CLZ_COLUMNS = [
  "Artist",
  "Title",
  "Barcode",
  "Label",
  "Catalog Number",
  "Release Date",
  "Country",
  "Format",
  "Genre",
];

function escapeCsv(value: string): string {
  if (value.includes(",") || value.includes('"') || value.includes("\n")) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

function albumToRow(album: Album): string {
  return [
    album.artist,
    album.title,
    album.barcode,
    album.label,
    album.catalogNumber,
    album.year,
    album.country,
    album.format,
    album.genre,
  ]
    .map(escapeCsv)
    .join(",");
}

export function generateCsv(albums: Album[]): string {
  const header = CLZ_COLUMNS.join(",");
  const rows = albums.map(albumToRow);
  return [header, ...rows].join("\n");
}

export function downloadCsv(albums: Album[], filename?: string) {
  const csv = generateCsv(albums);
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename || `kzsc-export-${Date.now()}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}
