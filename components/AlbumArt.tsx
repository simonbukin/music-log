import Image from 'next/image';
import { cn } from '@/lib/utils';
import { AlbumArtPlaceholder } from "./AlbumArtPlaceholder";
import { useState } from "react";

interface AlbumArtProps {
  artist: string;
  album?: string;
  url?: string;
  className?: string;
  size?: number;
}

export function AlbumArt({
  artist,
  album,
  url,
  className,
  size = 300,
}: AlbumArtProps) {
  const [hasError, setHasError] = useState(false);

  function sanitizeFileName(str: string): string {
    return str
      .replace(/[^a-z0-9-]/gi, "_")
      .replace(/_+/g, "_")
      .toLowerCase();
  }

  if (!url || hasError) {
    return (
      <div
        className={cn(
          "relative aspect-square overflow-hidden rounded-md",
          className
        )}
        style={{ width: size, height: size }}
      >
        <AlbumArtPlaceholder />
      </div>
    );
  }

  return (
    <div
      className={cn(
        "relative aspect-square overflow-hidden rounded-md bg-neutral-100 dark:bg-neutral-800",
        className
      )}
    >
      <img
        src={url}
        alt={`Album art for ${album || "album"} by ${artist}`}
        width={size}
        height={size}
        className="object-cover"
        onError={() => setHasError(true)}
      />
    </div>
  );
} 