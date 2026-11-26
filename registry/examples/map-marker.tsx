"use client";

import * as React from "react";
import { MapMarker, MapTag } from "@/components/ui/map-marker";
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

// A survey point on the map: click anywhere to move it. Its survey lines run edge to edge and the tag reads the point.
export function Preview() {
  const [ref, size] = useSize<HTMLDivElement>();
  const [point, setPoint] = React.useState<{ x: number; y: number } | null>(null);
  const p = point ?? { x: Math.round(size.w * 0.55), y: Math.round(size.h * 0.62) };
  return (
    <div
      ref={ref}
      onClick={(e) => {
        const r = e.currentTarget.getBoundingClientRect();
        setPoint({ x: Math.round(e.clientX - r.left), y: Math.round(e.clientY - r.top) });
      }}
      className="relative h-80 w-full cursor-crosshair overflow-hidden border border-line-subtle bg-surface"
    >
      <ContourGround />
      {size.w > 0 && <MapMarker x={p.x} y={p.y} value="412 ft" coordinates="32.1745, -96.8921" />}
    </div>
  );
}

// The crosshair marker from the map exploration, its tag beside the point.
export function Crosshair() {
  const [ref, size] = useSize<HTMLDivElement>();
  return (
    <div ref={ref} className="relative h-64 w-full overflow-hidden border border-line-subtle bg-surface">
      <ContourGround />
      {size.w > 0 && <MapMarker variant="crosshair" x={Math.round(size.w * 0.4)} y={Math.round(size.h / 2)} value="41.3 ac" coordinates="32.1745, -96.8921" />}
    </div>
  );
}

// The tag alone, on Forest and on white.
export function Tags() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-4">
      <MapTag value="412 ft" coordinates="32.1745, -96.8921" />
      <MapTag tone="photo" value="412 ft" coordinates="32.1745, -96.8921" className="ds-cut-frame [--ds-shape-stroke:var(--ds-color-border-default)]" />
      <MapTag layout="row" value="41.3 ac" coordinates="32.1745, -96.8921" />
    </div>
  );
}
