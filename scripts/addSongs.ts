import fs from "fs/promises";
import path from "path";
import { parse } from "csv-parse/sync";
import songsJson from "../data/songs.json";
import { Song } from "../lib/types";
import readline from "readline";

type CsvRow = [string, string, string, ...any[]]; // First 3 columns, ignore rest

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

async function getSpotifyToken() {
  console.log(process.env.SPOTIFY_CLIENT_ID);
  console.log(process.env.SPOTIFY_CLIENT_SECRET);
  const response = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${Buffer.from(
        `${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`
      ).toString("base64")}`,
    },
    body: "grant_type=client_credentials",
  });

  const data = await response.json();
  return data.access_token;
}

async function searchSpotify(artist: string, album: string, token: string) {
  try {
    const response = await fetch(
      `https://api.spotify.com/v1/search?q=${encodeURIComponent(
        `artist:${artist} album:${album}`
      )}&type=album&limit=1`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    const data = await response.json();
    return data.albums?.items[0]?.images[1]?.url || ""; // Using medium size image
  } catch (error) {
    console.warn(`Failed to fetch Spotify cover art for ${album} by ${artist}`);
    return "";
  }
}

async function promptForCoverArt(
  artist: string,
  album: string
): Promise<string> {
  return new Promise((resolve) => {
    rl.question(
      `No cover art found for "${album}" by ${artist}. Please enter a valid image URL (or press enter to skip): `,
      (answer) => {
        resolve(answer.trim());
      }
    );
  });
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
    const spotifyToken = await getSpotifyToken();

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

      // Add delay between Spotify API calls
      if (newSongs.length > 0) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }

      let albumArt = await searchSpotify(artist, album, spotifyToken);

      // If no cover art found, prompt for manual input
      if (!albumArt) {
        albumArt = await promptForCoverArt(artist, album);
      }

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

    rl.close();
  } catch (error) {
    console.error("Failed to process songs:", error);
    rl.close();
    process.exit(1);
  }
}

main().catch(console.error);
