import type { ComponentType } from "react";

import { Surface } from "@/lib/surface";
import { cn } from "@/lib/utils";

/** The panel an example sits in: a 12px label over a canvas stage framed by the 1px Stone line with the cut corner. */
export function PreviewPanel({ label, actions, children }: { label: string; actions?: React.ReactNode; children: React.ReactNode }) {
  return (
    <figure className="m-0 grid min-w-0 gap-2">
      <div className="flex min-h-8 items-center justify-between gap-3">
        <figcaption className="text-caption leading-tight text-fg-secondary">{label}</figcaption>
        {actions}
      </div>
      <div className="ds-cut-frame p-px [--ds-shape-fill:var(--ds-color-bg-page)] [--ds-shape-stroke:var(--ds-color-border-default)]">
        {/* Clipped to the frame's inner edge, so a stage with its own ground keeps the cut corner. */}
        <div className="overflow-hidden [clip-path:polygon(calc(var(--ds-cut)-0.7929px)_0,100%_0,100%_100%,0_100%,0_calc(var(--ds-cut)-0.7929px))]">{children}</div>
      </div>
    </figure>
  );
}

// An example rendered in place, centered on the canvas.
export function Preview({ example: Example, label }: { example: ComponentType; label: string }) {
  return (
    <PreviewPanel label={label}>
      <Surface className={cn("relative flex min-h-56 items-center justify-center bg-transparent p-6 sm:p-10")}>
        <div className="w-full max-w-full">
          <Example />
        </div>
      </Surface>
    </PreviewPanel>
  );
}
