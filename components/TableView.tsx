import { Song } from "@/lib/types";
import { motion } from "framer-motion";
import { ChevronDownIcon } from "lucide-react";

export function TableView({
  songs,
  isExpanded,
  onToggle,
}: {
  songs: Song[];
  isExpanded: boolean;
  onToggle: () => void;
}) {
  return (
    <section className="space-y-4">
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        onClick={onToggle}
        className="sticky top-6 z-10 flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 transition-colors"
      >
        <ChevronDownIcon
          className={`w-4 h-4 transition-transform ${
            isExpanded ? "rotate-0" : "-rotate-90"
          }`}
        />
        {new Intl.DateTimeFormat("default", {
          month: "long",
          year: "numeric",
          timeZone: "UTC",
        })
          .format(new Date(`${songs[0]?.addedAt}`))
          .toLowerCase()}
      </motion.button>
      {isExpanded && (
        <div className="space-y-1">
          {songs.map((song) => (
            <a
              key={song.id}
              href={song.youtubeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-4 px-4 py-2 hover:bg-gray-50 rounded-lg transition-colors"
            >
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium truncate">{song.title}</p>
                <p className="text-xs text-gray-500 truncate">
                  {song.artist} • {song.album}
                </p>
              </div>
            </a>
          ))}
        </div>
      )}
    </section>
  );
}
