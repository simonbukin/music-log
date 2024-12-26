import { Music } from "lucide-react";

export function AlbumArtPlaceholder() {
  return (
    <div className="absolute inset-0 bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center">
      <Music className="w-1/3 h-1/3 text-neutral-400 dark:text-neutral-600" />
    </div>
  );
}
