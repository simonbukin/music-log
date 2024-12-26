"use client";

import { motion } from "framer-motion";
import { SimpleSearchForm } from "@/components/SimpleSearchForm";
import { MonthGrid } from "@/components/MonthGrid";
import songsData from "@/data/songs.json";
import { Song } from "@/lib/types";
import { useState } from "react";

function groupSongsByMonth(songs: Song[]) {
  return songs.reduce((acc, song) => {
    const monthKey = song.addedAt.substring(0, 7);
    if (!acc[monthKey]) {
      acc[monthKey] = [];
    }
    acc[monthKey].push(song);
    return acc;
  }, {} as Record<string, Song[]>);
}

export default function Home() {
  const isDev = process.env.NODE_ENV === "development";
  const [songs, setSongs] = useState(songsData.songs);
  const songsByMonth = groupSongsByMonth(songs);

  const handleUpdateSong = async (songId: string, updates: Partial<Song>) => {
    // Optimistically update the UI
    setSongs(currentSongs => 
      currentSongs.map(song => 
        song.id === songId ? { ...song, ...updates } : song
      )
    );

    // Update the server
    try {
      const response = await fetch(`/api/songs/${songId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });

      if (!response.ok) throw new Error("Failed to update song");
    } catch (error) {
      console.error("Failed to update song:", error);
      // Revert the optimistic update on error
      setSongs(songsData.songs);
    }
  };

  const handleDeleteSong = async (songId: string) => {
    if (!confirm("Are you sure you want to delete this song?")) return;

    // Optimistically update the UI
    setSongs(currentSongs => currentSongs.filter(song => song.id !== songId));

    // Update the server
    try {
      const response = await fetch(`/api/songs/${songId}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete song");
    } catch (error) {
      console.error("Failed to delete song:", error);
      // Revert the optimistic update on error
      setSongs(songsData.songs);
    }
  };

  return (
    <motion.main
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen flex flex-col lg:flex-row"
    >
      {/* Left Column - becomes top section on mobile */}
      <div className="w-full lg:w-1/2 lg:fixed lg:left-0 lg:top-0 lg:h-screen flex items-start justify-center lg:justify-end p-6">
        <div className="max-w-xs w-full">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center justify-between"
          >
            <p className="text-sm text-gray-500">simon is listening to</p>
          </motion.div>

          {isDev && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="mt-8"
            >
              <SimpleSearchForm
                onAddSong={(song) => setSongs((curr) => [...curr, song])}
              />
            </motion.div>
          )}
        </div>
      </div>

      {/* Right Column - becomes bottom section on mobile */}
      <div className="w-full lg:w-1/2 lg:ml-auto mt-6 lg:mt-0 px-6 lg:px-0">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative"
        >
          <div className="space-y-4">
            {Object.entries(songsByMonth)
              .sort((a, b) => b[0].localeCompare(a[0]))
              .map(([month, monthSongs], index) => (
                <motion.div
                  key={month}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <MonthGrid
                    month={month}
                    songs={monthSongs}
                    showAdminControls={isDev}
                    onUpdateSong={handleUpdateSong}
                    onDeleteSong={handleDeleteSong}
                  />
                </motion.div>
              ))}
          </div>
        </motion.div>
      </div>
    </motion.main>
  );
}
