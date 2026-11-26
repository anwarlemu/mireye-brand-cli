# Node loader
Three survey nodes that fill in turn: the inline and chat loader.

Install: npx mireye-ds add node-loader
Requires: theme, utils, diamond, use-loop-frame
Packages: none
Exports: NodeLoader
Client boundary: yes
Reference: Figma "UI · Loaders, agent" (443:234): Nodes 443:241 and 443:249 to 443:281


## Usage
Use while a short step runs: inline at its default size, or `size="sm"` before a waiting line in chat ("Reading the parcel's records"). It is a status named "Loading". `running={false}` holds one of Figma's five frames.
- Avoid: A loader with no words beside it in chat
- Avoid: Bouncing dots
- Avoid: Two loaders side by side


## Examples
Example components: npx mireye-ds add node-loader
[Preview](https://mireye-ds.agencidev.com/preview/node-loader/Preview) | [Frames](https://mireye-ds.agencidev.com/preview/node-loader/Frames)

examples/node-loader.tsx

```tsx
import { NodeLoader } from "@/components/ui/node-loader";

// Three survey nodes filling in turn: inline (Figma's 20px) and in a chat line (Figma's 8px).
export function Preview() {
  return (
    <div className="flex flex-col items-center gap-6">
      <NodeLoader />
      <p role="status" className="flex items-center gap-2 text-body text-fg-secondary">
        <NodeLoader size="sm" />
        <span className="ds-trim">Reading the parcel's records</span>
      </p>
    </div>
  );
}

// Figma's five frames, still.
export function Frames() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-6">
      {[0, 1, 2, 3, 4].map((f) => (
        <NodeLoader key={f} frame={f} running={false} />
      ))}
    </div>
  );
}

```

## Source

components/ui/node-loader.tsx

```tsx
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

```
