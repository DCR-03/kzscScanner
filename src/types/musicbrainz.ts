export interface MBRelease {
  id: string;
  title: string;
  date?: string;
  country?: string;
  barcode?: string;
  "label-info"?: Array<{
    "catalog-number"?: string;
    label?: { name: string };
  }>;
  "artist-credit"?: Array<{
    artist: { name: string };
    joinphrase?: string;
  }>;
  media?: Array<{
    format?: string;
    tracks?: Array<{
      position: number;
      title: string;
      length?: number;
      recording?: { title: string; length?: number };
    }>;
  }>;
  "release-group"?: {
    "primary-type"?: string;
  };
}

export interface MBSearchResponse {
  releases: MBRelease[];
  count: number;
}

export interface MBReleaseDetail extends MBRelease {
  media: Array<{
    format?: string;
    tracks: Array<{
      position: number;
      title: string;
      length?: number;
      recording: { title: string; length?: number };
    }>;
  }>;
}
