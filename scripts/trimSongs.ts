import fs from "fs/promises";
import path from "path";
import songsJson from "../data/songs.json";
import { Song } from "../lib/types";

async function main() {
  const trimmedSongs = {
    songs: songsJson.songs.map((song: Song) => ({
      ...song,
      title: song.title.trim(),
      artist: song.artist.trim(),
      album: song.album.trim(),
    })),
  };

  // Write back to songs.json
  await fs.writeFile(
    path.join(process.cwd(), "data", "songs.json"),
    JSON.stringify(trimmedSongs, null, 2)
  );

  console.log(`✓ Trimmed ${trimmedSongs.songs.length} songs`);
}

main().catch(console.error); 