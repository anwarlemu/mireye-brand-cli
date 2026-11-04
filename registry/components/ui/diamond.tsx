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
