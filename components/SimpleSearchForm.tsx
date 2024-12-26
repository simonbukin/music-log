"use client";

import { useState, useEffect } from "react";
import { searchMusicBrainz } from "@/lib/musicbrainz";
import { parseSearchQuery } from "@/lib/searchParser";
import { AlbumArtPlaceholder } from "./AlbumArtPlaceholder";
import { X, Check } from "lucide-react";

export function SimpleSearchForm({ onAddSong }: { onAddSong: (song: any) => void }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [addedSongs, setAddedSongs] = useState(new Set());
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

  const clearSearch = () => {
    setQuery("");
    setResults([]);
    setAddedSongs(new Set());
  };

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
    setAddedSongs(new Set([...addedSongs, result.id]));

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
  };

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
        <div className="relative">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full p-2 border rounded-lg pr-10"
            placeholder='Try "artist:Radiohead song:Creep"'
          />
          {query && (
            <button
              type="button"
              onClick={clearSearch}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>
          )}
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
                  {result.releases?.[0]?.title && (
                    <span className="text-gray-400">
                      {" "}
                      • {result.releases[0].title}
                    </span>
                  )}
                </p>
              </div>
              {addedSongs.has(result.id) ? (
                <div className="shrink-0 text-green-500">
                  <Check className="w-5 h-5" />
                </div>
              ) : (
                <button
                  onClick={() => handleAddSong(result)}
                  className="shrink-0 text-blue-500 hover:text-blue-600"
                >
                  Add
                </button>
              )}
            </div>
          ))
        ) : query ? (
          <div className="text-center py-8">
            <p className="text-gray-500">No results found</p>
            <p className="text-sm text-gray-400 mt-1">
              Try adjusting your search terms
            </p>
          </div>
        ) : null}
      </div>

      {isManualEntry && (
        <div className="space-y-4 p-4 border rounded-lg">
          <div className="flex justify-between items-center">
            <h3 className="font-medium">Manual Entry</h3>
            <button
              onClick={() => {
                setIsManualEntry(false);
                setManualForm({
                  title: "",
                  artist: "",
                  album: "",
                  coverArt: "",
                });
              }}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-sm text-gray-600 mb-1">Title</label>
              <input
                type="text"
                value={manualForm.title}
                onChange={(e) =>
                  setManualForm((prev) => ({ ...prev, title: e.target.value }))
                }
                className="w-full p-2 border rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Artist</label>
              <input
                type="text"
                value={manualForm.artist}
                onChange={(e) =>
                  setManualForm((prev) => ({ ...prev, artist: e.target.value }))
                }
                className="w-full p-2 border rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Album</label>
              <input
                type="text"
                value={manualForm.album}
                onChange={(e) =>
                  setManualForm((prev) => ({ ...prev, album: e.target.value }))
                }
                className="w-full p-2 border rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">
                Cover Art URL (optional)
              </label>
              <input
                type="text"
                value={manualForm.coverArt}
                onChange={(e) =>
                  setManualForm((prev) => ({
                    ...prev,
                    coverArt: e.target.value,
                  }))
                }
                className="w-full p-2 border rounded-lg"
              />
            </div>
            <button
              onClick={() => {
                const newSong = {
                  id: Date.now().toString(),
                  title: manualForm.title,
                  artist: manualForm.artist || "Unknown Artist",
                  album: manualForm.album || "Unknown Album",
                  albumArt: manualForm.coverArt,
                  youtubeUrl: `https://www.youtube.com/results?search_query=${encodeURIComponent(
                    `${manualForm.title} ${manualForm.artist}`
                  )}`,
                  addedAt: new Date(
                    `${addDate.year}-${addDate.month}-01T12:00:00.000Z`
                  ).toISOString(),
                };
                onAddSong(newSong);
                setIsManualEntry(false);
                setManualForm({
                  title: "",
                  artist: "",
                  album: "",
                  coverArt: "",
                });
              }}
              className="w-full bg-black text-white px-4 py-2 rounded-lg"
              disabled={!manualForm.title || !manualForm.artist}
            >
              Add Song
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
