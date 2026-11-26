"use client";

import * as React from "react";
import { Diamond } from "@/components/ui/diamond";

// Survey points: a solid node is confirmed, an outline is pending. Click a point to confirm or reopen it; the node
// changes at once, as a survey mark does.
const POINTS = ["North-west corner", "Substation tap", "Access road", "South-east corner"];

export function Preview() {
  const [done, setDone] = React.useState<Record<string, boolean>>({ "North-west corner": true });
  return (
    <ul className="mx-auto flex w-fit flex-col gap-1">
      {POINTS.map((p) => (
        <li key={p}>
          <button
            type="button"
            aria-pressed={!!done[p]}
            onClick={() => setDone((d) => ({ ...d, [p]: !d[p] }))}
            className="flex min-h-6 cursor-pointer items-center gap-2.5 text-body text-fg outline-none focus-visible:outline-solid focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-line-strong"
          >
            <Diamond size={12} variant={done[p] ? "solid" : "outline"} className={done[p] ? "text-fg" : "text-line"} />
            <span className="ds-trim">{p}</span>
          </button>
        </li>
      ))}
    </ul>
  );
}

// The sizes the system uses: a 7px bullet, a 9px map node, 10px status and result marks, 16px step markers.
export function Sizes() {
  return (
    <div className="flex items-center justify-center gap-6 text-fg">
      {[7, 9, 10, 12, 16].map((size) => (
        <span key={size} className="flex flex-col items-center gap-2">
          <Diamond size={size} />
          <Diamond size={size} variant="outline" />
          <span className="ds-trim text-caption text-fg-muted tabular-nums">{size}</span>
        </span>
      ))}
    </div>
  );
}
