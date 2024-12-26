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
  return viewMode === "list" ? (
    <ListView
      songs={songs}
      showAdminControls={showAdminControls}
      onUpdateSong={onUpdateSong}
      onDeleteSong={onDeleteSong}
    />
  ) : (
    <GridView
      songs={songs}
      showAdminControls={showAdminControls}
      onUpdateSong={onUpdateSong}
      onDeleteSong={onDeleteSong}
      stackMode={stackMode}
    />
  );
}
