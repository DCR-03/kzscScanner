import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import type { Album, Track } from "@/types";

const PROMPT = `You are a music CD identification expert. Analyze this image of a CD (it could be the front cover, back cover, spine, or disc itself) and identify the album.

Return ONLY a JSON object with this exact structure (no markdown, no explanation):
{
  "title": "Album Title",
  "artist": "Artist Name",
  "year": "Release Year or empty string",
  "label": "Record Label or empty string",
  "catalogNumber": "Catalog number or empty string",
  "country": "Country or empty string",
  "format": "CD",
  "genre": "Genre or empty string",
  "tracks": [{"position": 1, "title": "Track Title", "duration": "mm:ss or empty"}],
  "barcode": "Barcode number if visible, or empty string",
  "confidence": "high" | "medium" | "low"
}

If you can see track listings, include them. If you can read a barcode number, include it.
If you cannot identify the album at all, return: {"error": "Could not identify album from image"}`;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { image, mimeType, apiKey } = body as {
      image: string;
      mimeType: string;
      apiKey: string;
    };

    if (!image || !apiKey) {
      return NextResponse.json(
        { error: "image and apiKey are required" },
        { status: 400 }
      );
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const result = await model.generateContent([
      PROMPT,
      {
        inlineData: {
          mimeType: mimeType || "image/jpeg",
          data: image,
        },
      },
    ]);

    const text = result.response.text();

    // Strip markdown code fences if present
    const cleaned = text
      .replace(/```json\s*/gi, "")
      .replace(/```\s*/g, "")
      .trim();

    const parsed = JSON.parse(cleaned);

    if (parsed.error) {
      return NextResponse.json({ error: parsed.error }, { status: 404 });
    }

    const confidence: string = parsed.confidence || "medium";
    const detectedBarcode: string = parsed.barcode || "";

    const tracks: Track[] = Array.isArray(parsed.tracks)
      ? parsed.tracks.map((t: Record<string, unknown>, i: number) => ({
          position: typeof t.position === "number" ? t.position : i + 1,
          title: String(t.title || ""),
          duration: String(t.duration || ""),
        }))
      : [];

    const album: Album = {
      title: String(parsed.title || "Unknown Album"),
      artist: String(parsed.artist || "Unknown Artist"),
      barcode: detectedBarcode,
      year: String(parsed.year || ""),
      label: String(parsed.label || ""),
      catalogNumber: String(parsed.catalogNumber || ""),
      country: String(parsed.country || ""),
      format: String(parsed.format || "CD"),
      genre: String(parsed.genre || ""),
      coverUrl: "",
      tracks,
      source: "gemini",
    };

    return NextResponse.json({ album, detectedBarcode, confidence });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Gemini identification failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
