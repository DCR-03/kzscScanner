import { NextRequest, NextResponse } from "next/server";
import { startScan } from "@/lib/subsonic";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const url = body.url || process.env.SUBSONIC_URL || "";
    const username = body.username || process.env.SUBSONIC_USER || "";
    const password = body.password || process.env.SUBSONIC_PASS || "";

    if (!url || !username || !password) {
      return NextResponse.json(
        { error: "Subsonic not configured. Set URL, username, and password in Settings." },
        { status: 400 }
      );
    }

    const result = await startScan(url, username, password);
    const sub = result["subsonic-response"];
    if (sub.status === "failed") {
      return NextResponse.json(
        { error: sub.error?.message || "Subsonic error" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      scanning: sub.scanStatus?.scanning ?? true,
      count: sub.scanStatus?.count ?? 0,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Subsonic scan failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
