import type {
  SlskdSearchResponse,
  SlskdDownloadRequest,
} from "@/types/slskd";

export async function startSearch(
  baseUrl: string,
  apiKey: string,
  searchText: string
): Promise<string> {
  const res = await fetch(`${baseUrl}/api/v0/searches`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-API-Key": apiKey,
    },
    body: JSON.stringify({ searchText }),
  });
  if (!res.ok) throw new Error(`slskd search failed: ${res.status}`);
  const data = await res.json();
  return data.id;
}

export async function getSearchResults(
  baseUrl: string,
  apiKey: string,
  searchId: string
): Promise<SlskdSearchResponse> {
  const res = await fetch(`${baseUrl}/api/v0/searches/${searchId}`, {
    headers: { "X-API-Key": apiKey },
  });
  if (!res.ok) throw new Error(`slskd get results failed: ${res.status}`);
  return res.json();
}

export async function queueDownload(
  baseUrl: string,
  apiKey: string,
  request: SlskdDownloadRequest
): Promise<void> {
  const res = await fetch(
    `${baseUrl}/api/v0/transfers/downloads/${encodeURIComponent(request.username)}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-API-Key": apiKey,
      },
      body: JSON.stringify(
        request.files.map((f) => ({ filename: f.filename, size: f.size }))
      ),
    }
  );
  if (!res.ok) throw new Error(`slskd download failed: ${res.status}`);
}
