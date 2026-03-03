export interface Track {
  position: number;
  title: string;
  duration: string; // "mm:ss" or empty
}

export interface Album {
  title: string;
  artist: string;
  barcode: string;
  year: string;
  label: string;
  catalogNumber: string;
  country: string;
  format: string;
  genre: string;
  coverUrl: string;
  tracks: Track[];
  source: "musicbrainz" | "discogs";
  mbid?: string;
  discogsId?: number;
}

export interface ScannedBarcode {
  code: string;
  format: string;
  confidence: number;
  timestamp: number;
}

export interface ScanHistoryEntry {
  id: string;
  barcode: string;
  album: Album | null;
  scannedAt: number;
}

export interface ServiceSettings {
  subsonic: {
    url: string;
    username: string;
    password: string;
  };
  slskd: {
    url: string;
    apiKey: string;
  };
  discogs: {
    token: string;
  };
}

export const DEFAULT_SETTINGS: ServiceSettings = {
  subsonic: { url: "", username: "", password: "" },
  slskd: { url: "", apiKey: "" },
  discogs: { token: "" },
};
