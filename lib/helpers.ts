import { Song } from "./types";

export function groupSongsByAlbum(songs: Song[]) {
  return songs.reduce((acc, song) => {
    const key = `${song.artist}___${song.album}`;
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(song);
    return acc;
  }, {} as Record<string, Song[]>);
}

export function getFormattedMonthName(addedAt: string) {
  return new Intl.DateTimeFormat("default", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  })
    .format(new Date(`${addedAt}`))
    .toLowerCase();
}
