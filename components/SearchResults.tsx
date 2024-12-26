export function SearchResults({ results, onAddSong }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
      {results.map((result) => (
        <div
          key={result.id}
          className="flex bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
        >
          <div className="relative w-32 h-32">
            <img
              src={result.coverArt}
              alt={`Album art for ${result.title}`}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.currentTarget.src = "/placeholder-album-art.jpg";
              }}
            />
            <button
              onClick={() =>
                onAddSong({
                  title: result.title,
                  artist:
                    result["artist-credit"]?.[0]?.name || "Unknown Artist",
                  album: result.releases?.[0]?.title || "Unknown Album",
                  albumArt: result.coverArt,
                })
              }
              className="absolute bottom-2 right-2 bg-blue-500 hover:bg-blue-600 text-white p-2 rounded-full shadow-lg transition-colors"
              aria-label="Add song"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </div>
          <div className="flex flex-col p-4 flex-1">
            <h3 className="font-medium text-lg text-gray-900 dark:text-white truncate">
              {result.title}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-300 truncate">
              {result["artist-credit"]?.[0]?.name || "Unknown Artist"}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
              {result.releases?.[0]?.title || "Unknown Album"}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
