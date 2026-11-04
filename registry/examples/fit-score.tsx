"use client";

import * as React from "react";
import { FitScore } from "@/components/ui/fit-score";

// A screen running, then its score, then re-screens with new scores: the number rolls and the
// ticks count to it. The loop holds each score for 1.4s.
const SCORES = [92, 67, 57, 100];

function useScreen(scores: number[]) {
  const [i, setI] = React.useState(-1); // -1: screening
  React.useEffect(() => {
    // ds-latency: the demo plays a run on a clock; no input waits on this timer.
    const id = window.setTimeout(() => setI((n) => (n + 1) % scores.length), i < 0 ? 700 : 1400);
    return () => window.clearTimeout(id);
  }, [i, scores.length]);
  return i < 0 ? { loading: true, value: null } : { loading: false, value: scores[i] };
}

function Bar() {
  const s = useScreen(SCORES);
  return <FitScore value={s.value} loading={s.loading} className="w-30" />;
}

function Chip() {
  const s = useScreen(SCORES);
  return <FitScore variant="chip" value={s.value} loading={s.loading} />;
}

function Ring() {
  const s = useScreen([50, 72, 91]);
  return <FitScore variant="ring" value={s.value} loading={s.loading} coverage={{ screened: 15, total: 22 }} />;
}

// Live: a screen running, then scores that count in. Bar for tables, chip for cards, ring for the parcel record.
export function Preview() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-10">
      <Bar />
      <Chip />
      <Ring />
    </div>
  );
}

// A site that was never screened (every tick Mist, "Not screened") beside a score of 0 (every tick Stone, "Weak 0").
export function NotScreened() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-10">
      <FitScore value={null} className="w-30" />
      <FitScore value={0} className="w-30" />
      <FitScore variant="chip" value={null} />
      <FitScore variant="ring" value={null} coverage={{ screened: 0, total: 22 }} />
    </div>
  );
}
