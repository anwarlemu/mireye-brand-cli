import * as React from "react";

import { cn } from "@/lib/utils";

// A key, as Mireye writes data: a square 20px cap with no cut (small things are square), a 1px Stone line on white and
// the key in 12px DM Mono in 80% Forest; glyphs inside are 12px. In a tooltip (on Forest) the line turns Haze and the
// text white. Keys are labels, never pressable.
function Kbd({ className, ...props }: React.ComponentProps<"kbd">) {
  return (
    <kbd
      data-slot="kbd"
      className={cn(
        "pointer-events-none inline-flex h-5 w-fit min-w-5 items-center justify-center gap-1 border border-line bg-surface px-1 font-mono text-caption leading-none font-normal text-fg-secondary select-none",
        "in-data-[slot=tooltip-content]:border-fg-inverse-muted in-data-[slot=tooltip-content]:bg-transparent in-data-[slot=tooltip-content]:text-fg-inverse [&_svg:not([class*='size-'])]:size-3",
        className,
      )}
      {...props}
    />
  );
}

function KbdGroup({ className, ...props }: React.ComponentProps<"kbd">) {
  return <kbd data-slot="kbd-group" className={cn("inline-flex items-center gap-1", className)} {...props} />;
}

export { Kbd, KbdGroup };
