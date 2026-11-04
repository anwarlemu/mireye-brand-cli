import * as React from "react";
import { cn, svgBox, svgSize } from "@/lib/utils";

/** Plus from the Figma icon button: 18px cross in a 20px box, 1.5px stroke. */
export function PlusIcon({ size = 20, className, style, ...props }: React.SVGProps<SVGSVGElement> & { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none" aria-hidden data-slot="icon" className={cn(svgBox, className)} style={svgSize(size, size, style)} {...props}>
      <path d="M10 1V10M10 10V19M10 10H1M10 10H19" stroke="currentColor" strokeWidth={1.5} />
    </svg>
  );
}
