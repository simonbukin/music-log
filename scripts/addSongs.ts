import fs from "fs/promises";
import path from "path";
import { parse } from "csv-parse/sync";
import songsJson from "../data/songs.json";
import { Song } from "../lib/types";

type CsvRow = [string, string, string, ...any[]]; // First 3 columns, ignore rest

async function searchMusicBrainz(artist: string, album: string) {
  try {
    const response = await fetch(
      `https://musicbrainz.org/ws/2/release?query=${encodeURIComponent(
        `artist:${artist} AND release:${album}`
      )}&fmt=json`,
      {
        headers: {
          "User-Agent": "Songs/1.0.0 (simonbukin@gmail.com)",
        },
      }
    );
    const data = await response.json();

    if (data.releases?.[0]?.id) {
      // Try to get cover art from Cover Art Archive
      const coverResponse = await fetch(
        `https://coverartarchive.org/release/${data.releases[0].id}`
      );

      if (coverResponse.ok) {
        const coverData = await coverResponse.json();
        return coverData.images?.[0]?.thumbnails?.["250"] || "";
      }
    }
  } catch (error) {
    console.warn(`Failed to fetch cover art for ${album} by ${artist}`);
  }
  return "";
}

async function main() {
  // Check if CSV file path was provided
  if (process.argv.length < 3) {
    console.error("Please provide a CSV file path");
    process.exit(1);
  }

  const csvPath = process.argv[2];
  const targetMonth = process.argv[3] || new Date().toISOString().slice(0, 7); // YYYY-MM format

  try {
    // Read and parse CSV
    const csvContent = await fs.readFile(csvPath, "utf-8");
    const records = parse(csvContent, {
      columns: false, // Change to false to get array instead of object
      skip_empty_lines: true,
    }) as CsvRow[];

    // Transform CSV records to songs with cover art
    const newSongs: Song[] = [];

    for (const record of records.slice(1)) {
      const artist = record[0].split(";")[0].trim();
      const title = record[1].trim();
      const album = record[2].trim();

      // Add delay to avoid rate limiting
      if (newSongs.length > 0) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }

      const albumArt = await searchMusicBrainz(artist, album);

      newSongs.push({
        id: Date.now().toString(),
        title,
        artist,
        album,
        albumArt,
        youtubeUrl: `https://www.youtube.com/results?search_query=${encodeURIComponent(
          `${title} ${artist}`
        )}`,
        addedAt: `${targetMonth}-01T12:00:00.000Z`,
      });

      // Log progress
      console.log(`Processed: ${title} by ${artist}`);
    }

    // Add new songs to existing songs
    const updatedSongs = {
      songs: [...songsJson.songs, ...newSongs],
    };

    // Write back to songs.json
    await fs.writeFile(
      path.join(process.cwd(), "data", "songs.json"),
      JSON.stringify(updatedSongs, null, 2)
    );

    console.log(`✓ Added ${newSongs.length} songs for ${targetMonth}`);
  } catch (error) {
    console.error("Failed to process songs:", error);
    process.exit(1);
  }
}

main().catch(console.error);
