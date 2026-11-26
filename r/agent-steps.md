# Agent steps
What the agent is doing: steps as nodes and labels, done, current or pending, with a live mode that reports as a run does.

Install: npx mireye-ds add agent-steps
Requires: theme, utils, diamond, use-loop-frame
Packages: none
Exports: AgentStepStatus, AgentStep, AgentSteps
Client boundary: yes
Reference: Figma "UI · Loaders, agent" (443:234): 443:327 to 443:383


## Usage
Use while an agent works. Give each step a `status` from the run, or `frame`. `live` shows steps as they start, shimmers the current label and draws a rail between nodes. `size="sm"` is the glyph for a tile. `running` loops a demo.
- Avoid: A spinner per step
- Avoid: Steps that slide in
- Avoid: Bold step labels


## Examples
Example components: npx mireye-ds add agent-steps
[Preview](https://mireye-ds.agencidev.com/preview/agent-steps/Preview) | [Statuses](https://mireye-ds.agencidev.com/preview/agent-steps/Statuses) | [Glyph](https://mireye-ds.agencidev.com/preview/agent-steps/Glyph)

examples/agent-steps.tsx

```tsx
import { AgentSteps } from "@/components/ui/agent-steps";

// The agent at work, as it reports: each step appears when it starts and its label shimmers while it runs; a finished
// step settles back. After the last step the list holds, then a new run starts. In a product, pass each step's
// `status` from the run instead of `running`.
export function Preview() {
  return (
    <div className="flex justify-center">
      <AgentSteps steps={[{ label: "Matching the parcel" }, { label: "Checking the flood zone" }, { label: "Sampling elevation" }]} running live />
    </div>
  );
}

// Figma's list: every step shown, with status from the run.
export function Statuses() {
  return (
    <div className="flex justify-center">
      <AgentSteps
        steps={[
          { label: "Matched the parcel", status: "done" },
          { label: "Checking the flood zone", status: "current" },
          { label: "Sample elevation", status: "pending" },
        ]}
      />
    </div>
  );
}

// The small glyph, for a 64px tile or a collapsed run.
export function Glyph() {
  return (
    <div className="flex justify-center">
      <AgentSteps size="sm" running />
    </div>
  );
}

```

## Source

components/ui/agent-steps.tsx

```tsx
"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Diamond } from "@/components/ui/diamond";
import { useLoopFrame } from "@/lib/use-loop-frame";

/**
 * AgentSteps: what the agent is doing, as steps that are done, current or pending.
 * Source: Figma "UI · Loaders, agent" (443:234).
 *
 * - `size="default"` (443:327 … 443:337): a 12px node, then the label 16px after it (20px
 *   Regular). Rows are 36px apart, top to top.
 *     done     solid Forest node, Forest label
 *     current  1px Forest outline with a 4px Forest node in the middle ("Current", 443:332)
 *     pending  1px Stone outline, Slate label
 * - `size="sm"` (443:339 … 443:383, 40×32): the same states as a glyph. 8px nodes, rows 12px
 *   apart. Each label becomes a 1px line from x = 14: Stone to the right edge for done and
 *   current, a 16px Mist line for pending. Current has no inner node at this size. Figma shows
 *   it in a 64px tile; the tile is presentation, not part of the glyph.
 * - Give each step a `status`, or set `frame`: steps before it are done, it is current, later
 *   ones are pending, and frame = steps.length means all done. The sm frames on the board are
 *   0, 1, 2, 3, 0.
 * - Motion. Figma gives no timing. The first version flipped a frame every 300ms with hard cuts,
 *   which read as flicker, not work (29 Oct). Now:
 *   - A step changes over 200ms on Mireye's ease-out curve, by color and opacity only: each node
 *     is three stacked layers (outline, done fill, current dot) that fade into each other, and
 *     the sm line grows from 16 to 26px. Nothing moves.
 *   - The current node's inner dot breathes (opacity, 1.2s each way) while the agent works on
 *     that step, the one sign of life on a still list.
 *   - `running` (a demo loop) gives each step 600ms (half a loader turn), holds "all done" for
 *     1.2s, then fades back to the first step. Slower read as stalling.
 *   Under reduced motion the steps hold `frame`, changes are color fades only and the dot is
 *   still.
 * - `live` (29 Oct, after Claude's agent view; second pass after Emil Kowalski's rules): the
 *   list shows progress the way a run reports it, one movement per step:
 *   1. The finished step stamps its node: the solid fill grows from 60% to full as it fades in
 *      (200ms, ease-out), and its label settles to 80% Forest. Feedback first.
 *   2. A 1px rail draws down from that node to the next in 280ms on the strong ease-in-out curve,
 *      scaled from the top (transform only).
 *   3. When the rail arrives, the next step appears in the space kept for it: it rises 4px and
 *      its 2px blur clears as it fades in (250ms, ease-out); its label shimmers while it runs.
 *      In the `running` demo loop the last step arrives already done, its node stamped as it
 *      appears, so the run ends without a running-then-done flip (30 Oct).
 *   A new run resets everything at once, fast (150ms). Nothing below ever moves. Without `live`
 *   the list is Figma's: every step shown, done steps in Forest, no rail.
 *
 * Product scale: the sizes above are Figma's. Nodes, the sm glyph and the rail keep Figma's
 * geometry at 0.6 (so the rail meets each node), while the rows snap to the grid: 13px labels,
 * 10px after the node, 14px between rows.
 *
 * Each row is as tall as its trimmed 20px label (14px with Gilroy, as in Figma), so long labels
 * can wrap without overlapping the next row.
 */

export type AgentStepStatus = "done" | "current" | "pending";
export type AgentStep = { label?: React.ReactNode; status?: AgentStepStatus };

// State changes fade over 200ms on Mireye's ease-out curve; color and opacity only.
const fade = "transition-[color,opacity] duration-200 ease-out";

const STATUS_TEXT: Record<AgentStepStatus, string> = { done: "Done", current: "In progress", pending: "Pending" };
const THREE: AgentStep[] = [{}, {}, {}];

export function AgentSteps({
  steps = THREE,
  size = "default",
  frame = 0,
  running = false,
  live = false,
  className,
  ...props
}: React.HTMLAttributes<HTMLElement> & {
  steps?: AgentStep[];
  size?: "default" | "sm";
  /** Index of the current step for steps without a `status`. */
  frame?: number;
  running?: boolean;
  /** Steps appear as they start, the current label shimmers and done steps recede. */
  live?: boolean;
}) {
  // Two extra ticks past the last step: the loop holds "all done". Live steps get 900ms, long
  // enough for one pass of the shimmer to read. A live loop lands its last step already done,
  // so it holds one tick less to keep the same 1.8s on "all done".
  const tick = useLoopFrame(frame, steps.length + (running && live ? 1 : 2), running, live ? 900 : 600);
  const current = Math.min(tick, steps.length);
  // In the live demo loop the last step arrives done: the run ends as its last step reports, so
  // it never shows as running and then flips (30 Oct).
  const landsDone = (i: number) => running && live && i === steps.length - 1 && i === current;
  // Forward or back, against the last value shown: forward waits for the rail, back resets at once.
  const shown = React.useRef(current);
  const back = current < shown.current;
  React.useEffect(() => {
    shown.current = current;
  });
  const statusOf = (step: AgentStep, i: number): AgentStepStatus =>
    step.status ?? (i < current || landsDone(i) ? "done" : i === current ? "current" : "pending");

  if (size === "sm") {
    return (
      <div
        role="status"
        data-slot="agent-steps"
        data-size="sm"
        className={cn("flex w-[calc(40px*var(--ds-scale,0.6))] shrink-0 flex-col gap-[calc(4px*var(--ds-scale,0.6))]", className)}
        {...props}
      >
        <span className="sr-only">Agent at work</span>
        {steps.map((step, i) => {
          const status = statusOf(step, i);
          return (
            <span key={i} data-slot="step" data-status={status} className="flex h-[calc(8px*var(--ds-scale,0.6))] items-start">
              <span className="relative size-[calc(8px*var(--ds-scale,0.6))] shrink-0">
                <Diamond
                  size={8}
                  variant="outline"
                  data-slot="marker"
                  className={cn("absolute inset-0", fade, status === "pending" ? "text-line" : "text-fg")}
                />
                <Diamond size={8} className={cn("absolute inset-0 text-fg", fade, status === "done" ? "opacity-100" : "opacity-0")} />
              </span>
              {/* The line's 1px stroke sits at y = 4–5 (Figma: y = 4.5), so it is not centered.
                  It is always 26px and scales to 16px when pending, so it grows instead of jumping. */}
              <span
                data-slot="line"
                className={cn(
                  "mt-[calc(4px*var(--ds-scale,0.6))] ml-[calc(6px*var(--ds-scale,0.6))] h-px w-[calc(26px*var(--ds-scale,0.6))] origin-left transition-[scale,background-color] duration-200 ease-out",
                  status === "pending" ? "scale-x-[calc(16/26)] bg-line-subtle" : "bg-line",
                )}
              />
            </span>
          );
        })}
      </div>
    );
  }

  return (
    <ol data-slot="agent-steps" data-size="default" className={cn("flex flex-col gap-3.5", className)} {...props}>
      {steps.map((step, i) => {
        const status = statusOf(step, i);
        const next = i + 1 < steps.length ? statusOf(steps[i + 1], i + 1) : null;
        return (
          <li
            key={i}
            data-slot="step"
            data-status={status}
            aria-current={status === "current" ? "step" : undefined}
            className={cn(
              "relative flex items-center gap-2.5 text-body font-normal whitespace-nowrap",
              live
                ? [
                    "transition-[color,opacity,translate,filter] ease-(--ds-easing-out) motion-reduce:transition-none",
                    status === "pending"
                      ? "translate-y-[4px] opacity-0 blur-[2px] duration-150"
                      : cn("translate-y-0 opacity-100 blur-none duration-250", !back && (status === "current" || landsDone(i)) && i > 0 && "[transition-delay:280ms]"),
                    status === "done" ? "text-fg-secondary" : "text-fg",
                  ]
                : [fade, status === "pending" ? "text-fg-subtle" : "text-fg"],
            )}
          >
            {live && next && (
              // The rail to the next node: Mist once the next step shows, Forest drawn down from
              // the top as this step finishes. It stops 2px short of each node.
              <>
                <span
                  aria-hidden
                  className={cn(
                    "absolute top-[calc(50%+8px*var(--ds-scale,0.6))] left-[calc(6px*var(--ds-scale,0.6)-0.5px)] h-[calc(100%+14px-16px*var(--ds-scale,0.6))] w-px bg-line-subtle transition-opacity duration-150 ease-out",
                    next === "pending" ? "opacity-0" : "opacity-100",
                  )}
                />
                <span
                  aria-hidden
                  className={cn(
                    "absolute top-[calc(50%+8px*var(--ds-scale,0.6))] left-[calc(6px*var(--ds-scale,0.6)-0.5px)] h-[calc(100%+14px-16px*var(--ds-scale,0.6))] w-px origin-top bg-line-strong",
                    back ? "duration-150 ease-out" : "duration-280 ease-[cubic-bezier(0.77,0,0.175,1)]",
                    "transition-transform motion-reduce:transition-none",
                    status === "done" ? "scale-y-100" : "scale-y-0",
                  )}
                />
              </>
            )}
            {/* Three layers that fade into each other: outline, done fill, current dot. */}
            <span data-slot="marker" className="relative size-[calc(12px*var(--ds-scale,0.6))] shrink-0">
              <Diamond size={12} variant="outline" className={cn("absolute inset-0", fade, status === "pending" ? "text-line" : "text-fg")} />
              <Diamond
                size={12}
                className={cn(
                  "absolute inset-0 text-fg",
                  live ? "transition-[opacity,scale] duration-200 ease-(--ds-easing-out) motion-reduce:transition-none" : fade,
                  // A last step that lands done stamps its node as it appears, after the rail.
                  !back && landsDone(i) && "[transition-delay:280ms]",
                  status === "done" ? "scale-100 opacity-100" : cn("opacity-0", live && "scale-60"),
                )}
              />
              <Diamond
                size={4}
                data-slot={status === "current" ? "current" : undefined}
                className={cn(
                  "absolute top-[calc(4px*var(--ds-scale,0.6))] left-[calc(4px*var(--ds-scale,0.6))] text-fg",
                  fade,
                  status === "current" ? "opacity-100 motion-safe:animate-[ds-breathe_1.2s_ease-in-out_infinite_alternate]" : "opacity-0",
                )}
              />
            </span>
            <span className="sr-only">{STATUS_TEXT[status]}: </span>
            <span data-slot="label" className="ds-trim">
              {live && status === "current" ? <span className="ds-shimmer">{step.label}</span> : step.label}
            </span>
          </li>
        );
      })}
    </ol>
  );
}

```
