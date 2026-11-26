# Steps
Survey nodes joined by a line: the stages of a run, done, current and pending.

Install: npx mireye-ds add steps
Requires: theme, utils, diamond
Packages: none
Exports: StepMarker, Steps
Client boundary: yes
Reference: Figma "UI · Progress" (442:213), row "Steps"


## Usage
Use for a fixed sequence of stages ("Parcel, Power, Water, Report"). Pass the labels and `current`, the stage in progress; `steps.length` means all done. Labels reach half their width past the row's ends, so leave room, or use `labelAlign="edges"`. When `current` moves on, the finished node stamps, the line travels and the next node lights on arrival.
- Avoid: Numbered circles
- Avoid: More than six stages
- Avoid: Clickable steps; this shows progress, not navigation


## Examples
Example components: npx mireye-ds add steps
[Preview](https://mireye-ds.agencidev.com/preview/steps/Preview) | [Edges](https://mireye-ds.agencidev.com/preview/steps/Edges)

examples/steps.tsx

```tsx
"use client";

import * as React from "react";
import { Steps } from "@/components/ui/steps";

// A site check, looping: each stage takes 700ms. The finished marker fills, the line travels to the next one and
// lights it on arrival. Report is done as soon as it is reached. The row holds, then starts a new run.
const STAGES = ["Parcel", "Power", "Water", "Report"];
const LAST = STAGES.length - 1;

export function Preview() {
  const [current, setCurrent] = React.useState(0);
  React.useEffect(() => {
    const done = current >= STAGES.length;
    const next = (c: number) => (c >= STAGES.length ? 0 : c === LAST - 1 ? STAGES.length : c + 1);
    // ds-latency: the demo plays a run on a clock; no input waits on this timer.
    const id = window.setTimeout(() => setCurrent(next), done ? 1600 : 700);
    return () => window.clearTimeout(id);
  }, [current]);
  return (
    <div className="mx-auto w-full max-w-100 px-12">
      <Steps steps={STAGES} current={current} aria-label="Site check" />
    </div>
  );
}

// Figma's layout, still: the first label left, the last right, so the row needs no outside room.
export function Edges() {
  return (
    <div className="mx-auto w-full max-w-100">
      <Steps steps={STAGES} current={2} labelAlign="edges" aria-label="Site check" />
    </div>
  );
}

```

## Source

components/ui/steps.tsx

```tsx
"use client";

import * as React from "react";
import { cn, svgBox, svgSize } from "@/lib/utils";
import { Diamond } from "@/components/ui/diamond";

// State changes fade over 200ms on Mireye's ease-out curve; color and opacity only.
const fade = "transition-[color,opacity] duration-200 ease-out";

/**
 * Steps: survey nodes joined by a line. Source: Figma "UI · Progress" (442:213), row "Steps":
 * markers 442:229, 442:232, 442:235 (+ "Current" 442:237), 442:240; lines 442:227, 442:228;
 * labels 442:231, 442:234, 442:239, 442:242.
 *
 * Sizes below are Figma's. The markers and the line through them keep Figma's geometry at the
 * product scale (0.6, through svgSize), so the line meets every marker at its center; the label
 * gap and box snap to the 4px grid (28px becomes 16px, the 160px box 96px).
 *
 * - Markers are 16px diamonds. Done: solid Forest. Current: Forest outline with a 6px solid
 *   diamond in the middle (5px in). Pending: Stone outline, Slate label.
 * - Outlined markers are filled with the canvas color, so the line behind stops at the node.
 *   The lines are painted first and the markers on top, as in Figma's layer order.
 * - The line runs from the first marker's center to the last one's, 8px down (1px tall). It is
 *   Forest up to the current marker's center and Stone after it.
 * - Markers are spread evenly and snapped to whole pixels, as Figma does: on the 656px row the
 *   gaps are 213.33px, so markers land at x = 0, 213, 427, 640 (`round()` in CSS).
 * - Labels are 22px, 28px below the marker, in a 160px box, each centered on its marker. The
 *   first and last labels reach half their width past the row's ends, so leave that room.
 *   Figma aligns the first label left and the last right to stay inside the row;
 *   `labelAlign="edges"` reproduces it (the specimen uses it).
 * - `current` is the index of the step in progress; `steps.length` means every step is done.
 * - Motion (29 Oct, second pass after Emil Kowalski's rules), one movement when `current` moves on:
 *   1. The stage just finished stamps its fill: the solid diamond grows from 60% to full inside
 *      the outline as it fades in, 200ms on the ease-out curve. Feedback comes first.
 *   2. The Forest line travels to the next marker in 280ms on a strong ease-in-out curve
 *      (0.77, 0, 0.175, 1), the curve for something moving across the screen. It is drawn full
 *      length and scaled from its left end (transform only, so it never relayouts).
 *   3. The next marker and its label light up when the line arrives (a 280ms delay); its dot
 *      breathes while that stage runs, as in AgentSteps. When `current` jumps to the end (the
 *      last stage is done as soon as it is reached), the last marker stamps its fill on arrival.
 *   Going back (a new run) is faster: the line retracts in 200ms ease-out and every marker
 *   resets together. Transitions, not keyframes, so a change mid-way retargets. Under
 *   reduced motion the line and markers change at once and the dot is still.
 */

// The line's travel forward, and the delay before the marker it reaches lights up.
const ARRIVE_MS = 280;

type StepStatus = "done" | "current" | "pending";

const STATUS_TEXT: Record<StepStatus, string | undefined> = {
  done: "done",
  current: undefined, // aria-current="step" already says it.
  pending: "not started",
};

const MARKER = 16;
// A Figma length at the product scale, for geometry that has to meet the markers exactly.
const fig = (px: number) => `calc(${px}px * var(--ds-scale, 0.6))`;

/**
 * Outlined diamond, drawn as a square turned 45°. The geometry is Diamond's `outline` variant
 * (a 1px stroke kept inside the box, Figma's M8 0.71 L15.29 8 …), but Chrome gives a rotated
 * <rect> exact edge coverage, while the same shape as a <path> loses about a quarter of the
 * 45° stroke (26 of 256 pixels off Figma's 442:235 render). Diamond is shared by other boards,
 * so this lives here; see the report for moving it into Diamond.
 */
/** The 16px diamond for one step. Exported for lists that show a single step's status. */
export function StepMarker({
  status,
  arriving = false,
  className,
  style,
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & {
  status: StepStatus;
  /** Done, but only once the line reaches it: the fill waits for --steps-arrive. */
  arriving?: boolean;
}) {
  return (
    <span data-slot="marker" data-status={status} className={cn("relative block shrink-0", svgBox, className)} style={svgSize(MARKER, MARKER, style)} {...props}>
      {/* Three layers that fade into each other: outline, done fill, current dot. */}
      {/* Inside Steps, a marker becoming current waits for the line (--steps-arrive). */}
      <Diamond
        size={MARKER}
        variant="outline"
        fill="var(--ds-color-bg-page)"
        className={cn("absolute inset-0", fade, status === "current" && "[transition-delay:var(--steps-arrive,0ms)]", status === "pending" ? "text-line" : "text-line-strong")}
      />
      {/* The done fill stamps in: from 60% to full size as it fades in. */}
      <Diamond
        size={MARKER}
        className={cn(
          "absolute inset-0 text-line-strong transition-[opacity,scale] duration-200 ease-(--ds-easing-out) motion-reduce:transition-none",
          status === "done" ? "scale-100 opacity-100" : "scale-60 opacity-0",
          arriving && "[transition-delay:var(--steps-arrive,0ms)]",
        )}
      />
      <Diamond
        size={6}
        data-slot={status === "current" ? "current" : undefined}
        className={cn(
          "absolute top-(--dot) left-(--dot) text-line-strong",
          "[--dot:calc(5px*var(--ds-scale,0.6))]",
          fade,
          status === "current" ? "opacity-100 [transition-delay:var(--steps-arrive,0ms)] motion-safe:animate-[ds-breathe_1.2s_ease-in-out_var(--steps-arrive,0ms)_infinite_alternate]" : "opacity-0",
        )}
      />
    </span>
  );
}

type StepsProps = Omit<React.HTMLAttributes<HTMLDivElement>, "children"> & {
  /** Step labels, in order. */
  steps: React.ReactNode[];
  /** Index of the step in progress. Steps before it are done; `steps.length` = all done. */
  current: number;
  /** "center" (default): every label centered on its marker. "edges": Figma's layout, first label left, last right. */
  labelAlign?: "center" | "edges";
};

export function Steps({ steps, current, labelAlign = "center", className, style, "aria-label": ariaLabel, ...props }: StepsProps) {
  const n = steps.length;
  // Forward or back, compared with the last value shown: forward travels and then lights the
  // next marker; back retracts fast and resets everything together.
  const shown = React.useRef(current);
  const prev = shown.current;
  const back = current < prev;
  React.useEffect(() => {
    shown.current = current;
  });
  const gaps = Math.max(1, n - 1);
  // Left edge of marker i: an even share of the width minus one marker, on a whole pixel.
  const x = (i: number) => `round(${i} * (100% - ${fig(MARKER)}) / ${gaps}, 1px)`;
  // Where the done line ends (the current marker's left edge), and its share of the whole line.
  const split = x(Math.min(Math.max(current, 0), n - 1));
  const share = Math.min(Math.max(current, 0), n - 1) / gaps;
  return (
    <div
      data-slot="steps"
      className={cn(
        // --ds-steps-split is a registered length (primitives.css), so the Stone line's start can
        // travel with the Forest line's end, on the same curve.
        "relative font-sans text-body font-normal motion-safe:transition-[--ds-steps-split] motion-safe:duration-(--steps-travel) motion-safe:ease-(--steps-ease)",
        className,
      )}
      style={
        {
          "--ds-steps-split": split,
          // Half a marker: where the line runs and where it starts and ends.
          "--half": fig(MARKER / 2),
          "--steps-travel": back ? "200ms" : `${ARRIVE_MS}ms`,
          "--steps-ease": back ? "var(--ds-easing-out)" : "cubic-bezier(0.77, 0, 0.175, 1)",
          "--steps-arrive": back ? "0ms" : `${ARRIVE_MS}ms`,
          ...style,
        } as React.CSSProperties
      }
      {...props}
    >
      {/* The Forest line is drawn full length and scaled from the left; the Stone line starts where
          it ends, as in Figma, and moves with it. */}
      <span data-slot="line-pending" aria-hidden className="absolute top-(--half) right-(--half) left-[calc(var(--ds-steps-split)+var(--half))] h-px bg-line" />
      <span
        data-slot="line-done"
        aria-hidden
        className="absolute top-(--half) right-(--half) left-(--half) h-px origin-left bg-line-strong motion-safe:transition-transform motion-safe:duration-(--steps-travel) motion-safe:ease-(--steps-ease)"
        style={{ transform: `scaleX(${share})` }}
      />
      {/* Every step shares one grid cell, so the row is as tall as its tallest step and each
          step is placed by its margin. `relative` paints the markers over the lines. */}
      <ol aria-label={ariaLabel} className="relative grid">
        {steps.map((step, i) => {
          const status: StepStatus = i < current ? "done" : i === current ? "current" : "pending";
          const align = labelAlign === "center" ? "center" : i === 0 ? "start" : i === n - 1 ? "end" : "center";
          return (
            <li
              key={i}
              data-slot="step"
              data-status={status}
              aria-current={status === "current" ? "step" : undefined}
              className={cn(
                "col-start-1 row-start-1 flex w-(--ds-svg-w) flex-col gap-4",
                align === "start" && "items-start",
                align === "center" && "items-center",
                align === "end" && "items-end",
              )}
              style={{ marginLeft: x(i), ...svgSize(MARKER) }}
            >
              {/* A marker ahead of the last one shown fills when the line reaches it, not before. */}
              <StepMarker status={status} arriving={!back && status === "done" && i > prev} />
              <span
                data-slot="label"
                className={cn(
                  "ds-trim w-24 shrink-0",
                  align === "start" && "text-left",
                  align === "center" && "text-center",
                  align === "end" && "text-right",
                  fade,
                  status === "current" && "[transition-delay:var(--steps-arrive)]",
                  status === "pending" ? "text-fg-subtle" : "text-fg",
                )}
              >
                {step}
              </span>
              {STATUS_TEXT[status] && <span className="sr-only">{STATUS_TEXT[status]}</span>}
            </li>
          );
        })}
      </ol>
    </div>
  );
}

```
