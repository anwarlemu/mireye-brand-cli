"use client";

import * as React from "react";
import { MapControls, MapMarker, MapScale } from "@/components/ui/map";

// Live imagery: USGS The National Map's orthoimagery (USDA NAIP, public domain), a field south of Italy, Texas. The
// marks are an overlay on it. Tiles fade in as they arrive; offline the map keeps its Forest ground and the marks
// still read. A product swaps in its own imagery provider.
const TILE = 256;
const POINT = { lat: 32.1745, lon: -96.8921 };
const LEVELS = [14, 15, 16, 17];
const tileUrl = (z: number, x: number, y: number) => `https://basemap.nationalmap.gov/arcgis/rest/services/USGSImageryOnly/MapServer/tile/${z}/${y}/${x}`;

/** The point in Web Mercator world pixels at zoom z. */
function world(z: number) {
  const n = TILE * 2 ** z;
  const lat = (POINT.lat * Math.PI) / 180;
  return { x: ((POINT.lon + 180) / 360) * n, y: ((1 - Math.log(Math.tan(lat) + 1 / Math.cos(lat)) / Math.PI) / 2) * n };
}

/** Feet the scale bar covers: its 96px at the ground resolution of the point's latitude, to the nearest 10 ft. */
function scaleLabel(z: number) {
  const metersPerPx = (156543.03392 * Math.cos((POINT.lat * Math.PI) / 180)) / 2 ** z;
  const feet = Math.round((96 * metersPerPx * 3.28084) / 10) * 10;
  return `${feet.toLocaleString("en-US")} ft`;
}

function Tile({ src, left, top }: { src: string; left: number; top: number }) {
  const [loaded, setLoaded] = React.useState(false);
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt=""
      draggable={false}
      onLoad={() => setLoaded(true)}
      className={`ds-imagery absolute block size-64 max-w-none transition-opacity duration-150 ease-out motion-reduce:transition-none ${loaded ? "opacity-100" : "opacity-0"}`}
      style={{ left: `calc(50% + ${left}px)`, top: `calc(50% + ${top}px)` }}
    />
  );
}

function Imagery({ z }: { z: number }) {
  const p = world(z);
  const tx = Math.floor(p.x / TILE);
  const ty = Math.floor(p.y / TILE);
  const tiles = [];
  for (let dy = -2; dy <= 2; dy++) for (let dx = -3; dx <= 3; dx++) tiles.push({ x: tx + dx, y: ty + dy });
  return (
    <div aria-hidden className="absolute inset-0">
      {tiles.map((t) => (
        <Tile key={`${z}/${t.x}/${t.y}`} src={tileUrl(z, t.x, t.y)} left={Math.round(t.x * TILE - p.x)} top={Math.round(t.y * TILE - p.y)} />
      ))}
    </div>
  );
}

export function Preview() {
  const ref = React.useRef<HTMLDivElement>(null);
  const [size, setSize] = React.useState({ w: 0, h: 0 });
  const [level, setLevel] = React.useState(2);
  React.useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setSize({ w: e.contentRect.width, h: e.contentRect.height }));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  const z = LEVELS[level];
  return (
    <div ref={ref} className="relative h-96 w-full overflow-hidden bg-inverse">
      <Imagery z={z} />
      <span className="ds-trim pointer-events-none absolute top-4 left-5 text-caption text-fg-inverse-muted">USGS · USDA NAIP</span>
      {size.w > 0 && <MapMarker tone="photo" x={Math.round(size.w / 2)} y={Math.round(size.h / 2)} value="412 ft" coordinates="32.1745, -96.8921" />}
      <MapScale label={scaleLabel(z)} className="absolute bottom-4 left-5 text-fg-inverse" />
      <MapControls
        className="absolute right-5 bottom-4"
        onZoomIn={() => setLevel((l) => Math.min(LEVELS.length - 1, l + 1))}
        onZoomOut={() => setLevel((l) => Math.max(0, l - 1))}
        zoomInDisabled={level === LEVELS.length - 1}
        zoomOutDisabled={level === 0}
      />
    </div>
  );
}

// The crosshair marker on imagery, its tag on the left near the map's right edge.
export function Crosshair() {
  const ref = React.useRef<HTMLDivElement>(null);
  const [size, setSize] = React.useState({ w: 0, h: 0 });
  React.useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setSize({ w: e.contentRect.width, h: e.contentRect.height }));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  return (
    <div ref={ref} className="relative h-72 w-full overflow-hidden bg-inverse">
      <Imagery z={16} />
      {size.w > 0 && <MapMarker variant="crosshair" side="left" tone="photo" x={Math.round(size.w * 0.7)} y={Math.round(size.h / 2)} value="41.3 ac" coordinates="32.1745, -96.8921" />}
    </div>
  );
}
