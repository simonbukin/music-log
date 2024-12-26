import { writeFile, readFile } from "fs/promises";
import { NextResponse } from "next/server";
import path from "path";

export async function POST(request: Request) {
  try {
    const song = await request.json();
    const songsPath = path.join(process.cwd(), "data", "songs.json");

    // Read current songs
    const currentData = JSON.parse(await readFile(songsPath, "utf8"));

    // Add new song
    currentData.songs.push(song);

    // Write back to file
    await writeFile(songsPath, JSON.stringify(currentData, null, 2));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to save song:", error);
    return NextResponse.json({ error: "Failed to save song" }, { status: 500 });
  }
}
