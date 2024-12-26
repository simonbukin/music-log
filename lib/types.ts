export type Song = {
  id: string;
  title: string;
  artist: string;
  album: string;
  albumArt: string;
  youtubeUrl: string;
  addedAt: string; // ISO date string
};

export type MonthData = {
  [key: string]: Song[]; // key format: "2024-03"
};
