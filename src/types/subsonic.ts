export interface SubsonicResponse {
  "subsonic-response": {
    status: "ok" | "failed";
    version: string;
    error?: { code: number; message: string };
    scanStatus?: {
      scanning: boolean;
      count?: number;
    };
  };
}
