import { createHash } from "crypto";
import type { SubsonicResponse } from "@/types/subsonic";

function generateAuth(password: string) {
  const salt = Math.random().toString(36).substring(2, 10);
  const token = createHash("md5")
    .update(password + salt)
    .digest("hex");
  return { t: token, s: salt };
}

function buildUrl(
  baseUrl: string,
  endpoint: string,
  username: string,
  password: string
): string {
  const { t, s } = generateAuth(password);
  const params = new URLSearchParams({
    u: username,
    t,
    s,
    v: "1.16.1",
    c: "kzscScanner",
    f: "json",
  });
  return `${baseUrl}/rest/${endpoint}?${params}`;
}

export async function startScan(
  baseUrl: string,
  username: string,
  password: string
): Promise<SubsonicResponse> {
  const url = buildUrl(baseUrl, "startScan", username, password);
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Subsonic startScan failed: ${res.status}`);
  return res.json();
}

export async function getScanStatus(
  baseUrl: string,
  username: string,
  password: string
): Promise<SubsonicResponse> {
  const url = buildUrl(baseUrl, "getScanStatus", username, password);
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Subsonic getScanStatus failed: ${res.status}`);
  return res.json();
}

export async function ping(
  baseUrl: string,
  username: string,
  password: string
): Promise<SubsonicResponse> {
  const url = buildUrl(baseUrl, "ping", username, password);
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Subsonic ping failed: ${res.status}`);
  return res.json();
}
