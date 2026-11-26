# Diamond
The survey node: a square turned 45 degrees, solid or outlined, that marks map points, steps, statuses, bullets and the radio.

Install: npx mireye-ds add diamond
Requires: theme, utils
Packages: none
Exports: Diamond
Client boundary: not required by this entry file
Reference: Figma UI boards (442:2): the node on the map, steps, status and radio


## Usage
Use wherever a circle would mark a point: a map node, a step, a status, a list bullet. `variant="solid"` is confirmed or done, `variant="outline"` is pending or empty; give `fill` (the ground color) when lines behind should stop at the node. Pass Figma's size in px; it renders at the product scale. The color follows the text color.
- Avoid: Circles or dots for nodes and bullets
- Avoid: Colored nodes; they take the ink or Stone
- Avoid: Sizes off Figma's set (7, 9, 10, 12, 16, 22px)


## Examples
Example components: npx mireye-ds add diamond
[Preview](https://mireye-ds.agencidev.com/preview/diamond/Preview) | [Sizes](https://mireye-ds.agencidev.com/preview/diamond/Sizes)

examples/diamond.tsx

```tsx
"use client";

import * as React from "react";
import { Diamond } from "@/components/ui/diamond";

// Survey points: a solid node is confirmed, an outline is pending. Click a point to confirm or reopen it; the node
// changes at once, as a survey mark does.
const POINTS = ["North-west corner", "Substation tap", "Access road", "South-east corner"];

export function Preview() {
  const [done, setDone] = React.useState<Record<string, boolean>>({ "North-west corner": true });
  return (
    <ul className="mx-auto flex w-fit flex-col gap-1">
      {POINTS.map((p) => (
        <li key={p}>
          <button
            type="button"
            aria-pressed={!!done[p]}
            onClick={() => setDone((d) => ({ ...d, [p]: !d[p] }))}
            className="flex min-h-6 cursor-pointer items-center gap-2.5 text-body text-fg outline-none focus-visible:outline-solid focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-line-strong"
          >
            <Diamond size={12} variant={done[p] ? "solid" : "outline"} className={done[p] ? "text-fg" : "text-line"} />
            <span className="ds-trim">{p}</span>
          </button>
        </li>
      ))}
    </ul>
  );
}

// The sizes the system uses: a 7px bullet, a 9px map node, 10px status and result marks, 16px step markers.
export function Sizes() {
  return (
    <div className="flex items-center justify-center gap-6 text-fg">
      {[7, 9, 10, 12, 16].map((size) => (
        <span key={size} className="flex flex-col items-center gap-2">
          <Diamond size={size} />
          <Diamond size={size} variant="outline" />
          <span className="ds-trim text-caption text-fg-muted tabular-nums">{size}</span>
        </span>
      ))}
    </div>
  );
}

```

## Source

components/ui/diamond.tsx

```tsx
import * as React from "react";
import { cn, svgBox, svgSize } from "@/lib/utils";

/**
 * Diamond: the survey node. It marks map points, steps, statuses, list bullets and the radio.
 * Figma draws it as a square turned 45°, e.g. a 9px node is M4.5 0 L9 4.5 L4.5 9 L0 4.5 Z.
 *
 * - `solid`    filled with `color`.
 * - `outline`  a stroke kept inside the box, as in Figma's 7px bullet M3.5 0.71 L6.29 3.5 …
 *              It is drawn as a square turned 45° (inset by half the stroke) rather than as that
 *              path: Chrome anti-aliases the turned square the way Figma renders the path, and
 *              the path version misses by up to 52 pixels on a 28px radio.
 *              `fill` paints the inside (Figma uses the canvas color so lines behind stop at
 *              the node).
 * Colors default to the current text color.
 * The outline stays a 1px line at the product scale (non-scaling stroke), as every line in the
 * system does; scaled with the mark it would be a faint 0.6px.
 */
export function Diamond({
  size = 9,
  variant = "solid",
  color = "currentColor",
  fill = "none",
  strokeWidth = 1,
  className,
  style,
  ...props
}: Omit<React.SVGProps<SVGSVGElement>, "fill"> & {
  size?: number;
  variant?: "solid" | "outline";
  color?: string;
  fill?: string;
  strokeWidth?: number;
}) {
  const h = size / 2;
  const d = `M${h} 0L${size} ${h}L${h} ${size}L0 ${h}Z`;
  const side = size / Math.SQRT2; // the square that spans the box once turned
  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      aria-hidden
      data-slot="diamond"
      className={cn("block shrink-0", svgBox, className)}
      style={svgSize(size, size, style)}
      {...props}
    >
      {variant === "solid" ? (
        <path d={d} fill={color} />
      ) : (
        <rect
          x={h - side / 2 + strokeWidth / 2}
          y={h - side / 2 + strokeWidth / 2}
          width={side - strokeWidth}
          height={side - strokeWidth}
          transform={`rotate(45 ${h} ${h})`}
          fill={fill}
          stroke={color}
          strokeWidth={strokeWidth}
          vectorEffect="non-scaling-stroke"
        />
      )}
    </svg>
  );
}

```
