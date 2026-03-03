import { NextRequest, NextResponse } from "next/server";
import { startSearch, getSearchResults } from "@/lib/slskd";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { searchText, url, apiKey } = body;

    const baseUrl = url || process.env.SLSKD_URL || "http://localhost:5030";
    const key = apiKey || process.env.SLSKD_API_KEY || "";

    if (!searchText) {
      return NextResponse.json({ error: "searchText required" }, { status: 400 });
    }

    const id = await startSearch(baseUrl, key, searchText);
    return NextResponse.json({ id });
  } catch (err) {
    const message = err instanceof Error ? err.message : "slskd search failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const id = request.nextUrl.searchParams.get("id");
    const url = request.nextUrl.searchParams.get("url") || process.env.SLSKD_URL || "http://localhost:5030";
    const apiKey = request.nextUrl.searchParams.get("apiKey") || process.env.SLSKD_API_KEY || "";

    if (!id) {
      return NextResponse.json({ error: "id parameter required" }, { status: 400 });
    }

    const results = await getSearchResults(url, apiKey, id);
    return NextResponse.json(results);
  } catch (err) {
    const message = err instanceof Error ? err.message : "slskd get results failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
