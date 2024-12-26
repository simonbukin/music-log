import fs from "fs/promises";
import path from "path";
import fetch from "node-fetch";
import songsJson from "../data/songs.json";

const songs = songsJson.songs;

async function downloadImage(url: string, filename: string): Promise<void> {
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Failed to fetch ${url}`);

    const buffer = await response.buffer();
    await fs.writeFile(filename, buffer);
    console.log(`✓ Downloaded: ${filename}`);
  } catch (error) {
    console.error(`✕ Failed to download ${url}:`, error);
  }
}

function sanitizeFileName(str: string): string {
  return str
    .replace(/[^a-z0-9-]/gi, "_") // Replace invalid chars with underscore
    .replace(/_+/g, "_") // Replace multiple underscores with single
    .toLowerCase();
}

function generateFileName(song: (typeof songs)[0]): string {
  const artist = sanitizeFileName(song.artist);
  const album = sanitizeFileName(song.album || "no-album");

  return `${artist}-${album}.jpg`;
}

async function cacheImages() {
  const cacheDir = path.join(process.cwd(), "public", "image-cache");

  // Track processed artist-album pairs to avoid duplicate downloads
  const processed = new Set<string>();

  try {
    await fs.mkdir(cacheDir, { recursive: true });
  } catch (error) {
    console.error("Failed to create cache directory:", error);
    return;
  }

  for (const song of songs) {
    if (!song.albumArt) continue;

    const filename = generateFileName(song);
    // Skip if we've already processed this artist-album combination
    if (processed.has(filename)) continue;
    processed.add(filename);

    const filepath = path.join(cacheDir, filename);

    try {
      await fs.access(filepath);
      console.log(`→ Already cached: ${filename}`);
      continue;
    } catch {
      await downloadImage(song.albumArt, filepath);
    }
  }
}

cacheImages().catch(console.error);
