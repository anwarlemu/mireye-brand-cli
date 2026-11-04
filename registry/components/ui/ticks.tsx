import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * Ticks: a row of 1px vertical lines at a fixed pitch. It is Mireye's progress language:
 * the button loader (pitch 6, 20px tall), the text-button hover underline (pitch 4, 6px tall)
 * and the progress bar all draw it.
 *
 * The first lines use `on`, the rest `off`. Give `filled` (a number of lines) when the
 * design counts lines, or `value` (0–1) for a share of the width.
 * Lines start at x = 0 on whole pixels, the same place as Figma's 0.5-offset 1px strokes.
 */
export function Ticks({
  pitch,
  filled,
  value = 1,
  on = "currentColor",
  off = "transparent",
  className,
  style,
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & {
  pitch: number;
  filled?: number;
  value?: number;
  on?: string;
  off?: string;
}) {
  const lines = (color: string) => `repeating-linear-gradient(to right, ${color} 0 1px, transparent 1px ${pitch}px)`;
  const onWidth =
    filled !== undefined ? (filled > 0 ? `${(filled - 1) * pitch + 1}px` : "0px") : `${Math.max(0, Math.min(1, value)) * 100}%`;
  return (
    // Spans, so ticks are valid inside buttons and labels.
    <span
      data-slot="ticks"
      className={cn("relative block shrink-0", className)}
      style={{ backgroundImage: lines(off), ...style }}
      {...props}
    >
      <span className="absolute inset-y-0 left-0" style={{ width: onWidth, backgroundImage: lines(on) }} />
    </span>
  );
}
