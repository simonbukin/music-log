"use client";

import { useState, useEffect } from "react";
import { searchMusicBrainz } from "@/lib/musicbrainz";
import { parseSearchQuery } from "@/lib/searchParser";
import { AlbumArtPlaceholder } from "./AlbumArtPlaceholder";

export function SimpleSearchForm({
  onAddSong,
  songToEdit = null,
  onEditComplete = () => {},
}: {
  onAddSong: (song: any) => void;
  songToEdit?: any;
  onEditComplete?: () => void;
}) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [addDate, setAddDate] = useState({
    month: new Date().toISOString().substring(5, 7),
    year: new Date().getFullYear().toString(),
  });
  const [isManualEntry, setIsManualEntry] = useState(false);
  const [manualForm, setManualForm] = useState({
    title: "",
    artist: "",
    album: "",
    coverArt: "",
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

  useEffect(() => {
    if (songToEdit) {
      setIsManualEntry(true);
      setManualForm({
        title: songToEdit.title,
        artist: songToEdit.artist,
        album: songToEdit.album,
        coverArt: songToEdit.albumArt,
      });
      setAddDate({
        month: new Date(songToEdit.addedAt).toISOString().substring(5, 7),
        year: new Date(songToEdit.addedAt).getFullYear().toString(),
      });
    }
  }, [songToEdit]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const parsed = parseSearchQuery(query);
      const searchParams = {
        title: parsed.song,
        artist: parsed.artist,
        album: parsed.album,
      };

      const searchResults = await searchMusicBrainz(searchParams);
      setResults(searchResults);
    } catch (error) {
      console.error("Search failed:", error);
    }
    setLoading(false);
  };

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newSong = {
      id: songToEdit?.id || Date.now().toString(),
      title: manualForm.title,
      artist: manualForm.artist,
      album: manualForm.album,
      albumArt: manualForm.coverArt,
      youtubeUrl: `https://www.youtube.com/results?search_query=${encodeURIComponent(
        `${manualForm.title} ${manualForm.artist}`
      )}`,
      addedAt: new Date(
        `${addDate.year}-${addDate.month}-01T12:00:00.000Z`
      ).toISOString(),
    };

    if (songToEdit) {
      try {
        const response = await fetch(`/api/songs/${songToEdit.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(newSong),
        });
        if (!response.ok) throw new Error("Failed to update song");
        onEditComplete();
      } catch (error) {
        console.error("Failed to update song:", error);
      }
    } else {
      onAddSong(newSong);
      try {
        const response = await fetch("/api/songs", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(newSong),
        });
        if (!response.ok) throw new Error("Failed to add song");
      } catch (error) {
        console.error("Failed to add song:", error);
      }
    }

    setManualForm({ title: "", artist: "", album: "", coverArt: "" });
    setIsManualEntry(false);
  };

  const handleAddSong = async (result: any) => {
    const newSong = {
      id: Date.now().toString(),
      title: result.title,
      artist: result["artist-credit"]?.[0]?.name || "Unknown Artist",
      album: result.releases?.[0]?.title || "Unknown Album",
      albumArt: result.coverArt,
      youtubeUrl: `https://www.youtube.com/results?search_query=${encodeURIComponent(
        `${result.title} ${result["artist-credit"]?.[0]?.name}`
      )}`,
      addedAt: new Date(
        `${addDate.year}-${addDate.month}-01T12:00:00.000Z`
      ).toISOString(),
    };

    onAddSong(newSong);

    try {
      const response = await fetch("/api/songs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newSong),
      });

      if (!response.ok) throw new Error("Failed to add song");

      // Clear results after successful add
      setResults([]);
      setQuery("");
    } catch (error) {
      console.error("Failed to add song:", error);
    }
  };

  if (isManualEntry) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-sm text-gray-600 mb-1">Month</label>
            <select
              value={addDate.month}
              onChange={(e) =>
                setAddDate((prev) => ({ ...prev, month: e.target.value }))
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
              value={addDate.year}
              onChange={(e) =>
                setAddDate((prev) => ({ ...prev, year: e.target.value }))
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

        <form onSubmit={handleManualSubmit} className="space-y-4">
          <div className="space-y-2">
            <input
              type="text"
              value={manualForm.title}
              onChange={(e) =>
                setManualForm((prev) => ({ ...prev, title: e.target.value }))
              }
              className="w-full p-2 border rounded-lg"
              placeholder="Song Title"
              required
            />
            <input
              type="text"
              value={manualForm.artist}
              onChange={(e) =>
                setManualForm((prev) => ({ ...prev, artist: e.target.value }))
              }
              className="w-full p-2 border rounded-lg"
              placeholder="Artist"
              required
            />
            <input
              type="text"
              value={manualForm.album}
              onChange={(e) =>
                setManualForm((prev) => ({ ...prev, album: e.target.value }))
              }
              className="w-full p-2 border rounded-lg"
              placeholder="Album"
              required
            />
            <input
              type="url"
              value={manualForm.coverArt}
              onChange={(e) =>
                setManualForm((prev) => ({ ...prev, coverArt: e.target.value }))
              }
              className="w-full p-2 border rounded-lg"
              placeholder="Cover Art URL (optional)"
            />
          </div>

          <div className="flex gap-2">
            <button
              type="submit"
              className="flex-1 bg-black text-white px-4 py-2 rounded-lg"
            >
              {songToEdit ? "Save Changes" : "Add Song"}
            </button>
            <button
              type="button"
              onClick={() => {
                setIsManualEntry(false);
                setManualForm({
                  title: "",
                  artist: "",
                  album: "",
                  coverArt: "",
                });
                if (songToEdit) onEditComplete();
              }}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="block text-sm text-gray-600 mb-1">Month</label>
          <select
            value={addDate.month}
            onChange={(e) =>
              setAddDate((prev) => ({ ...prev, month: e.target.value }))
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
            value={addDate.year}
            onChange={(e) =>
              setAddDate((prev) => ({ ...prev, year: e.target.value }))
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

      <form onSubmit={handleSearch} className="space-y-4">
        <div>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full p-2 border rounded-lg"
            placeholder='Try "artist:Radiohead song:Creep"'
          />
          <p className="mt-1 text-xs text-gray-500">
            Search using artist: song: album: prefixes
          </p>
        </div>

        <div className="flex gap-2">
          <button
            type="submit"
            className="flex-1 bg-black text-white px-4 py-2 rounded-lg"
            disabled={loading}
          >
            {loading ? "Searching..." : "Search"}
          </button>
          <button
            type="button"
            onClick={() => setIsManualEntry(true)}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Manual Entry
          </button>
        </div>
      </form>

      <div className="space-y-2">
        {loading ? (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-2 border-gray-900 border-t-transparent" />
            <p className="text-sm text-gray-600 mt-2">Searching...</p>
          </div>
        ) : results.length > 0 ? (
          results.map((result) => (
            <div
              key={result.id}
              className="flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50"
            >
              <div className="w-12 h-12 relative rounded overflow-hidden">
                {result.coverArt ? (
                  <img
                    src={result.coverArt}
                    alt={result.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src = "";
                      e.currentTarget.style.display = "none";
                      e.currentTarget.nextElementSibling?.classList.remove(
                        "hidden"
                      );
                    }}
                  />
                ) : null}
                <div className={result.coverArt ? "hidden" : ""}>
                  <AlbumArtPlaceholder />
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{result.title}</p>
                <p className="text-sm text-gray-500 truncate">
                  {result["artist-credit"]?.[0]?.name}
                </p>
              </div>
              <button
                onClick={() => handleAddSong(result)}
                className="shrink-0 text-blue-500 hover:text-blue-600"
              >
                Add
              </button>
            </div>
          ))
        ) : query ? (
          <div className="text-center py-8">
            <p className="text-gray-500">No results found</p>
            <p className="text-sm text-gray-400 mt-1">
              Try adjusting your search terms
            </p>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-400">
            <p>Search for songs to add to your collection</p>
            <p className="text-sm mt-1">
              Try using artist: song: album: prefixes
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
