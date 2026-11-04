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
