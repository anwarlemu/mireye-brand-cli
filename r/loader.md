# Loader
Both drawn loaders from one module: ContourLoader for terrain and LineFillLoader for data.

Install: npx mireye-ds add loader
Requires: theme, utils, diamond, use-loop-frame
Packages: none
Exports: CONTOURS, ContourLoader, LINE_FILLS, LineFillLoader
Client boundary: yes
Reference: Figma "UI · Loaders" (443:2)


## Usage
Import either loader from here when a screen uses both; ContourLoader and LineFillLoader have their own entries with the details. NodeLoader, Dial and ParcelScan are separate.
- Avoid: Two loaders in one view
- Avoid: Loaders without words saying what loads, outside a tile


## Examples
Example components: npx mireye-ds add loader
[Preview](https://mireye-ds.agencidev.com/preview/loader/Preview)

examples/loader.tsx

```tsx
import { ContourLoader, LineFillLoader } from "@/components/ui/loader";

// The two drawn loaders, side by side: contours while terrain loads, lines while data loads.
export function Preview() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-10">
      <span className="flex flex-col items-center gap-3">
        <ContourLoader size={200} />
        <span className="ds-trim text-caption text-fg-muted">Loading terrain</span>
      </span>
      <span className="flex flex-col items-center gap-3">
        <LineFillLoader size={160} />
        <span className="ds-trim text-caption text-fg-muted">Loading parcel data</span>
      </span>
    </div>
  );
}

```

## Source

components/ui/loader.tsx

```tsx
"use client";

import * as React from "react";
import { cn, svgBox, svgSize } from "@/lib/utils";
import { Diamond } from "@/components/ui/diamond";
import { usePrefersReducedMotion } from "@/lib/use-loop-frame";

/**
 * Loader: Mireye's two drawn loaders, from Figma "UI · Loaders" (443:2).
 * - ContourLoader: terrain loading, contour rings around a survey node.
 * - LineFillLoader: data loading, a bell of lines travelling across.
 * NodeLoader, Dial and ParcelScan are separate components.
 */

// Contour ---------------------------------------------------------------------------------

/**
 * ContourLoader: the map loader. Four terrain contours around a survey node. One contour at a
 * time is drawn in Forest at 1.5px, and the highlight walks outwards ring by ring.
 * Source: Figma "UI · Loaders" (443:2). Hero 443:9 (200px, third ring); frames 443:16, 443:23,
 * 443:30, 443:37, 443:44 (56px, rings 1, 2, 3, 4, then 1 again: the loop closes).
 *
 * - The ring paths are Figma's own vectors for each size (443:9 at 200px, 443:16 at 56px).
 *   The 56px set is the 200px set × 0.28, but scaling the 200px numbers here misses Figma's
 *   56px export by 0.01px at 33 points (rounding), so we keep both exports as drawn.
 * - Strokes do not scale: resting rings are 1px Stone and the active ring is 1.5px Forest at
 *   both sizes, and at the product scale (non-scaling strokes).
 * - The diamond does not scale with the rings either: 20px at 200, 8px at 56 (Figma's sizes).
 * - `frame` is the active ring, 0 = innermost. Any integer works (it wraps), so Figma's fifth
 *   frame is `frame={4}`.
 * - Motion (29 Oct, second version: one ring switching on and off read as blinking). Running,
 *   a pulse ripples outwards: each ring warms from 1px Stone to 1.5px Forest and cools again, the
 *   next one 180ms later, so the rings light in a wave from the node to the edge, then rest
 *   before the next wave (1.5s a loop). CSS only: stroke color and width. Off, or under reduced
 *   motion, the loader holds `frame`, as Figma draws it.
 */

// Ring paths, inner to outer (Figma "Vector" … "Vector_4"), centered on the box.
export const CONTOURS = {
  // Frames on the Loaders board (443:16, 443:23, 443:30, 443:37, 443:44): 56×56, 8px diamond.
  56: {
    diamond: 8,
    rings: [
      "M36.71 28L36.73 28.66L36.63 29.31L36.39 29.93L36.03 30.51L35.57 31.03L35.04 31.49L34.47 31.9L33.89 32.25L33.33 32.58L32.77 32.89L32.24 33.2L31.7 33.52L31.16 33.83L30.59 34.12L29.99 34.37L29.35 34.57L28.68 34.69L28 34.73L27.32 34.68L26.66 34.55L26.02 34.35L25.42 34.11L24.84 33.83L24.28 33.54L23.74 33.23L23.21 32.91L22.69 32.57L22.18 32.2L21.7 31.79L21.27 31.34L20.9 30.85L20.6 30.32L20.38 29.76L20.23 29.18L20.14 28.59L20.11 28L20.1 27.41L20.13 26.81L20.18 26.2L20.27 25.58L20.41 24.95L20.61 24.33L20.91 23.73L21.31 23.17L21.82 22.68L22.42 22.28L23.1 21.99L23.84 21.8L24.59 21.71H25.34L26.06 21.77L26.74 21.85L27.38 21.95L28 22.04L28.6 22.11L29.19 22.18L29.8 22.24L30.41 22.32L31.02 22.43L31.63 22.59L32.23 22.8L32.81 23.07L33.35 23.4L33.87 23.77L34.35 24.18L34.8 24.62L35.24 25.1L35.64 25.61L36.01 26.15L36.33 26.74L36.57 27.36L36.71 28Z",
      "M42.97 28L42.94 29.12L42.7 30.23L42.23 31.28L41.57 32.25L40.76 33.12L39.84 33.88L38.87 34.55L37.9 35.14L36.94 35.69L36.02 36.22L35.13 36.76L34.25 37.31L33.34 37.85L32.39 38.38L31.38 38.84L30.3 39.2L29.16 39.43L28 39.52L26.84 39.45L25.7 39.24L24.6 38.92L23.55 38.51L22.55 38.05L21.58 37.56L20.64 37.04L19.71 36.5L18.79 35.92L17.9 35.29L17.06 34.59L16.3 33.81L15.64 32.96L15.11 32.03L14.72 31.06L14.46 30.05L14.32 29.03L14.27 28L14.3 26.97L14.38 25.93L14.51 24.89L14.71 23.84L14.99 22.78L15.4 21.74L15.96 20.75L16.68 19.83L17.58 19.04L18.63 18.4L19.8 17.93L21.04 17.64L22.31 17.51H23.56L24.76 17.6L25.89 17.73L26.97 17.86L28 17.96L29.01 18.02L30.04 18.06L31.08 18.1L32.16 18.17L33.25 18.31L34.35 18.54L35.43 18.87L36.47 19.32L37.44 19.88L38.36 20.53L39.2 21.25L39.99 22.05L40.71 22.9L41.37 23.81L41.96 24.78L42.44 25.81L42.79 26.89L42.97 28Z",
      "M49.12 28L48.99 29.58L48.56 31.12L47.85 32.57L46.88 33.91L45.71 35.1L44.41 36.15L43.06 37.07L41.71 37.89L40.4 38.67L39.15 39.43L37.94 40.21L36.74 41.01L35.5 41.82L34.18 42.6L32.76 43.29L31.25 43.85L29.65 44.21L28 44.37L26.34 44.3L24.71 44.02L23.14 43.58L21.64 43.02L20.21 42.37L18.82 41.68L17.46 40.95L16.12 40.18L14.8 39.35L13.51 38.45L12.3 37.45L11.2 36.34L10.25 35.12L9.5 33.79L8.94 32.39L8.58 30.94L8.41 29.47L8.37 28L8.45 26.53L8.62 25.06L8.87 23.59L9.22 22.12L9.7 20.66L10.34 19.23L11.18 17.87L12.24 16.63L13.53 15.56L15.02 14.7L16.66 14.08L18.4 13.69L20.15 13.52H21.87L23.52 13.61L25.08 13.74L26.56 13.85L28 13.91H29.43L30.9 13.87L32.41 13.83L33.99 13.85L35.6 13.98L37.23 14.26L38.82 14.71L40.35 15.34L41.78 16.15L43.1 17.11L44.3 18.18L45.39 19.37L46.37 20.63L47.24 21.98L47.99 23.39L48.58 24.88L48.97 26.42L49.12 28Z",
      "M55.04 28L54.77 30.01L54.14 31.96L53.16 33.8L51.88 35.47L50.37 36.97L48.72 38.29L47.03 39.46L45.35 40.52L43.74 41.53L42.2 42.55L40.7 43.6L39.21 44.69L37.65 45.8L35.98 46.87L34.18 47.82L32.22 48.59L30.15 49.11L28 49.35L25.83 49.29L23.7 48.95L21.65 48.39L19.68 47.66L17.79 46.82L15.97 45.92L14.19 44.96L12.44 43.95L10.71 42.87L9.03 41.69L7.44 40.38L6.01 38.92L4.78 37.31L3.81 35.57L3.11 33.74L2.67 31.84L2.49 29.92L2.5 28L2.67 26.09L2.96 24.2L3.37 22.32L3.89 20.45L4.58 18.61L5.47 16.81L6.6 15.11L8.01 13.57L9.68 12.24L11.59 11.18L13.68 10.41L15.87 9.93L18.07 9.69L20.23 9.64L22.3 9.7L24.26 9.78L26.15 9.81L28 9.77L29.87 9.65L31.8 9.49L33.81 9.34L35.92 9.28L38.09 9.38L40.28 9.71L42.42 10.29L44.45 11.14L46.34 12.23L48.05 13.53L49.58 15L50.94 16.61L52.12 18.33L53.14 20.13L53.98 22.01L54.6 23.97L54.97 25.97L55.04 28Z",
    ],
  },
  // Hero on the Loaders board (443:9): 200×200, 20px diamond.
  200: {
    diamond: 20,
    rings: [
      "M131.11 100L131.19 102.35L130.81 104.67L129.95 106.9L128.66 108.97L127.02 110.84L125.13 112.48L123.11 113.92L121.05 115.19L119.02 116.36L117.05 117.47L115.13 118.59L113.23 119.7L111.28 120.81L109.25 121.85L107.09 122.76L104.81 123.47L102.43 123.9L100 124.04L97.57 123.85L95.2 123.39L92.93 122.69L90.77 121.81L88.71 120.83L86.72 119.78L84.79 118.68L82.89 117.54L81.02 116.32L79.21 115L77.51 113.55L75.96 111.93L74.64 110.17L73.57 108.27L72.78 106.27L72.25 104.21L71.94 102.11L71.81 100L71.8 97.88L71.89 95.74L72.08 93.57L72.39 91.36L72.88 89.12L73.62 86.9L74.68 84.75L76.11 82.76L77.92 81.01L80.08 79.59L82.52 78.53L85.13 77.86L87.83 77.55L90.49 77.54L93.06 77.74L95.5 78.05L97.8 78.4L100 78.71L102.14 78.98L104.27 79.2L106.41 79.42L108.59 79.7L110.79 80.1L112.98 80.67L115.12 81.43L117.17 82.4L119.12 83.56L120.95 84.88L122.67 86.35L124.3 87.93L125.84 89.64L127.29 91.46L128.61 93.41L129.74 95.49L130.6 97.7L131.11 100Z",
      "M153.45 100L153.36 104.01L152.48 107.96L150.83 111.71L148.48 115.17L145.57 118.28L142.29 121L138.83 123.38L135.34 125.5L131.94 127.47L128.66 129.37L125.48 131.29L122.32 133.24L119.08 135.2L115.68 137.06L112.06 138.7L108.2 140L104.15 140.83L100 141.13L95.84 140.89L91.77 140.15L87.85 139L84.11 137.55L80.53 135.9L77.08 134.13L73.71 132.28L70.39 130.35L67.12 128.28L63.94 126.02L60.94 123.52L58.21 120.75L55.87 117.7L53.98 114.4L52.58 110.93L51.66 107.33L51.15 103.68L50.98 100L51.06 96.32L51.34 92.62L51.82 88.9L52.52 85.14L53.55 81.37L55 77.66L56.99 74.1L59.58 70.83L62.78 67.99L66.53 65.7L70.71 64.03L75.16 63L79.69 62.54L84.15 62.55L88.43 62.86L92.48 63.32L96.32 63.78L100 64.14L103.62 64.37L107.27 64.52L111.01 64.66L114.85 64.91L118.76 65.39L122.69 66.21L126.54 67.41L130.24 69.01L133.73 70.99L136.98 73.31L140.01 75.91L142.81 78.75L145.4 81.79L147.77 85.05L149.86 88.51L151.59 92.18L152.83 96.03L153.45 100Z",
      "M175.42 100L174.96 105.64L173.44 111.14L170.88 116.33L167.41 121.1L163.24 125.36L158.6 129.1L153.77 132.38L148.95 135.33L144.29 138.09L139.83 140.82L135.5 143.61L131.2 146.48L126.77 149.37L122.07 152.14L117.02 154.62L111.6 156.6L105.89 157.91L100 158.45L94.08 158.2L88.27 157.23L82.66 155.65L77.3 153.64L72.17 151.33L67.21 148.85L62.36 146.24L57.57 143.49L52.85 140.55L48.26 137.34L43.93 133.77L40 129.79L36.62 125.42L33.91 120.69L31.93 115.69L30.66 110.51L30.02 105.27L29.9 100L30.19 94.75L30.79 89.51L31.69 84.26L32.93 79.01L34.63 73.78L36.91 68.68L39.91 63.82L43.72 59.38L48.32 55.56L53.65 52.49L59.51 50.28L65.7 48.91L71.97 48.3L78.11 48.27L83.99 48.61L89.56 49.07L94.86 49.46L100 49.67H105.12L110.35 49.54L115.76 49.41L121.38 49.48L127.15 49.93L132.95 50.92L138.64 52.54L144.1 54.8L149.21 57.68L153.92 61.09L158.21 64.95L162.11 69.16L165.61 73.69L168.73 78.49L171.39 83.55L173.49 88.86L174.89 94.37L175.42 100Z",
      "M196.58 100L195.6 107.19L193.34 114.15L189.85 120.7L185.28 126.69L179.9 132.04L174.02 136.75L167.95 140.92L161.96 144.71L156.2 148.33L150.7 151.96L145.37 155.72L140.02 159.62L134.47 163.57L128.52 167.38L122.06 170.8L115.08 173.55L107.67 175.41L100 176.24L92.27 176.02L84.66 174.82L77.31 172.82L70.28 170.22L63.55 167.23L57.04 163.98L50.68 160.57L44.41 156.97L38.23 153.12L32.24 148.9L26.58 144.21L21.46 139L17.08 133.25L13.59 127.05L11.09 120.49L9.55 113.72L8.88 106.86L8.92 100L9.52 93.19L10.57 86.44L12.02 79.73L13.91 73.05L16.36 66.46L19.53 60.05L23.58 53.98L28.59 48.47L34.57 43.73L41.39 39.93L48.85 37.18L56.66 35.45L64.55 34.61L72.25 34.44L79.63 34.64L86.66 34.92L93.39 35.05L100 34.91L106.67 34.48L113.56 33.89L120.77 33.35L128.3 33.14L136.05 33.51L143.86 34.68L151.49 36.76L158.76 39.77L165.5 43.67L171.61 48.32L177.08 53.58L181.91 59.33L186.14 65.45L189.78 71.9L192.77 78.62L195.01 85.59L196.33 92.75L196.58 100Z",
    ],
  },
} as const;

const RINGS = 4;

export function ContourLoader({
  size = 56,
  frame = 0,
  running = true,
  className,
  ...props
}: React.SVGProps<SVGSVGElement> & {
  size?: keyof typeof CONTOURS;
  /** Active ring, 0 = innermost. Wraps, so 4 is ring 0 again. */
  frame?: number;
  running?: boolean;
}) {
  const reduced = usePrefersReducedMotion();
  const wave = running && !reduced;
  const active = ((frame % RINGS) + RINGS) % RINGS;
  const { diamond: node, rings } = CONTOURS[size];
  const c = size / 2;
  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      fill="none"
      role="img"
      aria-label="Loading"
      data-slot="contour-loader"
      data-frame={wave ? undefined : active}
      className={cn("block shrink-0", svgBox, className)}
      {...props}
      style={svgSize(size, size, props.style)}
    >
      {rings.map((d, i) =>
        wave ? (
          <path
            key={i}
            d={d}
            data-slot="ring"
            vectorEffect="non-scaling-stroke"
            className="animate-[ds-contour_1.5s_cubic-bezier(0.45,0,0.55,1)_infinite_both] stroke-line"
            style={{ animationDelay: `${i * 180}ms` }}
          />
        ) : (
          <path
            key={i}
            d={d}
            data-slot="ring"
            vectorEffect="non-scaling-stroke"
            data-active={i === active || undefined}
            strokeWidth={i === active ? 1.5 : 1}
            className={i === active ? "stroke-line-strong" : "stroke-line"}
          />
        ),
      )}
      <Diamond size={node} x={c - node / 2} y={c - node / 2} className="text-fg" />
    </svg>
  );
}

// Line fill -------------------------------------------------------------------------------

/**
 * LineFillLoader: the data loader. Eleven vertical lines rise into a bell around a peak that
 * steps left to right, like a chart filling in. Source: Figma "UI · Loaders" (443:2).
 * Hero 443:52 (160×120, peak on line 6); frames 443:56, 443:60, 443:64, 443:68, 443:72
 * (40×32, peak on lines 2, 4, 6, 8, 10).
 *
 * - Lines sit at x = 0.5 + i × pitch (pitch 16 at 160px, 4 at 40px), 1.5px wide, rising from
 *   the bottom edge. Figma draws the eleventh line on the right edge and clips it to a 0.25px
 *   sliver; we keep its geometry and clip, so the pixels match.
 * - Heights: box height × (0.12 + 0.88 × e^−(d/1.6)²), d = lines away from the peak. This is
 *   the curve behind Figma's numbers: it gives every y value in both sizes to 0.01px.
 * - The peak and its two neighbors are Forest; every other line is Stone.
 * - `frame` 0–4 is Figma's frame order: the peak sits on line 1 + 2 × frame (0-based).
 * - Motion (29 Oct, second version: the peak hopped two lines a frame). Running, the peak glides:
 *   every line rises into the bell and falls back as the peak passes, the next line 100ms later,
 *   so the bell travels left to right in one smooth wave (1.4s a loop), darkening to Forest
 *   at its top. CSS only: each line is drawn full height and scaled from the bottom (transform)
 *   with its stroke color. Off, or under reduced motion, the loader holds `frame`.
 */

export const LINE_FILLS = {
  // Frames on the Loaders board (443:56 …).
  40: { width: 40, height: 32, pitch: 4 },
  // Hero on the Loaders board (443:52).
  160: { width: 160, height: 120, pitch: 16 },
} as const;

const LINES = 11;
const FRAMES = 5;
const r2 = (v: number) => Math.round(v * 100) / 100;

export function LineFillLoader({
  size = 40,
  frame = 0,
  running = true,
  className,
  ...props
}: React.SVGProps<SVGSVGElement> & {
  /** Width in px: 40 (inline, 40×32) or 160 (hero, 160×120). */
  size?: keyof typeof LINE_FILLS;
  /** 0–4, Figma's frames. Wraps. */
  frame?: number;
  running?: boolean;
}) {
  const { width, height, pitch } = LINE_FILLS[size];
  const reduced = usePrefersReducedMotion();
  const wave = running && !reduced;
  const peak = 1 + 2 * (((frame % FRAMES) + FRAMES) % FRAMES);
  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      fill="none"
      role="img"
      aria-label="Loading"
      data-slot="line-fill-loader"
      data-frame={wave ? undefined : peak >> 1}
      // The root svg clips to its box, like Figma's frame clip.
      className={cn("block shrink-0 overflow-hidden", svgBox, className)}
      {...props}
      style={svgSize(width, height, props.style)}
    >
      {Array.from({ length: LINES }, (_, i) => {
        if (wave)
          return (
            <path
              key={i}
              d={`M${i * pitch + 0.5} ${height}V0`}
              data-slot="line"
              strokeWidth={1.5}
              className="origin-bottom stroke-line [transform-box:fill-box] animate-[ds-line-wave_1.4s_linear_infinite_both]"
              style={{ animationDelay: `${i * 100}ms` }}
            />
          );
        const d = Math.abs(i - peak);
        const top = r2(height - height * (0.12 + 0.88 * Math.exp(-((d / 1.6) ** 2))));
        const on = d <= 1;
        return (
          <path
            key={i}
            d={`M${i * pitch + 0.5} ${height}V${top}`}
            data-slot="line"
            data-active={on || undefined}
            strokeWidth={1.5}
            className={on ? "stroke-line-strong" : "stroke-line"}
          />
        );
      })}
    </svg>
  );
}

```
