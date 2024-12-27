import { groupSongsByAlbum } from "@/lib/helpers";
import { SongCard } from "./SongCard";

import { getFormattedMonthName } from "@/lib/helpers";
import { Song } from "@/lib/types";
import { SongStack } from "./SongStack";
import { motion } from "framer-motion";
import { ChevronDownIcon } from "lucide-react";
import { useState } from "react";

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
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <section>
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        onClick={() => setIsExpanded(!isExpanded)}
        className="sticky top-6 z-10 flex items-center gap-2 text-sm text-gray-500 mb-4 hover:text-gray-700 transition-colors"
      >
        <ChevronDownIcon className={`transform transition-transform ${isExpanded ? 'rotate-0' : '-rotate-90'}`} />
        {getFormattedMonthName(songs[0]?.addedAt)}
      </motion.button>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ 
          opacity: isExpanded ? 1 : 0,
          height: isExpanded ? 'auto' : 0,
        }}
        transition={{ staggerChildren: 0.05 }}
        className={`flex flex-wrap gap-3 ${!isExpanded ? 'overflow-hidden' : ''}`}
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
