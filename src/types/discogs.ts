export interface DiscogsSearchResult {
  id: number;
  title: string;
  year?: string;
  country?: string;
  label?: string[];
  catno?: string;
  format?: string[];
  genre?: string[];
  cover_image?: string;
  thumb?: string;
  resource_url: string;
}

export interface DiscogsSearchResponse {
  results: DiscogsSearchResult[];
  pagination: {
    pages: number;
    items: number;
  };
}

export interface DiscogsRelease {
  id: number;
  title: string;
  artists: Array<{ name: string; join?: string }>;
  year?: number;
  country?: string;
  labels?: Array<{ name: string; catno?: string }>;
  formats?: Array<{ name: string }>;
  genres?: string[];
  styles?: string[];
  images?: Array<{ type: string; uri: string; uri150: string }>;
  tracklist: Array<{
    position: string;
    title: string;
    duration: string;
  }>;
}
