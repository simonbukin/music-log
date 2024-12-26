"use client";

import { useState } from "react";
import { searchMusicBrainz } from "@/lib/musicbrainz";
import { SearchResults } from "./SearchResults";

export function debounce(func: (...args: any[]) => any, wait: number) {
  let timeout: NodeJS.Timeout;
  return function (...args: any[]) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), wait);
  };
}

interface SearchFilters {
  artist: string;
  title: string;
  album: string;
}

export function AddSongForm() {
  const [filters, setFilters] = useState<SearchFilters>({
    artist: "",
    title: "",
    album: "",
  });
  const [suggestions, setSuggestions] = useState<any>({
    artists: [],
    recordings: [],
    releases: [],
  });
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  // Create a memoized debounced function
  const fetchSuggestions = debounce(async (type: string, query: string) => {
    if (!query) {
      setSuggestions((prev) => ({ ...prev, [type]: [] }));
      return;
    }

    try {
      const results = await searchMusicBrainz({
        type,
        query,
        limit: 5,
      });
      setSuggestions((prev) => ({ ...prev, [type]: results }));
    } catch (error) {
      console.error(`Failed to fetch ${type} suggestions:`, error);
    }
  }, 300);

  const handleFilterChange = (field: keyof SearchFilters, value: string) => {
    setFilters((prev) => ({ ...prev, [field]: value }));

    // Get suggestions based on field type
    const suggestionType =
      field === "title"
        ? "recordings"
        : field === "album"
        ? "releases"
        : "artists";
    fetchSuggestions(suggestionType, value);
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const searchResults = await searchMusicBrainz({
        ...filters,
        // Add specific search parameters based on filled fields
        query: Object.entries(filters)
          .filter(([_, value]) => value)
          .map(([key, value]) => `${key}:${value}`)
          .join(" AND "),
      });
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
      artist: result.artist,
      album: result.album,
      albumArt: result.albumArt,
      youtubeUrl: `https://www.youtube.com/results?search_query=${encodeURIComponent(
        `${result.title} ${result.artist}`
      )}`,
      addedAt: new Date().toISOString(),
    };

    try {
      const response = await fetch("/api/songs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newSong),
      });

      if (!response.ok) throw new Error("Failed to add song");

      setResults([]);
    } catch (error) {
      console.error("Failed to add song:", error);
    }
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleSearch} className="space-y-4">
        {/* Artist Search */}
        <div className="relative">
          <input
            type="text"
            value={filters.artist}
            onChange={(e) => handleFilterChange("artist", e.target.value)}
            className="w-full p-2 border rounded"
            placeholder="Artist name..."
          />
          {suggestions.artists.length > 0 && (
            <div className="absolute z-10 w-full mt-1 bg-white border rounded-md shadow-lg">
              {suggestions.artists.map((artist: any) => (
                <div
                  key={artist.id}
                  className="p-2 hover:bg-gray-100 cursor-pointer"
                  onClick={() => {
                    setFilters((prev) => ({ ...prev, artist: artist.name }));
                    setSuggestions((prev) => ({ ...prev, artists: [] }));
                  }}
                >
                  {artist.name}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Song Title Search */}
        <div className="relative">
          <input
            type="text"
            value={filters.title}
            onChange={(e) => handleFilterChange("title", e.target.value)}
            className="w-full p-2 border rounded"
            placeholder="Song title..."
          />
          {suggestions.recordings.length > 0 && (
            <div className="absolute z-10 w-full mt-1 bg-white border rounded-md shadow-lg">
              {suggestions.recordings.map((recording: any) => (
                <div
                  key={recording.id}
                  className="p-2 hover:bg-gray-100 cursor-pointer"
                  onClick={() => {
                    setFilters((prev) => ({ ...prev, title: recording.title }));
                    setSuggestions((prev) => ({ ...prev, recordings: [] }));
                  }}
                >
                  {recording.title}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Album Search */}
        <div className="relative">
          <input
            type="text"
            value={filters.album}
            onChange={(e) => handleFilterChange("album", e.target.value)}
            className="w-full p-2 border rounded"
            placeholder="Album name..."
          />
          {suggestions.releases.length > 0 && (
            <div className="absolute z-10 w-full mt-1 bg-white border rounded-md shadow-lg">
              {suggestions.releases.map((release: any) => (
                <div
                  key={release.id}
                  className="p-2 hover:bg-gray-100 cursor-pointer"
                  onClick={() => {
                    setFilters((prev) => ({ ...prev, album: release.title }));
                    setSuggestions((prev) => ({ ...prev, releases: [] }));
                  }}
                >
                  {release.title}
                </div>
              ))}
            </div>
          )}
        </div>

        <button
          type="submit"
          className="w-full bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded transition-colors"
          disabled={loading}
        >
          {loading ? "Searching..." : "Search"}
        </button>
      </form>

      <SearchResults results={results} onAddSong={handleAddSong} />
      {/* <div className="space-y-4">
        {results.map((result) => (
          <div
            key={result.id}
            className="flex items-center justify-between p-4 border rounded"
          >
            <div>
              <p className="font-bold">{result.title}</p>
              <p className="text-sm text-gray-600">
                {result.artist} - {result.album}
              </p>
            </div>
            <button
              onClick={() => handleAddSong(result)}
              className="bg-green-500 text-white px-3 py-1 rounded"
            >
              Add
            </button>
          </div>
        ))}
      </div> */}
    </div>
  );
}
