import * as React from "react";
import { cn, svgBox, svgSize } from "@/lib/utils";

/** Arrow from the Figma buttons: 1.5px stroke, square caps. 20px on every UI board; the 16px
 * version comes from the identity boards (3.3).
 * `head` draws the arrowhead alone, centred in the box: turned 90° it is the chevron of the
 * UnitSelect, so the system keeps one arrow shape instead of adding a chevron icon. */
export function ArrowRightIcon({
  size = 20,
  head = false,
  className,
  style,
  ...props
}: React.SVGProps<SVGSVGElement> & { size?: 16 | 20; head?: boolean }) {
  const d =
    size === 16
      ? head
        ? "M4.75 14.5L11.25 8L4.75 1.5"
        : "M0 8H15M8.5 14.5L15 8L8.5 1.5"
      : head
        ? "M5.75 18.5L14.25 10L5.75 1.5"
        : "M0 10H19M10.5 18.5L19 10L10.5 1.5";
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} fill="none" aria-hidden data-slot="icon" className={cn(svgBox, className)} style={svgSize(size, size, style)} {...props}>
      <path d={d} stroke="currentColor" strokeWidth={1.5} />
    </svg>
  );
}
