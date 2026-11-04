"use client";

import * as React from "react";
import { AnimatedCounter } from "@/components/ui/animated-counter";
import { Ticks } from "@/components/ui/ticks";
import { usePrefersReducedMotion } from "@/lib/use-loop-frame";

// A screening run reporting its counts: every 0.9s the numbers climb, each counting through the
// values on the way, and a tick bar under each fills to its share of the count before it
// (screened of all parcels, near a line of screened, and so on). After the last step the run
// holds, then starts again.
const STEPS = [0.08, 0.24, 0.47, 0.73, 1];
const TOTAL = 2048;

/** Eases a share to its new value in 400ms, like the counter beside it. */
function useShare(target: number) {
  const reduced = usePrefersReducedMotion();
  const [shown, setShown] = React.useState(target);
  const from = React.useRef(target);
  React.useEffect(() => {
    const a = from.current;
    if (reduced || a === target) {
      from.current = target;
      setShown(target);
      return;
    }
    const start = performance.now();
    let raf = 0;
    const step = (now: number) => {
      const t = Math.min(1, (now - start) / 400);
      const v = a + (target - a) * (1 - (1 - t) ** 5);
      from.current = v;
      setShown(v);
      if (t < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [target, reduced]);
  return shown;
}

function Stat({ label, value, of }: { label: string; value: number; of: number }) {
  const share = useShare(of ? value / of : 0);
  return (
    <div className="flex flex-col gap-2">
      <dt className="ds-trim text-caption text-fg-secondary">{label}</dt>
      <dd className="flex flex-col gap-2">
        <span className="ds-trim text-h3 text-fg">
          <AnimatedCounter value={value} separator="," />
        </span>
        <Ticks pitch={6} value={share} on="var(--ds-color-border-strong)" off="var(--ds-color-border-default)" className="h-2 w-29" aria-hidden />
      </dd>
    </div>
  );
}

export function Preview() {
  const [i, setI] = React.useState(0);
  React.useEffect(() => {
    const last = i === STEPS.length - 1;
    // ds-latency: the demo plays a run on a clock; no input waits on this timer.
    const id = window.setTimeout(() => setI((n) => (n + 1) % STEPS.length), last ? 1800 : 900);
    return () => window.clearTimeout(id);
  }, [i]);
  const screened = Math.round(TOTAL * STEPS[i]);
  const nearLine = Math.round(screened * 0.24);
  return (
    <dl className="grid grid-cols-1 gap-x-9.5 gap-y-5 sm:grid-cols-3">
      <Stat label="Parcels screened" value={screened} of={TOTAL} />
      <Stat label="Within 2 mi of a 345 kV line" value={nearLine} of={screened} />
      <Stat label="Outside the floodplain" value={Math.round(nearLine * 0.76)} of={nearLine} />
    </dl>
  );
}

