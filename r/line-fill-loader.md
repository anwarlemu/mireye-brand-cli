# Line fill loader
The data loader: eleven lines rising into a bell that travels left to right.

Install: npx mireye-ds add line-fill-loader
Requires: theme, loader
Packages: none
Exports: LineFillLoader, LINE_FILLS
Client boundary: not required by this entry file
Reference: Figma "UI · Loaders" (443:2): hero 443:52, frames 443:56 to 443:72


## Usage
Use while data loads: `size={160}` for a panel, `size={40}` inline. `running={false}` with `frame` holds Figma's still frame.
- Avoid: Over a map; use the contour loader there
- Avoid: A bar chart that pretends to be data


## Examples
Example components: npx mireye-ds add line-fill-loader
[Preview](https://mireye-ds.agencidev.com/preview/line-fill-loader/Preview) | [Frames](https://mireye-ds.agencidev.com/preview/line-fill-loader/Frames)

examples/line-fill-loader.tsx

```tsx
import { LineFillLoader } from "@/components/ui/line-fill-loader";

// Data loading: a bell of lines travels left to right, like a chart filling in.
export function Preview() {
  return (
    <div className="flex flex-wrap items-end justify-center gap-8">
      <LineFillLoader size={160} />
      <LineFillLoader />
    </div>
  );
}

// Figma's frames, still: the peak steps two lines a frame.
export function Frames() {
  return (
    <div className="flex flex-wrap items-end justify-center gap-4">
      {[0, 1, 2, 3, 4].map((f) => (
        <LineFillLoader key={f} frame={f} running={false} />
      ))}
    </div>
  );
}

```

## Source

components/ui/line-fill-loader.tsx

```tsx
// Moved into Loader (loader.tsx) on 29 Oct. This path stays so existing imports keep working.
export { LineFillLoader, LINE_FILLS } from "@/components/ui/loader";

```
