"use client";

import { Song } from "@/lib/types";
import { useState } from "react";
import { motion } from "framer-motion";
import { AlbumArtPlaceholder } from "./AlbumArtPlaceholder";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlbumArt } from "./AlbumArt";

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
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    title: song.title,
    artist: song.artist,
    album: song.album,
    youtubeUrl: song.youtubeUrl,
    month: song.addedAt.substring(5, 7),
    year: song.addedAt.substring(0, 4),
    albumArt: song.albumArt,
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

  const handleUpdateSong = async () => {
    try {
      const newDate = new Date(
        `${editForm.year}-${editForm.month}-01T12:00:00.000Z`
      );

      await onUpdateSong?.(song.id, {
        title: editForm.title,
        artist: editForm.artist,
        album: editForm.album,
        youtubeUrl: editForm.youtubeUrl,
        addedAt: newDate.toISOString(),
        albumArt: editForm.albumArt,
      });

      setIsEditDialogOpen(false);
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
          <AlbumArt
            url={song.albumArt}
            size={100}
            artist={song.artist}
            album={song.album}
            className="w-full h-full object-cover"
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
                    setIsEditDialogOpen(true);
                    setIsMenuOpen(false);
                  }}
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                >
                  Edit Song
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

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Song</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={editForm.title}
                onChange={(e) =>
                  setEditForm((prev) => ({ ...prev, title: e.target.value }))
                }
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="artist">Artist</Label>
              <Input
                id="artist"
                value={editForm.artist}
                onChange={(e) =>
                  setEditForm((prev) => ({ ...prev, artist: e.target.value }))
                }
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="album">Album</Label>
              <Input
                id="album"
                value={editForm.album}
                onChange={(e) =>
                  setEditForm((prev) => ({ ...prev, album: e.target.value }))
                }
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="albumArt">Album Art URL</Label>
              <Input
                id="albumArt"
                type="url"
                value={editForm.albumArt}
                onChange={(e) =>
                  setEditForm((prev) => ({ ...prev, albumArt: e.target.value }))
                }
                placeholder="https://example.com/album-art.jpg"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="month">Month</Label>
                <select
                  id="month"
                  value={editForm.month}
                  onChange={(e) =>
                    setEditForm((prev) => ({ ...prev, month: e.target.value }))
                  }
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                >
                  {months.map((month) => (
                    <option key={month.value} value={month.value}>
                      {month.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="year">Year</Label>
                <select
                  id="year"
                  value={editForm.year}
                  onChange={(e) =>
                    setEditForm((prev) => ({ ...prev, year: e.target.value }))
                  }
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                >
                  {years.map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsEditDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleUpdateSong}>Save changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
