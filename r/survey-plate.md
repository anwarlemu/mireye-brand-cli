# Survey plate
A drawn survey sheet: contours, a 1px grid with outlined nodes at the crossings, hatched parcels, the chosen parcel in a Forest line, the crosshair marker with its reading, coordinates and a scale.

Install: npx mireye-ds add survey-plate
Requires: theme, diamond, map, parcel-scan, utils
Packages: none
Exports: PlateParcel, PlateMarker, SurveyPlateProps, SurveyPlate
Client boundary: yes
Reference: Mireye website (mireye-website, read-only): hatched parcels and survey grid (map-shape.css, hero-crosshair.css); Figma map exploration (449:2) for the crosshair


## Usage
Use where a page or shell needs a map picture without loading imagery: a hero, a 404, an auth panel, a dashboard's map panel. Give it a size (an aspect ratio or a height). Parcels and the marker are placed in percent of the plate. In the product, the real map with `map` marks replaces it.
- Avoid: Photos or gradients under it
- Avoid: Coloured parcels
- Avoid: More than one chosen parcel
- Avoid: Pins or round markers


## Examples
Example components: npx mireye-ds add survey-plate
[Preview](https://mireye-ds.agencidev.com/preview/survey-plate/Preview) | [Plain](https://mireye-ds.agencidev.com/preview/survey-plate/Plain)

examples/survey-plate.tsx

```tsx
"use client";

import { SurveyPlate } from "@/components/blocks/survey-plate";

export function Preview() {
  return <SurveyPlate className="aspect-video w-full max-sm:aspect-4/3" />;
}

export function Plain() {
  return <SurveyPlate className="h-64 w-full" columns={8} rows={4} marker={null} caption="32.7767, -96.7970" parcels={[{ x: 30, y: 30, w: 40, h: 40, state: "selected", label: "113-020-41" }]} />;
}

```

## Source

components/blocks/survey-plate.tsx

```tsx
"use client";

import * as React from "react";

import { Diamond } from "@/components/ui/diamond";
import { MapMarker, MapScale } from "@/components/ui/map";
import { CONTOURS_INDEX, CONTOURS_MINOR } from "@/components/ui/parcel-scan";
import { cn } from "@/lib/utils";

// A drawn survey sheet for pages and shells that need a map without loading one: contours from the parcel scan, a
// survey grid of 1px rules with outlined nodes at the crossings, hatched parcels and one chosen parcel in a Forest
// line, the crosshair marker with its reading, coordinates and a scale. Bone ground in a cut frame; nothing rounded,
// nothing casts a shadow and nothing moves. Positions are percentages of the plate, so it holds at any width. The
// product's real map (aerial imagery under `map` marks) replaces it in an app.

export type PlateParcel = {
  /** Left, top, width and height, in percent of the plate. */
  x: number;
  y: number;
  w: number;
  h: number;
  /** `hatched` (a parcel in the result), `selected` (the chosen one: a Forest line) or `plain` (a Stone outline). */
  state?: "hatched" | "selected" | "plain";
  /** A parcel ID in DM Mono, top left inside the parcel. */
  label?: string;
};

export type PlateMarker = { x: number; y: number; value?: React.ReactNode; coordinates?: React.ReactNode };

export type SurveyPlateProps = Omit<React.ComponentProps<"div">, "children"> & {
  parcels?: PlateParcel[];
  marker?: PlateMarker | null;
  /** Grid columns and rows. */
  columns?: number;
  rows?: number;
  /** Bottom-left caption in DM Mono, e.g. the county or the coordinates. */
  caption?: React.ReactNode;
  /** The scale bar's label, bottom right. */
  scale?: string | null;
  /** Draw the contours under the grid. */
  contours?: boolean;
  /** Overlays (a legend, a control) placed inside the plate. */
  children?: React.ReactNode;
};

const PARCELS: PlateParcel[] = [
  { x: 8, y: 14, w: 22, h: 26, state: "hatched", label: "042-117-03" },
  { x: 34, y: 46, w: 26, h: 30, state: "selected", label: "042-117-09" },
  { x: 64, y: 18, w: 18, h: 22, state: "plain" },
  { x: 70, y: 58, w: 20, h: 26, state: "hatched" },
];

const PARCEL_STYLE = {
  hatched: "ds-cut-frame ds-hatch [--ds-shape-stroke:var(--ds-color-border-default)] [--ds-hatch-color:var(--ds-color-border-default)] [--ds-shape-fill:var(--ds-color-bg-page)]",
  selected: "ds-cut-frame ds-hatch [--ds-shape-stroke:var(--ds-color-border-strong)] [--ds-hatch-color:var(--ds-color-border-subtle)] [--ds-shape-fill:var(--ds-color-bg-page)]",
  plain: "ds-cut-frame [--ds-shape-stroke:var(--ds-color-border-default)] [--ds-shape-fill:var(--ds-color-bg-page)]",
} as const;

export function SurveyPlate({
  parcels = PARCELS,
  marker = { x: 47, y: 61, value: "212.6 ac", coordinates: "32.4113, -96.8302" },
  columns = 6,
  rows = 4,
  caption = "Ellis County, TX",
  scale = "1,000 ft",
  contours = true,
  className,
  children,
  ...props
}: SurveyPlateProps) {
  const ref = React.useRef<HTMLDivElement>(null);
  const [size, setSize] = React.useState({ w: 0, h: 0 });
  React.useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setSize({ w: e.contentRect.width, h: e.contentRect.height }));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  const xs = Array.from({ length: columns - 1 }, (_, i) => ((i + 1) / columns) * 100);
  const ys = Array.from({ length: rows - 1 }, (_, i) => ((i + 1) / rows) * 100);
  return (
    <div
      data-slot="survey-plate"
      className={cn("ds-cut-frame relative p-px font-sans text-fg [--ds-cut:var(--ds-cut-lg)] [--ds-shape-fill:var(--ds-color-bg-page)] [--ds-shape-stroke:var(--ds-color-border-default)]", className)}
      {...props}
    >
      {/* Clipped to the frame's inner edge, so lines stop at the cut corner. */}
      <div ref={ref} className="relative h-full min-h-48 overflow-hidden [clip-path:polygon(calc(var(--ds-cut)-0.7929px)_0,100%_0,100%_100%,0_100%,0_calc(var(--ds-cut)-0.7929px))]">
        {contours && (
          <svg aria-hidden viewBox="0 0 240 128" preserveAspectRatio="xMidYMid slice" className="absolute inset-0 size-full" fill="none">
            <path d={CONTOURS_MINOR} stroke="var(--ds-color-border-subtle)" strokeWidth={1} vectorEffect="non-scaling-stroke" />
            <path d={CONTOURS_INDEX} stroke="var(--ds-color-border-default)" strokeWidth={1} vectorEffect="non-scaling-stroke" />
          </svg>
        )}
        {xs.map((x) => (
          <span key={`x${x}`} aria-hidden className="absolute inset-y-0 w-px bg-line-subtle" style={{ left: `${x}%` }} />
        ))}
        {ys.map((y) => (
          <span key={`y${y}`} aria-hidden className="absolute inset-x-0 h-px bg-line-subtle" style={{ top: `${y}%` }} />
        ))}
        {xs.flatMap((x) =>
          ys.map((y) => (
            <span key={`n${x}-${y}`} aria-hidden className="absolute -translate-1/2" style={{ left: `${x}%`, top: `${y}%` }}>
              <Diamond size={9} variant="outline" fill="var(--ds-color-bg-page)" className="text-fg-subtle" />
            </span>
          )),
        )}
        {parcels.map((p, i) => (
          <div key={i} aria-hidden className={cn("absolute overflow-hidden [--ds-cut:var(--ds-cut-sm)]", PARCEL_STYLE[p.state ?? "hatched"])} style={{ left: `${p.x}%`, top: `${p.y}%`, width: `${p.w}%`, height: `${p.h}%` }}>
            {p.label && <span className={cn("absolute top-2 left-2 bg-page px-0.5 font-mono text-micro leading-none whitespace-nowrap", p.state === "selected" ? "text-fg" : "text-fg-muted")}>{p.label}</span>}
          </div>
        ))}
        {marker && size.w > 0 && (
          <MapMarker
            variant="crosshair"
            x={Math.round((marker.x / 100) * size.w)}
            y={Math.round((marker.y / 100) * size.h)}
            value={marker.value}
            // A narrow plate has no room for the second reading beside the point.
            coordinates={size.w >= 480 ? marker.coordinates : undefined}
            side={marker.x > 50 ? "left" : "right"}
          />
        )}
        {caption != null && <span className="absolute bottom-3 left-4 bg-page px-1 font-mono text-micro leading-tight text-fg-muted">{caption}</span>}
        {scale && <MapScale label={scale} className="absolute right-4 bottom-3 text-fg" />}
        {children}
      </div>
    </div>
  );
}

```
