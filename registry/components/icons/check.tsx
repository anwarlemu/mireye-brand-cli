import * as React from "react";
import { cn, svgBox, svgSize } from "@/lib/utils";

/** Check from the Figma checkbox (442:161): 16×12 box, 1.75px stroke, path M1 6 L6 11 L15 1. */
export function CheckIcon({ className, style, ...props }: React.SVGProps<SVGSVGElement>) {
  // Scales with the spacing scale; a width/height prop sets its Figma-scale size.
  const w = Number(props.width ?? 16);
  const h = Number(props.height ?? 12);
  return (
    <svg width={16} height={12} viewBox="0 0 16 12" fill="none" aria-hidden data-slot="icon" className={cn(svgBox, className)} style={svgSize(w, h, style)} {...props}>
      <path d="M1 6L6 11L15 1" stroke="currentColor" strokeWidth={1.75} />
    </svg>
  );
}
