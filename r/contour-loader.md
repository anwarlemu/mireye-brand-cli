# Contour loader
The map loader: four terrain contours around a survey node, with a pulse rippling outwards.

Install: npx mireye-ds add contour-loader
Requires: theme, loader
Packages: none
Exports: ContourLoader, CONTOURS
Client boundary: not required by this entry file
Reference: Figma "UI · Loaders" (443:2): hero 443:9, frames 443:16 to 443:44


## Usage
Use while terrain or a map loads: `size={200}` where the map will be, `size={56}` in a tile. `running={false}` with `frame` holds Figma's still frame.
- Avoid: Over data that is not terrain
- Avoid: Recoloring the rings


## Examples
Example components: npx mireye-ds add contour-loader
[Preview](https://mireye-ds.agencidev.com/preview/contour-loader/Preview) | [Frames](https://mireye-ds.agencidev.com/preview/contour-loader/Frames)

examples/contour-loader.tsx

```tsx
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

```

## Source

components/ui/contour-loader.tsx

```tsx
// Moved into Loader (loader.tsx) on 29 Oct. This path stays so existing imports keep working.
export { ContourLoader, CONTOURS } from "@/components/ui/loader";

```
