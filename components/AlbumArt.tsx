import Image from 'next/image';
import { cn } from '@/lib/utils';

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
  size = 300
}: AlbumArtProps) {
  function sanitizeFileName(str: string): string {
    return str
      .replace(/[^a-z0-9-]/gi, '_')
      .replace(/_+/g, '_')
      .toLowerCase();
  }

  function getCachedImagePath(): string {
    const safeArtist = sanitizeFileName(artist);
    const safeAlbum = sanitizeFileName(album || 'no-album');
    
    return `/image-cache/${safeArtist}-${safeAlbum}.jpg`;
  }

  const imageSrc = getCachedImagePath() || url || '/default-album-art.jpg';

  return (
    <div className={cn(
      'relative aspect-square overflow-hidden rounded-md bg-neutral-100 dark:bg-neutral-800',
      className
    )}>
      <Image
        src={imageSrc}
        alt={`Album art for ${album || 'album'} by ${artist}`}
        width={size}
        height={size}
        className="object-cover"
        onError={(e) => {
          const target = e.target as HTMLImageElement;
          if (target.src !== url && url) {
            target.src = url;
          } else if (target.src !== '/default-album-art.jpg') {
            target.src = '/default-album-art.jpg';
          }
        }}
      />
    </div>
  );
} 