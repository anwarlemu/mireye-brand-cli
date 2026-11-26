# Range
A tick ruler for one value under a field: 1px Stone ticks 8px tall every 6px, a 1.5px Forest handle that snaps to the nearest tick, and 12px helper text in 80% Forest. The ticks rise like a ruler under a lens near the pointer and the handle.

Install: npx mireye-ds add range
Requires: theme, ticks, use-loop-frame, utils
Packages: none
Exports: Range
Client boundary: yes
Reference: Figma "UI · Inputs" (442:107): Range 442:134 and Helper 442:137 under the Filled field


## Usage
Use under a numeric field when the value has a known span (Within 40 to 120 ac). Share one value between the field and the ruler, so typing moves the handle and dragging writes the field. Give it an aria-label.
- Avoid: A filled or colored track
- Avoid: A handle between ticks
- Avoid: A Range without a field or text showing the exact value


## Examples
Example components: npx mireye-ds add range input label
[Preview](https://mireye-ds.agencidev.com/preview/range/Preview) | [Bare](https://mireye-ds.agencidev.com/preview/range/Bare)

examples/range.tsx

```tsx
"use client";

import * as React from "react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Range } from "@/components/ui/range";

// The Filled row from Figma: the field and the ruler share one value. Typing moves the handle; dragging, a press or
// the arrow keys write the value back into the field. Hover the ruler to see the ticks rise around the pointer.
export function Preview() {
  const [text, setText] = React.useState("41.2");
  const n = Number.parseFloat(text);
  const value = Number.isNaN(n) ? 40 : n;
  return (
    <div className="grid w-full max-w-96 gap-2">
      <Label htmlFor="range-size">Parcel size</Label>
      <Input id="range-size" unit="ac" inputMode="decimal" value={text} onChange={(e) => setText(e.target.value)} />
      <Range className="mt-2" min={40} max={120} step={0.1} value={value} onValueChange={(v) => setText(String(v))} helper="Within 40 to 120 ac" aria-label="Parcel size" />
    </div>
  );
}

export function Bare() {
  return <Range className="w-full max-w-96" min={0} max={10} defaultValue={2} aria-label="Distance to a substation in miles" helper="Up to 2 miles from a substation" />;
}

```

## Source

components/ui/range.tsx

```tsx
"use client";

import * as React from "react";

import { Ticks } from "@/components/ui/ticks";
import { usePrefersReducedMotion } from "@/lib/use-loop-frame";
import { cn } from "@/lib/utils";

/**
 * Range: a tick ruler for one value, with helper text, used under a field. Source: Figma "UI · Inputs" (442:107), the
 * Range and its helper under the Filled field.
 *
 * - The ruler keeps Figma's geometry, since its pitch is the brand's hatch pitch: a 16px band of 1px Stone ticks, 8px
 *   tall (4px from the top), every 6px. Any width works; the last tick is the last whole 6px step.
 * - The handle is a 1.5px Forest line the full 16px tall, centred on a tick. It snaps to the tick nearest the value (in
 *   Figma, 41.2 in 40 to 120 lands on the third tick). CSS `round()` does that snap before the width is measured.
 * - Helper text is 12px in 80% Forest, 12px under the ruler.
 *
 * The ruler (`data-slot="track"`) is a keyboard and pointer slider with the ARIA slider attributes; extra props
 * (`aria-label`, ...) go to it, `className` styles the root. Keyboard focus draws the 1px Forest outline around the
 * handle only.
 *
 * Motion. The ticks rise like a ruler under a lens, falling off over 5 ticks each side (a cosine), each tick easing
 * over 150ms, so the lens slides as a smooth wave:
 * - Hover: the lens sits under the pointer (ticks up to 12px), showing where a press will land.
 * - Press: the handle glides to the pressed tick in 150ms on the ease-out curve.
 * - Drag: the handle follows the pointer exactly, and the lens under it rises to 14px. On release it settles onto the
 *   nearest tick in 150ms.
 * - Keys: each arrow press moves one tick (Page Up/Down ten), and the handle glides there; the lens sits on the handle
 *   while the ruler has keyboard focus.
 * At rest the row is Figma's flat 8px. Under reduced motion there is no lens and the handle moves at once.
 */
const PITCH = 6;
const LENS = 5; // ticks each side of the handle that rise
const LIFT = 0.75; // dragging: the tick under the handle grows by 75%, 8px → 14px
const HOVER_LIFT = 0.5; // hovering: 8px → 12px

type RangeProps = Omit<React.HTMLAttributes<HTMLDivElement>, "defaultValue" | "onChange"> & {
  min: number;
  max: number;
  value?: number;
  defaultValue?: number;
  /** Value step for keys and dragging. Arrow keys move one step, Page Up/Down ten. */
  step?: number;
  onValueChange?: (value: number) => void;
  helper?: React.ReactNode;
};

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

export function Range({
  min,
  max,
  value,
  defaultValue,
  step = 1,
  onValueChange,
  helper,
  className,
  ...props
}: RangeProps) {
  const [inner, setInner] = React.useState(defaultValue ?? min);
  const current = clamp(value ?? inner, min, max);
  const share = max > min ? (current - min) / (max - min) : 0;
  const helperId = React.useId();
  const decimals = (String(step).split(".")[1] ?? "").length;
  const reduced = usePrefersReducedMotion();

  // The track's width sets how many ticks fit (the last whole 6px step).
  const track = React.useRef<HTMLDivElement>(null);
  const [width, setWidth] = React.useState(0);
  React.useLayoutEffect(() => {
    const el = track.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setWidth(e.contentRect.width));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  const lastTick = Math.max(0, Math.floor((width - 1) / PITCH) * PITCH);
  const handleX = Math.round((share * lastTick) / PITCH) * PITCH;
  const [hover, setHover] = React.useState(false);
  const [focus, setFocus] = React.useState(false);
  const [drag, setDrag] = React.useState(false);
  // Pointer x on the scale (0 … lastTick), and whether the handle follows it: from the first
  // move of a drag until release. A press alone glides the handle there instead.
  const [pointerX, setPointerX] = React.useState<number | null>(null);
  const [follow, setFollow] = React.useState(false);
  const shownX = follow && pointerX !== null ? pointerX : handleX;
  const lensX = drag ? shownX : hover && pointerX !== null ? pointerX : focus ? handleX : null;
  const lift = drag ? LIFT : hover ? HOVER_LIFT : LIFT;
  const lens = !reduced && lensX !== null;

  const commit = (next: number) => {
    const snapped = clamp(+(Math.round((next - min) / step) * step + min).toFixed(decimals), min, max);
    if (snapped === current) return;
    if (value === undefined) setInner(snapped);
    onValueChange?.(snapped);
  };

  // Pointer x on the scale, which runs from the first tick (x = 0) to the last whole tick.
  const scaleX = (e: React.PointerEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    const last = Math.floor((r.width - 1) / PITCH) * PITCH;
    return clamp(e.clientX - r.left - 0.5, 0, last);
  };
  const fromPointer = (x: number) => commit(min + (lastTick ? x / lastTick : 0) * (max - min));

  // One key press moves one tick, never less than one step.
  const tick = lastTick ? Math.max(step, (max - min) / (lastTick / PITCH)) : step;
  const keys: Record<string, number> = {
    ArrowRight: current + tick,
    ArrowUp: current + tick,
    ArrowLeft: current - tick,
    ArrowDown: current - tick,
    PageUp: current + tick * 10,
    PageDown: current - tick * 10,
    Home: min,
    End: max,
  };

  return (
    <div data-slot="range" className={cn("flex flex-col items-start gap-3", className)}>
      <div
        role="slider"
        tabIndex={0}
        aria-valuemin={min}
        aria-valuemax={max}
        aria-valuenow={current}
        aria-orientation="horizontal"
        aria-describedby={helper ? helperId : undefined}
        data-slot="track"
        ref={track}
        className={cn(
          // Keyboard focus marks the handle (below), not the whole track, and raises the lens.
          "relative h-4 cursor-pointer touch-none self-stretch outline-none",
        )}
        onPointerEnter={(e) => {
          // Touch has no hover: its lens appears on press.
          if (e.pointerType !== "touch") setHover(true);
          setPointerX(scaleX(e));
        }}
        onPointerLeave={() => {
          setHover(false);
          if (!drag) setPointerX(null);
        }}
        onFocus={() => setFocus(true)}
        onBlur={() => setFocus(false)}
        onPointerDown={(e) => {
          if (e.button !== 0) return;
          e.currentTarget.setPointerCapture(e.pointerId);
          const x = scaleX(e);
          setDrag(true);
          setPointerX(x);
          fromPointer(x);
        }}
        onPointerMove={(e) => {
          const x = scaleX(e);
          setPointerX(x);
          if (!e.currentTarget.hasPointerCapture(e.pointerId)) return;
          setFollow(true);
          fromPointer(x);
        }}
        onPointerUp={(e) => {
          setDrag(false);
          setFollow(false);
          if (e.pointerType === "touch") setPointerX(null);
        }}
        onPointerCancel={() => {
          setDrag(false);
          setFollow(false);
        }}
        onKeyDown={(e) => {
          const next = keys[e.key];
          if (next === undefined) return;
          e.preventDefault();
          commit(next);
        }}
        {...props}
      >
        {width === 0 ? (
          // First paint, before the width is known: the same row drawn as a gradient.
          <Ticks pitch={PITCH} on="var(--ds-color-border-default)" className="absolute inset-x-0 top-1 h-2" />
        ) : (
          <span data-slot="ticks" aria-hidden className="absolute inset-x-0 top-1 h-2">
            {Array.from({ length: lastTick / PITCH + 1 }, (_, i) => {
              // Distance in ticks from the lens centre, which moves continuously with the pointer.
              const d = lens ? Math.abs(i * PITCH - lensX!) / PITCH : Infinity;
              const up = d <= LENS + 1 ? ((1 + Math.cos((Math.PI * d) / (LENS + 1))) / 2) * lift : 0;
              return (
                <span
                  key={i}
                  className="absolute top-0 h-2 w-px origin-center bg-line transition-transform duration-fast ease-out"
                  style={{ left: i * PITCH, transform: up ? `scaleY(${1 + up})` : undefined }}
                />
              );
            })}
          </span>
        )}
        <svg
          data-slot="handle"
          width={3}
          height={16}
          viewBox="0 0 3 16"
          fill="none"
          aria-hidden
          // Following a drag it moves with no transition; otherwise it glides 150ms ease-out.
          className={cn(
            "absolute top-0 left-0 h-4 w-[3px] text-fg",
            "in-focus-visible:outline-solid in-focus-visible:outline-1 in-focus-visible:outline-offset-3 in-focus-visible:outline-line-strong",
            !reduced && !follow && "transition-transform duration-fast ease-out",
          )}
          // Snapped to the nearest tick, centred on its middle (0.5px in): the box is 3px wide, so 1.5px
          // comes off. Before the width is known, CSS round() does the same snap.
          style={
            width
              ? { transform: `translateX(${shownX - 1}px)` }
              : { left: `calc(round(nearest, round(down, 100% - 1px, ${PITCH}px) * ${share}, ${PITCH}px) - 1px)` }
          }
          preserveAspectRatio="none"
        >
          <path d="M1.5 0V16" stroke="currentColor" strokeWidth={1.5} vectorEffect="non-scaling-stroke" />
        </svg>
      </div>
      {helper && (
        <p id={helperId} data-slot="helper" className="m-0 font-sans text-caption leading-line-caption text-fg-secondary">
          {helper}
        </p>
      )}
    </div>
  );
}

```
