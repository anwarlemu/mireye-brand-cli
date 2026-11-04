import { ContourLoader } from "@/components/ui/contour-loader";

// Terrain loading: a pulse ripples out from the survey node, ring by ring. The hero size waits for a whole map, the
// small one sits in a tile.
export function Preview() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-8">
      <ContourLoader size={200} />
      <ContourLoader />
    </div>
  );
}

// Figma's frames, still: the active ring walks outwards and wraps.
export function Frames() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-4">
      {[0, 1, 2, 3, 4].map((f) => (
        <ContourLoader key={f} frame={f} running={false} />
      ))}
    </div>
  );
}
