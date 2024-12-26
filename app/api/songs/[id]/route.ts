import { writeFile, readFile } from "fs/promises";
import { NextResponse } from "next/server";
import path from "path";

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = await params;
    const update = await request.json();
    const songsPath = path.join(process.cwd(), "data", "songs.json");

    // Read current songs
    const currentData = JSON.parse(await readFile(songsPath, "utf8"));

    // Update the specific song
    currentData.songs = currentData.songs.map((song: any) =>
      song.id === id ? { ...song, ...update } : song
    );

    // Write back to file
    await writeFile(songsPath, JSON.stringify(currentData, null, 2));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to update song:", error);
    return NextResponse.json(
      { error: "Failed to update song" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = await params;
    const songsPath = path.join(process.cwd(), "data", "songs.json");

    // Read current songs
    const currentData = JSON.parse(await readFile(songsPath, "utf8"));

    // Remove the specific song
    currentData.songs = currentData.songs.filter((song: any) => song.id !== id);

    // Write back to file
    await writeFile(songsPath, JSON.stringify(currentData, null, 2));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete song:", error);
    return NextResponse.json(
      { error: "Failed to delete song" },
      { status: 500 }
    );
  }
}
