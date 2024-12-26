"use client";

import { ListView } from "./ListView";
import { GridView } from "./GridView";
import { Song } from "@/lib/types";
export function MonthDisplay({
  month,
  songs,
  showAdminControls,
  onUpdateSong,
  onDeleteSong,
  viewMode = "grid",
  stackMode,
}: {
  month: string;
  songs: Song[];
  showAdminControls?: boolean;
  onUpdateSong?: (songId: string, updates: Partial<Song>) => Promise<void>;
  onDeleteSong?: (songId: string) => Promise<void>;
  viewMode: "grid" | "list";
  stackMode?: boolean;
}) {
  const date = new Date(`${month}-01T00:00:00.000Z`);
  const monthName = new Intl.DateTimeFormat("default", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);

  if (viewMode === "list") {
    return (
      <ListView
        songs={songs}
        showAdminControls={showAdminControls}
        onUpdateSong={onUpdateSong}
        onDeleteSong={onDeleteSong}
      />
    );
  } else {
    return (
      <GridView
        songs={songs}
        showAdminControls={showAdminControls}
        onUpdateSong={onUpdateSong}
        onDeleteSong={onDeleteSong}
        stackMode={stackMode}
      />
    );
  }
}
