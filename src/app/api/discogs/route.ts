import { NextRequest, NextResponse } from "next/server";
import { searchByBarcode } from "@/lib/discogs";
import { rateLimit } from "@/lib/rate-limiter";

export async function GET(request: NextRequest) {
  const barcode = request.nextUrl.searchParams.get("barcode");
  if (!barcode) {
    return NextResponse.json({ error: "barcode parameter required" }, { status: 400 });
  }

  // Token from env or query param (settings page sends it)
  const token =
    request.nextUrl.searchParams.get("token") ||
    process.env.DISCOGS_TOKEN ||
    "";

  try {
    await rateLimit("discogs", 1000); // 60/min
    const album = await searchByBarcode(barcode, token);
    return NextResponse.json({ album });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Discogs lookup failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
