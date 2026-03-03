export interface SlskdSearchRequest {
  searchText: string;
}

export interface SlskdFile {
  filename: string;
  size: number;
  bitRate?: number;
  sampleRate?: number;
  bitDepth?: number;
  length?: number;
}

export interface SlskdSearchResult {
  username: string;
  fileCount: number;
  hasFreeUploadSlot: boolean;
  uploadSpeed: number;
  files: SlskdFile[];
}

export interface SlskdSearchResponse {
  id: string;
  searchText: string;
  state: string;
  responseCount: number;
  fileCount: number;
  responses: SlskdSearchResult[];
}

export interface SlskdDownloadRequest {
  username: string;
  files: Array<{ filename: string; size: number }>;
}
