# Ticks
A row of 1px vertical lines at a fixed pitch: the system's measuring language for progress, loading keys and scores.

Install: npx mireye-ds add ticks
Requires: theme, utils
Packages: none
Exports: Ticks
Client boundary: not required by this entry file
Reference: Figma "UI · Progress" (442:213) and the Buttons board (442:3) loading state


## Usage
Use for any share or count drawn as a measure: progress, a fit score, a loading key's walk. Set `pitch` (6px for bars, 4px for the text button's underline), and `value` (0 to 1) or `filled` (a number of lines, so no tick is half lit). `on` and `off` take brand color variables: Forest over Stone, or Mist for empty.
- Avoid: Solid filled bars
- Avoid: Rounded or gradient progress tracks
- Avoid: A pitch other than 4 or 6px


## Examples
Example components: npx mireye-ds add ticks
[Preview](https://mireye-ds.agencidev.com/preview/ticks/Preview) | [Counted](https://mireye-ds.agencidev.com/preview/ticks/Counted)

examples/ticks.tsx

```tsx
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

```

## Source

components/ui/ticks.tsx

```tsx
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

```
