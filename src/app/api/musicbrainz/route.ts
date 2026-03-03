import { NextRequest, NextResponse } from "next/server";
import { searchByBarcode } from "@/lib/musicbrainz";
import { rateLimit } from "@/lib/rate-limiter";

export async function GET(request: NextRequest) {
  const barcode = request.nextUrl.searchParams.get("barcode");
  if (!barcode) {
    return NextResponse.json({ error: "barcode parameter required" }, { status: 400 });
  }

  try {
    await rateLimit("musicbrainz", 1100); // ~1 req/sec
    const album = await searchByBarcode(barcode);
    return NextResponse.json({ album });
  } catch (err) {
    const message = err instanceof Error ? err.message : "MusicBrainz lookup failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
