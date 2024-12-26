"use client";

import { motion } from "framer-motion";
import { Song } from "@/lib/types";
import { SongCard } from "./SongCard";

export function MonthGrid({
  month,
  songs,
  showAdminControls,
  onUpdateSong,
  onDeleteSong,
}: {
  month: string;
  songs: Song[];
  showAdminControls?: boolean;
  onUpdateSong?: (songId: string, updates: Partial<Song>) => Promise<void>;
  onDeleteSong?: (songId: string) => Promise<void>;
}) {
  const date = new Date(`${month}-01T00:00:00.000Z`);
  const monthName = new Intl.DateTimeFormat("default", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);

  return (
    <section>
      <motion.h2
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-sm text-gray-500 mb-4"
      >
        {monthName}
      </motion.h2>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ staggerChildren: 0.05 }}
        className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4"
      >
        {songs.map((song, index) => (
          <motion.div
            key={song.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.05 }}
          >
            <SongCard
              song={song}
              showAdminControls={showAdminControls}
              onUpdateSong={onUpdateSong}
              onDeleteSong={onDeleteSong}
            />
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}
