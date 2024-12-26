import { Song } from "@/lib/types";
import { motion } from "framer-motion";
import { ChevronDownIcon, MoreHorizontal } from "lucide-react";
import { useState } from "react";
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

export function TableView({
  songs,
  isExpanded,
  onToggle,
  showAdminControls,
  onUpdateSong,
  onDeleteSong,
}: {
  songs: Song[];
  isExpanded: boolean;
  onToggle: (e: React.MouseEvent) => void;
  showAdminControls?: boolean;
  onUpdateSong?: (songId: string, updates: Partial<Song>) => Promise<void>;
  onDeleteSong?: (songId: string) => Promise<void>;
}) {
  const [selectedSong, setSelectedSong] = useState<Song | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    title: "",
    artist: "",
    album: "",
    youtubeUrl: "",
    month: "",
    year: "",
    albumArt: "",
  });

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

  const handleEditClick = (song: Song) => {
    setSelectedSong(song);
    setEditForm({
      title: song.title,
      artist: song.artist,
      album: song.album,
      youtubeUrl: song.youtubeUrl,
      month: song.addedAt.substring(5, 7),
      year: song.addedAt.substring(0, 4),
      albumArt: song.albumArt,
    });
    setIsEditDialogOpen(true);
  };

  const handleUpdateSong = async () => {
    if (!selectedSong) return;

    try {
      const newDate = new Date(
        `${editForm.year}-${editForm.month}-01T12:00:00.000Z`
      );

      await onUpdateSong?.(selectedSong.id, {
        title: editForm.title,
        artist: editForm.artist,
        album: editForm.album,
        youtubeUrl: editForm.youtubeUrl,
        addedAt: newDate.toISOString(),
        albumArt: editForm.albumArt,
      });

      setIsEditDialogOpen(false);
      setSelectedSong(null);
    } catch (error) {
      console.error("Failed to update song:", error);
    }
  };

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
            <div
              key={song.id}
              className="flex items-center gap-4 px-4 py-2 hover:bg-gray-50 rounded-lg transition-colors group"
            >
              <a
                href={song.youtubeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="min-w-0 flex-1"
              >
                <p className="text-sm font-medium truncate">{song.title}</p>
                <p className="text-xs text-gray-500 truncate">
                  {song.artist} • {song.album}
                </p>
              </a>

              {showAdminControls && (
                <button
                  onClick={() => handleEditClick(song)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-gray-100 rounded-full"
                >
                  <MoreHorizontal className="w-4 h-4 text-gray-500" />
                </button>
              )}
            </div>
          ))}
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
    </section>
  );
}
