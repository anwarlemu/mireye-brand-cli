"use client";

import * as React from "react";
import { RequirementChecks, RequirementCheck } from "@/components/ui/requirement-checks";
import { SourceGroup } from "@/components/ui/sources";
import { AnimatedCounter } from "@/components/ui/animated-counter";
import type { CheckResult } from "@/components/ui/result-mark";

// FM 985 Property against its buy box, as on the Land platform's parcel record. The screen runs
// live: every row starts Screening and one resolves every 600ms; the count rolls with it.
// Point at a row to see where its value came from.
const ROWS: { field: string; requirement: string; result: CheckResult; value?: string; kind?: number; source?: number; sourceTitle?: string }[] = [
  { field: "Acreage", requirement: "≥ 200 ac", result: "pass", value: "410.1 ac", source: 1, sourceTitle: "Ellis County roll" },
  { field: "Transmission voltage", requirement: "≥ 138 kV", result: "pass", value: "345 kV", source: 2, sourceTitle: "Transmission lines" },
  { field: "Distance to transmission", requirement: "≤ 5 mi", result: "pass", value: "2.79 mi", source: 2, sourceTitle: "Transmission lines" },
  { field: "Inside FEMA floodplain", requirement: "No", result: "pass", value: "No", source: 3, sourceTitle: "FEMA floodplain" },
  { field: "Fiber reported", requirement: "Yes", result: "unknown" },
  { field: "Housing units within 1 km", requirement: "Lower is better", result: "pass", value: "9 homes", kind: 100, source: 4, sourceTitle: "Census blocks" },
];

/** How many rows have landed: one every 600ms, after a first wait. */
function useScreen(rows: number) {
  const [done, setDone] = React.useState(0);
  React.useEffect(() => {
    if (done >= rows) return;
    // ds-latency: the demo plays a run on a clock; no input waits on this timer.
    const id = window.setTimeout(() => setDone((d) => d + 1), 600);
    return () => window.clearTimeout(id);
  }, [done, rows]);
  return done;
}

export function Preview() {
  const done = useScreen(ROWS.length);
  const pass = ROWS.slice(0, done).filter((r) => r.result === "pass").length;
  return (
    <SourceGroup>
      <RequirementChecks
        className="w-full"
        title="Buy box"
        summary={
          <>
            <AnimatedCounter value={pass} /> of {ROWS.length} pass
          </>
        }
      >
        {ROWS.map((r, i) => (
          <RequirementCheck
            key={r.field}
            tabIndex={r.source != null ? 0 : undefined}
            result={i < done ? r.result : "screening"}
            field={r.field}
            requirement={r.requirement}
            value={r.value}
            kind={r.kind ?? "must"}
            source={r.source}
            sourceTitle={r.sourceTitle}
          />
        ))}
      </RequirementChecks>
    </SourceGroup>
  );
}

// Forreston Tract fails one Must requirement: when it lands, that row's Fog band fades in and it
// says "Fail".
const FORRESTON: typeof ROWS = [
  { field: "Acreage", requirement: "≥ 200 ac", result: "pass", value: "328.7 ac", source: 1, sourceTitle: "Ellis County roll" },
  { field: "Floodplain", requirement: "Outside", result: "fail", value: "Zone AE", source: 3, sourceTitle: "FEMA floodplain" },
  { field: "Distance to transmission", requirement: "≤ 5 mi", result: "pass", value: "0.24 mi", source: 2, sourceTitle: "Transmission lines" },
  { field: "Transmission voltage", requirement: "≥ 138 kV", result: "pass", value: "138 kV", source: 2, sourceTitle: "Transmission lines" },
  { field: "Fiber nearby", requirement: "Reported", result: "pass", value: "0.8 mi" },
];

export function WithFailure() {
  const done = useScreen(FORRESTON.length);
  const pass = FORRESTON.slice(0, done).filter((r) => r.result === "pass").length;
  return (
    <RequirementChecks
      className="w-full"
      title="Buy box"
      summary={
        <>
          <AnimatedCounter value={pass} /> of {FORRESTON.length} pass
        </>
      }
    >
      {FORRESTON.map((r, i) => (
        <RequirementCheck
          key={r.field}
          result={i < done ? r.result : "screening"}
          field={r.field}
          requirement={r.requirement}
          value={r.value}
          source={r.source}
          sourceTitle={r.sourceTitle}
        />
      ))}
    </RequirementChecks>
  );
}
