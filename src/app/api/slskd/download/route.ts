import { NextRequest, NextResponse } from "next/server";
import { queueDownload } from "@/lib/slskd";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, files, url, apiKey } = body;

    const baseUrl = url || process.env.SLSKD_URL || "http://localhost:5030";
    const key = apiKey || process.env.SLSKD_API_KEY || "";

    if (!username || !files?.length) {
      return NextResponse.json(
        { error: "username and files required" },
        { status: 400 }
      );
    }

    await queueDownload(baseUrl, key, { username, files });
    return NextResponse.json({ success: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "slskd download failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
