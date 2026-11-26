# Map scale
The scale bar: a 1px ruler with ticks and the distance its whole length covers.

Install: npx mireye-ds add map-scale
Requires: theme, map
Packages: none
Exports: MapScale
Client boundary: not required by this entry file
Reference: Figma "UI · Map marker" (443:395): Scale 443:423


## Usage
Put it in the map's bottom-left corner. `label` is the true distance the bar covers at the map's center ("640 ft"); a new zoom level changes the label, never the bar. On imagery make it Bone with `text-fg-inverse`.
- Avoid: Alternating filled segments
- Avoid: Resizing the bar
- Avoid: A label that does not change with zoom


## Examples
Example components: npx mireye-ds add map-scale map-controls parcel-scan
[Preview](https://mireye-ds.agencidev.com/preview/map-scale/Preview) | [OnImagery](https://mireye-ds.agencidev.com/preview/map-scale/OnImagery)

examples/map-scale.tsx

```tsx
"use client";

import * as React from "react";
import { MapScale } from "@/components/ui/map-scale";
import { MapControls } from "@/components/ui/map-controls";
import { CONTOURS_INDEX, CONTOURS_MINOR } from "@/components/ui/parcel-scan";

/** The system's survey contours (ParcelScan's 240 by 128 artwork), stretched to cover a light map ground. */
function ContourGround() {
  return (
    <svg aria-hidden viewBox="0 0 240 128" preserveAspectRatio="xMidYMid slice" className="absolute inset-0 block size-full" fill="none">
      <path d={CONTOURS_MINOR} vectorEffect="non-scaling-stroke" className="stroke-line-subtle" />
      <path d={CONTOURS_INDEX} vectorEffect="non-scaling-stroke" className="stroke-line" />
    </svg>
  );
}

/** The viewport's size, so marks can sit at its center. */
function useSize<T extends HTMLElement>() {
  const ref = React.useRef<T>(null);
  const [size, setSize] = React.useState({ w: 0, h: 0 });
  React.useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setSize({ w: e.contentRect.width, h: e.contentRect.height }));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  return [ref, size] as const;
}

// The scale reads the distance its bar covers; zoom and the label rises in with the new distance.
const LABELS = ["5,000 ft", "2,500 ft", "1,200 ft", "640 ft", "320 ft", "160 ft"];

export function Preview() {
  const [level, setLevel] = React.useState(3);
  return (
    <div className="relative h-64 w-full overflow-hidden border border-line-subtle bg-surface">
      <ContourGround />
      <MapScale label={LABELS[level]} className="absolute bottom-4 left-5" />
      <MapControls
        className="absolute right-5 bottom-4"
        onZoomIn={() => setLevel((l) => Math.min(LABELS.length - 1, l + 1))}
        onZoomOut={() => setLevel((l) => Math.max(0, l - 1))}
        zoomInDisabled={level === LABELS.length - 1}
        zoomOutDisabled={level === 0}
      />
    </div>
  );
}

// On imagery the scale is white, with no plate.
export function OnImagery() {
  return (
    <div className="flex h-32 w-full items-end bg-inverse p-5">
      <MapScale label="640 ft" className="text-fg-inverse" />
    </div>
  );
}

```

## Source

components/ui/map-scale.tsx

```tsx
// Moved into Map (map.tsx) on 29 Oct. This path stays so existing imports keep working.
export { MapScale } from "@/components/ui/map";

```
