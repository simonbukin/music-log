"use client";

import { motion } from "framer-motion";
import { Song } from "@/lib/types";
import { SongCard } from "./SongCard";
import { TableView } from "./TableView";
import { useState, useEffect } from "react";
import { ChevronDownIcon } from "lucide-react";

export function MonthGrid({
  month,
  songs,
  showAdminControls,
  onUpdateSong,
  onDeleteSong,
  viewMode = "grid",
}: {
  month: string;
  songs: Song[];
  showAdminControls?: boolean;
  onUpdateSong?: (songId: string, updates: Partial<Song>) => Promise<void>;
  onDeleteSong?: (songId: string) => Promise<void>;
  viewMode: "grid" | "list";
}) {
  const [isExpanded, setIsExpanded] = useState(true);
  const date = new Date(`${month}-01T00:00:00.000Z`);
  const monthName = new Intl.DateTimeFormat("default", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);

  const handleClick = (e: React.MouseEvent) => {
    if (e.shiftKey) {
      e.preventDefault();
      const event = new CustomEvent("collapseOthers", { detail: { month } });
      window.dispatchEvent(event);
      setIsExpanded(true);
    } else {
      setIsExpanded(!isExpanded);
    }
  };

  useEffect(() => {
    const handleCollapseOthers = (e: CustomEvent) => {
      if (e.detail.month !== month) {
        setIsExpanded(false);
      }
    };

    window.addEventListener(
      "collapseOthers",
      handleCollapseOthers as EventListener
    );
    return () =>
      window.removeEventListener(
        "collapseOthers",
        handleCollapseOthers as EventListener
      );
  }, [month]);

  if (viewMode === "list") {
    return (
      <TableView songs={songs} isExpanded={isExpanded} onToggle={handleClick} />
    );
  }

  return (
    <section>
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        onClick={handleClick}
        className="sticky top-6 z-10 flex items-center gap-2 text-sm text-gray-500 mb-4 hover:text-gray-700 transition-colors"
      >
        <ChevronDownIcon
          className={`w-4 h-4 transition-transform ${
            isExpanded ? "rotate-0" : "-rotate-90"
          }`}
        />
        {monthName.toLowerCase()}
      </motion.button>
      {isExpanded && (
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
      )}
    </section>
  );
}
