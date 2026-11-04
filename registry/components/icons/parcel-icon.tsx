import * as React from "react";
import { cn, svgBox, svgSize } from "@/lib/utils";

/**
 * Parcel icon: a 1px square with a solid diamond inside. Figma "Parcel icon" (16px in the
 * search field 442:141; 14px and 12px versions exist on other boards).
 * Every size uses the same geometry: the square's stroke is inset 0.5px (Figma's centred 1px
 * stroke), and the diamond spans the middle half, e.g. 16px is M8 4 L12 8 L8 12 L4 8 Z.
 */
export function ParcelIcon({ size = 16, className, style, ...props }: React.SVGProps<SVGSVGElement> & { size?: number }) {
  const m = size / 2;
  const q = size / 4;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} fill="none" aria-hidden data-slot="icon" className={cn(svgBox, className)} style={svgSize(size, size, style)} {...props}>
      <path d={`M0.5 0.5H${size - 0.5}V${size - 0.5}H0.5V0.5Z`} stroke="currentColor" />
      <path d={`M${m} ${q}L${3 * q} ${m}L${m} ${3 * q}L${q} ${m}Z`} fill="currentColor" />
    </svg>
  );
}
