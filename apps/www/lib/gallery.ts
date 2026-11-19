import { readFileSync } from "node:fs";
import path from "node:path";

// The asset gallery the CLI rendered (scripts/build-gallery.mjs): each entry is a real command and the files it wrote.
export type GalleryEntry = { group: string; label: string; command: string; files: string[] };

export function gallery(): GalleryEntry[] {
  const file = path.join(process.cwd(), "public", "gallery", "gallery.json");
  return (JSON.parse(readFileSync(file, "utf8")) as { entries: GalleryEntry[] }).entries;
}

export const inGroup = (group: string) => gallery().filter((e) => e.group === group);

/** The shown command: the gallery writes with the local bin, docs readers run the published CLI. */
export const shown = (command: string, cli: string) => command.replace(/^npx \S+/, cli).replace(/ --out \S+$/, "");
