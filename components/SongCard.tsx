"use client";

import { Song } from "@/lib/types";
import { useState } from "react";
import { motion } from "framer-motion";
import { AlbumArtPlaceholder } from "./AlbumArtPlaceholder";

export function SongCard({
  song,
  showAdminControls,
  onUpdateSong,
  onDeleteSong,
}: {
  song: Song;
  showAdminControls?: boolean;
  onUpdateSong?: (songId: string, updates: Partial<Song>) => Promise<void>;
  onDeleteSong?: (songId: string) => Promise<void>;
}) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editDate, setEditDate] = useState({
    month: song.addedAt.substring(5, 7),
    year: song.addedAt.substring(0, 4),
  });
  const [imageError, setImageError] = useState(false);

  const years = Array.from({ length: 5 }, (_, i) =>
    (new Date().getFullYear() - i).toString()
  );

  const months = [
    { value: "01", label: "January" },
    { value: "02", label: "February" },
    { value: "03", label: "March" },
    { value: "04", label: "April" },
    { value: "05", label: "May" },
    { value: "06", label: "June" },
    { value: "07", label: "July" },
    { value: "08", label: "August" },
    { value: "09", label: "September" },
    { value: "10", label: "October" },
    { value: "11", label: "November" },
    { value: "12", label: "December" },
  ];

  const handleUpdateDate = async () => {
    try {
      const newDate = new Date(
        `${editDate.year}-${editDate.month}-01T12:00:00.000Z`
      );

      await onUpdateSong?.(song.id, {
        addedAt: newDate.toISOString(),
      });

      setIsEditing(false);
    } catch (error) {
      console.error("Failed to update song:", error);
    }
  };

  const handleDelete = async () => {
    try {
      await onDeleteSong?.(song.id);
    } catch (error) {
      console.error("Failed to delete song:", error);
    }
  };

  return (
    <motion.div
      className="relative group"
      whileHover={{ scale: 1.02 }}
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
    >
      <motion.a
        href={song.youtubeUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="block aspect-square relative overflow-hidden rounded-lg"
        whileHover="hover"
      >
        {!imageError ? (
          <motion.img
            src={song.albumArt}
            alt={`${song.album} by ${song.artist}`}
            className="w-full h-full object-cover"
            onError={() => setImageError(true)}
          />
        ) : (
          <AlbumArtPlaceholder />
        )}
        <motion.div
          className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0"
          variants={{
            hover: { opacity: 1 },
          }}
          transition={{ duration: 0.2 }}
        >
          <div className="text-white text-center p-4">
            <p className="font-medium truncate">{song.title}</p>
            <p className="text-sm truncate">{song.artist}</p>
          </div>
        </motion.div>
      </motion.a>

      {showAdminControls && (
        <div className="absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="bg-white rounded-full p-2 shadow-lg hover:bg-gray-100"
            title="Admin Controls"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
            </svg>
          </button>

          {isMenuOpen && (
            <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-20">
              <div className="py-1">
                <button
                  onClick={() => {
                    setIsEditing(true);
                    setIsMenuOpen(false);
                  }}
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                >
                  Edit Date Added
                </button>
                <button
                  onClick={handleDelete}
                  className="block px-4 py-2 text-sm text-red-600 hover:bg-gray-100 w-full text-left"
                >
                  Delete Song
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {isEditing && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-sm w-full mx-4">
            <h3 className="text-lg font-medium mb-4">Edit Date Added</h3>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm text-gray-600 mb-1">
                  Month
                </label>
                <select
                  value={editDate.month}
                  onChange={(e) =>
                    setEditDate((prev) => ({ ...prev, month: e.target.value }))
                  }
                  className="w-full p-2 border rounded-lg"
                >
                  {months.map((month) => (
                    <option key={month.value} value={month.value}>
                      {month.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Year</label>
                <select
                  value={editDate.year}
                  onChange={(e) =>
                    setEditDate((prev) => ({ ...prev, year: e.target.value }))
                  }
                  className="w-full p-2 border rounded-lg"
                >
                  {years.map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateDate}
                className="px-4 py-2 bg-black text-white rounded hover:bg-gray-800"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}
