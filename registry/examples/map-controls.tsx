"use client";

import * as React from "react";
import { MapControlButton, MapControls, ZoomInGlyph } from "@/components/ui/map-controls";
import { MapScale } from "@/components/ui/map-scale";
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

// Zoom in and out, bottom right, their bottom edge on the scale bar's line. A control at its limit stays focusable and
// reads disabled.
const LABELS = ["2,500 ft", "1,200 ft", "640 ft", "320 ft"];

export function Preview() {
  const [level, setLevel] = React.useState(2);
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

// The states: default, hover (forced, as Figma's specimen shows it) and disabled.
export function States() {
  return (
    <div className="flex items-center justify-center gap-3">
      <MapControlButton aria-label="Zoom in">
        <ZoomInGlyph />
      </MapControlButton>
      <MapControlButton aria-label="Zoom in" state="hover">
        <ZoomInGlyph />
      </MapControlButton>
      <MapControlButton aria-label="Zoom in" disabled>
        <ZoomInGlyph />
      </MapControlButton>
    </div>
  );
}
