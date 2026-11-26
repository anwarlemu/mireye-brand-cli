# Progress
A determinate tick bar: 1px lines every 6px, Forest where done and Stone ahead, under a 16px title and its percentage.

Install: npx mireye-ds add progress
Requires: theme, ticks, use-loop-frame, utils
Packages: none
Exports: Progress
Client boundary: yes
Reference: Figma UI · Progress (442:213): Determinate, title 442:222, value 442:223, bar 442:224


## Usage
Use for a known amount of work the agent reports (Loading terrain, sources read, parcels matched). Give it a label, which names the bar and shows the percentage; without one, pass aria-label. The fill counts up a tick at a time. For a wait with no known end, use Spinner.
- Avoid: A solid or rounded fill
- Avoid: Striped or gradient fills
- Avoid: Easing or sliding the fill
- Avoid: Progress for something that takes under a second
- Avoid: A bar taller than 16px


## Examples
Example components: npx mireye-ds add progress
[Preview](https://mireye-ds.agencidev.com/preview/progress/Preview) | [Values](https://mireye-ds.agencidev.com/preview/progress/Values)

examples/progress.tsx

```tsx
"use client";

import * as React from "react";

import { Progress } from "@/components/ui/progress";

export function Preview() {
  const [value, setValue] = React.useState(24);
  React.useEffect(() => {
    // ds-latency: advances a presentation-only progress example; no user input is waiting.
    const t = setTimeout(() => setValue(62), 600);
    return () => clearTimeout(t);
  }, []);
  return (
    <div className="w-full max-w-100">
      <Progress label="Loading terrain" value={value} />
    </div>
  );
}

export function Values() {
  return (
    <div className="grid w-full max-w-100 gap-6">
      <Progress value={0} aria-label="Parcels matched" />
      <Progress value={38} aria-label="Sources read" />
      <Progress value={100} aria-label="Report written" />
    </div>
  );
}

```

## Source

components/ui/progress.tsx

```tsx
"use client";

import * as React from "react";

import { Ticks } from "@/components/ui/ticks";
import { usePrefersReducedMotion } from "@/lib/use-loop-frame";
import { cn } from "@/lib/utils";

/**
 * Progress: a determinate tick bar (Figma "UI · Progress", 442:213, row "Determinate": title 442:222, value 442:223,
 * bar 442:224), at the product scale.
 *
 * - The bar is a row of 1px lines every 6px, 16px tall (Figma's 28px at 0.6). Done lines are Forest, the rest Stone.
 * - The bar is as wide as the largest whole number of ticks that fits, so it never ends on a gap.
 * - With a `label`, a 16px regular title sits over the bar with the percentage at the right in a fixed box, so the
 *   title never moves while the digits change. The bar starts 12px under it.
 * - The bar carries role="progressbar" and is named by the title (or `aria-label`). The visible percentage is hidden
 *   from assistive tech because aria-valuetext already says it.
 * - Motion: when the value rises, the fill and the percentage count up one tick at a time, linear, in 300ms at most.
 *   Ticks count; they never ease or slide. A value that falls drops at once. Under reduced motion the fill jumps.
 */
const PITCH = 6;
const TICKS_PER_SHARE = 100;

/** Counts the shown share up to `target` in whole ticks, linear, in at most 300ms. */
function useCountedShare(target: number) {
  const reduced = usePrefersReducedMotion();
  const [shown, setShown] = React.useState(target);
  const last = React.useRef(target);
  React.useEffect(() => {
    const from = last.current;
    if (reduced || target <= from) {
      last.current = target;
      setShown(target);
      return;
    }
    const ticks = Math.max(1, Math.round((target - from) * TICKS_PER_SHARE));
    const duration = Math.min(300, ticks * 50);
    const start = performance.now();
    let raf = 0;
    const step = (now: number) => {
      const done = Math.min(1, (now - start) / duration);
      const v = from + (Math.floor(done * ticks) / ticks) * (target - from);
      last.current = v;
      setShown(v);
      if (done < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [target, reduced]);
  return shown;
}

type ProgressProps = Omit<React.ComponentProps<"div">, "children"> & {
  /** Current value, from 0 to `max`. */
  value?: number | null;
  max?: number;
  /** Title above the bar ("Loading terrain"). */
  label?: React.ReactNode;
  /** Shows the percentage at the right of the title. On when there is a label. */
  showValue?: boolean;
};

function Progress({ value, max = 100, label, showValue = label !== undefined, className, "aria-label": ariaLabel, ...props }: ProgressProps) {
  const labelId = React.useId();
  const v = value ?? 0;
  const share = max > 0 ? Math.min(1, Math.max(0, v / max)) : 0;
  const shown = useCountedShare(share);
  return (
    <div data-slot="progress" className={cn("flex w-full flex-col gap-3 font-sans text-h3 leading-none font-normal text-fg", className)} {...props}>
      {(label !== undefined || showValue) && (
        <div data-slot="progress-header" className="flex items-start justify-between gap-4">
          {label !== undefined && (
            <span id={labelId} data-slot="progress-label" className="ds-trim min-w-0">
              {label}
            </span>
          )}
          {showValue && (
            <span data-slot="progress-value" aria-hidden className="ds-trim ml-auto w-12 shrink-0 text-right whitespace-nowrap tabular-nums">
              {`${Math.round(shown * 100)}%`}
            </span>
          )}
        </div>
      )}
      <Ticks
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={max}
        aria-valuenow={Math.min(max, Math.max(0, v))}
        aria-valuetext={`${Math.round(share * 100)}%`}
        aria-label={label === undefined ? ariaLabel : undefined}
        aria-labelledby={label !== undefined ? labelId : undefined}
        data-slot="progress-indicator"
        pitch={PITCH}
        value={shown}
        on="var(--ds-color-border-strong)"
        off="var(--ds-color-border-default)"
        className="h-4"
        style={{ width: `calc(round(down, 100% - 1px, ${PITCH}px) + 1px)` }}
      />
    </div>
  );
}

export { Progress };

```
