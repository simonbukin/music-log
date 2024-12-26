import { groupSongsByAlbum } from "@/lib/helpers";
import { SongCard } from "./SongCard";

import { getFormattedMonthName } from "@/lib/helpers";
import { Song } from "@/lib/types";
import { SongStack } from "./SongStack";
import { motion } from "framer-motion";
import { ChevronDownIcon } from "lucide-react";

export function GridView({
  songs,
  showAdminControls,
  onUpdateSong,
  onDeleteSong,
  stackMode,
}: {
  songs: Song[];
  showAdminControls?: boolean;
  onUpdateSong?: (songId: string, updates: Partial<Song>) => Promise<void>;
  onDeleteSong?: (songId: string) => Promise<void>;
  stackMode: boolean;
}) {
  return (
    <section>
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="sticky top-6 z-10 flex items-center gap-2 text-sm text-gray-500 mb-4 hover:text-gray-700 transition-colors"
      >
        <ChevronDownIcon />
        {getFormattedMonthName(songs[0]?.addedAt)}
      </motion.button>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ staggerChildren: 0.05 }}
        className="flex flex-wrap gap-3"
      >
        {stackMode
          ? Object.values(groupSongsByAlbum(songs))
              .sort((a, b) => b[0].addedAt.localeCompare(a[0].addedAt))
              .map((songGroup, index) => (
                <motion.div
                  key={`${songGroup[0].artist}-${songGroup[0].album}`}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <SongStack
                    songs={songGroup}
                    onClick={() => {
                      // Optional: Add click handler to show details modal
                    }}
                  />
                </motion.div>
              ))
          : songs
              .sort((a, b) => b.addedAt.localeCompare(a.addedAt))
              .map((song, index) => (
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
