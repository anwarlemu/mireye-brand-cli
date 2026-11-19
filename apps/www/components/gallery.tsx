import { CopyText } from "@www/components/copy-text";
import type { GalleryEntry } from "@www/lib/gallery";
import { shown } from "@www/lib/gallery";
import { CLI_COMMAND } from "@www/lib/registry";
import { cn } from "@/lib/utils";

/** One rendered file in a 1px Stone frame, its label in DM Mono under it. Pictures load lazily and never move. */
export function Shot({ entry, file, className }: { entry: GalleryEntry; file?: string; className?: string }) {
  const src = `/gallery/${file ?? entry.files[0]}`;
  return (
    <figure className={cn("grid min-w-0 gap-2", className)}>
      <div className="overflow-hidden border border-line bg-subtle">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} alt={entry.label} loading="lazy" className="block h-auto w-full" />
      </div>
      <figcaption className="truncate font-mono text-caption text-fg-muted">{entry.label}</figcaption>
    </figure>
  );
}

/** A grid of shots with the command for each one a click away. */
export function ShotGrid({ entries, cols = "sm:grid-cols-2 lg:grid-cols-3" }: { entries: GalleryEntry[]; cols?: string }) {
  return (
    <div className={cn("grid grid-cols-1 gap-6", cols)}>
      {entries.map((entry) => (
        <div key={entry.files[0]} className="grid min-w-0 content-start gap-2">
          <Shot entry={entry} />
          <CopyText value={shown(entry.command, CLI_COMMAND)} label={`Copy the command for ${entry.label}`} />
        </div>
      ))}
    </div>
  );
}
