"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Diamond } from "@/components/ui/diamond";
import { useLoopFrame, usePrefersReducedMotion } from "@/lib/use-loop-frame";

/**
 * NodeLoader: three survey nodes that fill in turn. Source: Figma "UI · Loaders, agent"
 * (443:234), the "Nodes" frames.
 *
 * - `size="default"` (443:241, 84×20): 20px nodes, 12px apart. For inline use.
 * - `size="sm"` (443:249 … 443:281, 40×8): 8px nodes, 8px apart. For chat. Figma shows each
 *   frame centered in a 64px tile; the tile is presentation, not part of the loader.
 * - A filled node is solid Forest. An empty node is a 1px Stone outline kept inside the box
 *   (Diamond `outline`, the same path as Figma's).
 * - `frame` is one of Figma's five frames, in board order: ○○○, ●○○, ●●○, ●●●, ○●●. With
 *   `running` off (or under reduced motion) the loader holds that frame.
 * - Motion (29 Oct, second version: stepping through the frames read as jerky). Running, each
 *   node keeps its Stone outline and its fill lights up inside it, growing from half size while
 *   it fades in, then fading out: one 1s wave across the three nodes, 140ms apart, on an
 *   ease-in-out curve. CSS only (transform and opacity), so it stays smooth while the page works.
 */

const FRAMES = [
  [false, false, false],
  [true, false, false],
  [true, true, false],
  [true, true, true],
  [false, true, true],
] as const;

const SIZES = {
  default: { node: 20, gap: "gap-2" },
  sm: { node: 8, gap: "gap-1" },
} as const;


export function NodeLoader({
  size = "default",
  frame = 2,
  running = true,
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & {
  size?: keyof typeof SIZES;
  /** 0–4, Figma's frames. The inline example on the board (443:241) is frame 2. */
  frame?: number;
  running?: boolean;
}) {
  const s = SIZES[size];
  const reduced = usePrefersReducedMotion();
  const wave = running && !reduced;
  const current = useLoopFrame(frame, FRAMES.length, false, 240);
  const filled = FRAMES[((current % FRAMES.length) + FRAMES.length) % FRAMES.length];
  return (
    <span
      role="status"
      data-slot="node-loader"
      data-size={size}
      data-frame={current}
      className={cn("inline-flex shrink-0 items-center", s.gap, className)}
      {...props}
    >
      <span className="sr-only">Loading</span>
      {wave
        ? filled.map((_, i) => (
            <span key={i} data-slot="node" className="relative block shrink-0">
              <Diamond size={s.node} variant="outline" className="text-line" />
              <Diamond
                size={s.node}
                className="absolute inset-0 text-fg opacity-0 animate-[ds-node-wave_1s_cubic-bezier(0.45,0,0.55,1)_infinite_both]"
                style={{ animationDelay: `${i * 140}ms` }}
              />
            </span>
          ))
        : filled.map((on, i) => (
        <Diamond
          key={i}
          size={s.node}
          variant={on ? "solid" : "outline"}
          data-slot="node"
          data-state={on ? "filled" : "empty"}
          className={on ? "text-fg" : "text-line"}
        />
          ))}
    </span>
  );
}
