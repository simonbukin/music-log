import { motion } from "framer-motion";
import { Song } from "@/lib/types";
import Image from "next/image";
import { AlbumArt } from "./AlbumArt";

export function SongStack({ songs }: { songs: Song[] }) {
  const song = songs[0];

  // Calculate padding based on stack size
  const paddingRight = songs.length > 1 ? `${(songs.length - 1) * 3}px` : "0";

  const handleClick = () => {
    if (songs.length === 1) {
      // For single songs, use the direct YouTube URL
      window.open(song.youtubeUrl, "_blank");
    } else {
      // For stacks, construct a search URL using album and artist
      const searchQuery = encodeURIComponent(`${song.album} ${song.artist}`);
      const searchUrl = `https://www.youtube.com/results?search_query=${searchQuery}`;
      window.open(searchUrl, "_blank");
    }
  };

  return (
    <motion.button
      onClick={handleClick}
      style={{ paddingRight }}
      className="group relative flex items-center gap-1 hover:opacity-90 transition-opacity"
      whileHover={{ scale: 1.02 }}
    >
      {/* Main thumbnail */}
      <div className="w-12 h-12 rounded-md overflow-hidden shadow-sm">
        <AlbumArt
          url={song.albumArt}
          size={48}
          artist={song.artist}
          album={song.album}
          className="object-cover"
        />
      </div>

      {/* Stack indicators */}
      {songs.length > 1 && (
        <>
          <div className="w-12 h-12 absolute left-2 -z-10 opacity-80">
            <AlbumArt
              url={song.albumArt}
              size={48}
              artist={song.artist}
              album={song.album}
              className="object-cover rounded-md"
            />
          </div>
          {songs.length > 2 && (
            <div className="w-12 h-12 absolute left-4 -z-20 opacity-60">
              <AlbumArt
                url={song.albumArt}
                size={48}
                artist={song.artist}
                album={song.album}
                className="object-cover rounded-md"
              />
            </div>
          )}
        </>
      )}
    </motion.button>
  );
}
