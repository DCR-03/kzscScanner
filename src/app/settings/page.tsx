"use client";

import { useState } from "react";
import { useSettings } from "@/hooks/useSettings";

type TestStatus = "idle" | "testing" | "ok" | "error";

export default function SettingsPage() {
  const { settings, updateSettings, loaded } = useSettings();

  const [subsonicTest, setSubsonicTest] = useState<TestStatus>("idle");
  const [slskdTest, setSlskdTest] = useState<TestStatus>("idle");
  const [subsonicError, setSubsonicError] = useState("");
  const [slskdError, setSlskdError] = useState("");

  const testSubsonic = async () => {
    setSubsonicTest("testing");
    setSubsonicError("");
    try {
      const res = await fetch("/api/subsonic/status?" + new URLSearchParams({
        url: settings.subsonic.url,
        username: settings.subsonic.username,
        password: settings.subsonic.password,
      }));
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setSubsonicTest("ok");
    } catch (err) {
      setSubsonicTest("error");
      setSubsonicError(err instanceof Error ? err.message : "Connection failed");
    }
  };

  const testSlskd = async () => {
    setSlskdTest("testing");
    setSlskdError("");
    try {
      const res = await fetch(
        `${settings.slskd.url}/api/v0/application`,
        { headers: { "X-API-Key": settings.slskd.apiKey } }
      );
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setSlskdTest("ok");
    } catch (err) {
      setSlskdTest("error");
      setSlskdError(err instanceof Error ? err.message : "Connection failed");
    }
  };

  if (!loaded) return null;

  return (
    <div className="flex flex-col gap-8">
      <h1 className="text-xl font-bold text-white">Settings</h1>

      {/* Subsonic */}
      <section className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
        <h2 className="text-white font-semibold mb-4">Subsonic / Navidrome</h2>
        <div className="flex flex-col gap-3">
          <input
            type="url"
            placeholder="Server URL (e.g. http://192.168.1.100:4533)"
            value={settings.subsonic.url}
            onChange={(e) =>
              updateSettings({
                subsonic: { ...settings.subsonic, url: e.target.value },
              })
            }
            className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-500"
          />
          <input
            type="text"
            placeholder="Username"
            value={settings.subsonic.username}
            onChange={(e) =>
              updateSettings({
                subsonic: { ...settings.subsonic, username: e.target.value },
              })
            }
            className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-500"
          />
          <input
            type="password"
            placeholder="Password"
            value={settings.subsonic.password}
            onChange={(e) =>
              updateSettings({
                subsonic: { ...settings.subsonic, password: e.target.value },
              })
            }
            className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-500"
          />
          <button
            onClick={testSubsonic}
            disabled={subsonicTest === "testing" || !settings.subsonic.url}
            className="px-4 py-2 bg-zinc-700 hover:bg-zinc-600 disabled:bg-zinc-800 disabled:text-zinc-600 text-white text-sm rounded-lg transition-colors"
          >
            {subsonicTest === "testing"
              ? "Testing..."
              : subsonicTest === "ok"
                ? "Connected"
                : "Test Connection"}
          </button>
          {subsonicError && (
            <p className="text-xs text-red-400">{subsonicError}</p>
          )}
        </div>
      </section>

      {/* slskd */}
      <section className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
        <h2 className="text-white font-semibold mb-4">slskd (Soulseek)</h2>
        <div className="flex flex-col gap-3">
          <input
            type="url"
            placeholder="slskd URL (e.g. http://localhost:5030)"
            value={settings.slskd.url}
            onChange={(e) =>
              updateSettings({
                slskd: { ...settings.slskd, url: e.target.value },
              })
            }
            className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-500"
          />
          <input
            type="password"
            placeholder="API Key"
            value={settings.slskd.apiKey}
            onChange={(e) =>
              updateSettings({
                slskd: { ...settings.slskd, apiKey: e.target.value },
              })
            }
            className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-500"
          />
          <button
            onClick={testSlskd}
            disabled={slskdTest === "testing" || !settings.slskd.url}
            className="px-4 py-2 bg-zinc-700 hover:bg-zinc-600 disabled:bg-zinc-800 disabled:text-zinc-600 text-white text-sm rounded-lg transition-colors"
          >
            {slskdTest === "testing"
              ? "Testing..."
              : slskdTest === "ok"
                ? "Connected"
                : "Test Connection"}
          </button>
          {slskdError && (
            <p className="text-xs text-red-400">{slskdError}</p>
          )}
        </div>
      </section>

      {/* Discogs */}
      <section className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
        <h2 className="text-white font-semibold mb-4">Discogs</h2>
        <p className="text-xs text-zinc-500 mb-3">
          Optional. Provides fallback album lookup when MusicBrainz has no results.
          Get a token at discogs.com/settings/developers.
        </p>
        <input
          type="password"
          placeholder="Personal Access Token"
          value={settings.discogs.token}
          onChange={(e) =>
            updateSettings({
              discogs: { ...settings.discogs, token: e.target.value },
            })
          }
          className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-500"
        />
      </section>
    </div>
  );
}
