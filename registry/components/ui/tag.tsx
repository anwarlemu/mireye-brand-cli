import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * Tag: a filled data tag for a site value ("345 kV", "41.2 ac", "Zone X", "I-2 Industrial").
 * Source: Figma "UI · Status and tags" (442:177), nodes 442:202, 442:205, 442:208, 442:211.
 *
 * - 44px tall, Fog fill (#E6E8E4), 8px cut corner (`--ds-cut-sm`), no border, drawn by ds-cut.
 * - 20px Regular label, 16px from the left edge, centered on the row (Figma: cap box y = 15).
 * - Right padding: Figma sizes each tag by hand (20, 19, 18 and 20px after the Gilroy label), so
 *   Figma has no single value. With no width set, the tag uses 18px, the tightest of the four.
 *   Pass a width (`className="w-15"`) to reproduce a Figma frame exactly; the label stays left.
 * - Static text, not a control: it has no hover, focus or remove state in Figma.
 */
export function Tag({ className, children, ...props }: React.HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      data-slot="tag"
      className={cn(
        "inline-flex h-7 shrink-0 items-center pl-2.5 pr-2.5 whitespace-nowrap",
        "font-sans text-body font-normal text-fg",
        "ds-cut [--ds-cut:var(--ds-cut-sm)] [--ds-shape-fill:var(--ds-color-fog)]",
        className,
      )}
      {...props}
    >
      <span data-slot="label" className="ds-trim">
        {children}
      </span>
    </span>
  );
}
