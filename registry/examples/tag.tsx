"use client";

import * as React from "react";
import { Tag } from "@/components/ui/tag";

// The data values of one site, nothing else. Every 1.6s the next site's values replace them: each tag fades up 4px,
// 40ms after the one before it.
const SITES = [
  ["345 kV", "42.7 ac", "Zone X", "I-2 Industrial"],
  ["230 kV", "61.0 ac", "Zone AE", "A-1 Agricultural"],
  ["115 kV", "38.4 ac", "Zone X", "C-3 Commercial"],
];

export function Preview() {
  const [i, setI] = React.useState(0);
  React.useEffect(() => {
    // ds-latency: the demo plays a run on a clock; no input waits on this timer.
    const id = window.setTimeout(() => setI((n) => (n + 1) % SITES.length), 1600);
    return () => window.clearTimeout(id);
  }, [i]);
  return (
    <div className="flex flex-wrap justify-center gap-2">
      {SITES[i].map((t, k) => (
        <Tag key={`${i}-${t}`} className="motion-safe:animate-[ds-rise_200ms_var(--ds-easing-out)_both]" style={{ animationDelay: `${k * 40}ms` }}>
          {t}
        </Tag>
      ))}
    </div>
  );
}

// Still: a parcel's values in a record row.
export function Values() {
  return (
    <div className="flex flex-wrap justify-center gap-2">
      <Tag>345 kV</Tag>
      <Tag>41.2 ac</Tag>
      <Tag>Zone X</Tag>
      <Tag>I-2 Industrial</Tag>
    </div>
  );
}
