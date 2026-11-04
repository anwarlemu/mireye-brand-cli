"use client";

import * as React from "react";
import { Ticks } from "@/components/ui/ticks";

// Ticks are the system's measuring language: 1px lines at a fixed pitch. A share of the width lights up in Forest
// over Stone; here a parcel's screen fills in.
export function Preview() {
  const [value, setValue] = React.useState(0.25);
  React.useEffect(() => {
    // ds-latency: the demo plays a run on a clock; no input waits on this timer.
    const id = window.setTimeout(() => setValue((v) => (v >= 1 ? 0.25 : Math.min(1, v + 0.25))), 1200);
    return () => window.clearTimeout(id);
  }, [value]);
  return (
    <div className="mx-auto flex w-full max-w-80 flex-col gap-3">
      <div className="flex items-baseline justify-between text-caption">
        <span className="ds-trim text-fg-secondary">Fields screened</span>
        <span className="ds-trim text-fg tabular-nums">{Math.round(value * 22)} of 22</span>
      </div>
      <Ticks pitch={6} value={value} on="var(--ds-color-border-strong)" off="var(--ds-color-border-default)" className="h-3 w-full" />
    </div>
  );
}

// Counted lines: `filled` lights a number of lines, so no tick is ever half lit. The 4px pitch is the text button's
// underline.
export function Counted() {
  return (
    <div className="mx-auto flex w-fit flex-col gap-4">
      <Ticks pitch={6} filled={9} on="var(--ds-color-border-strong)" off="var(--ds-color-border-default)" className="h-3 w-36" />
      <Ticks pitch={4} filled={40} on="var(--ds-color-border-strong)" className="h-1.5 w-40" />
    </div>
  );
}
