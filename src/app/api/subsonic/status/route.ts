import { NextRequest, NextResponse } from "next/server";
import { getScanStatus } from "@/lib/subsonic";

export async function GET(request: NextRequest) {
  try {
    const url = request.nextUrl.searchParams.get("url") || process.env.SUBSONIC_URL || "";
    const username = request.nextUrl.searchParams.get("username") || process.env.SUBSONIC_USER || "";
    const password = request.nextUrl.searchParams.get("password") || process.env.SUBSONIC_PASS || "";

    if (!url || !username || !password) {
      return NextResponse.json(
        { error: "Subsonic not configured" },
        { status: 400 }
      );
    }

    const result = await getScanStatus(url, username, password);
    const sub = result["subsonic-response"];
    if (sub.status === "failed") {
      return NextResponse.json(
        { error: sub.error?.message || "Subsonic error" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      scanning: sub.scanStatus?.scanning ?? false,
      count: sub.scanStatus?.count ?? 0,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Subsonic status check failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
