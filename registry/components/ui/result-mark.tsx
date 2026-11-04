import * as React from "react";
import { cn } from "@/lib/utils";
import { Diamond } from "@/components/ui/diamond";
import { StatusMark } from "@/components/ui/status";

/**
 * Result of one requirement checked against one site, shared by RequirementChecks and
 * CompareMatrix so the two never disagree. Not in Figma yet (29 Oct); built from the product
 * survey of the Land platform and from existing marks only.
 *
 * - The mark shows how sure the reading is, never the outcome alone: a solid 10px diamond is a
 *   confirmed reading (Pass, and Fail until the design gives Fail its own mark), an outlined diamond
 *   is no reading (Unknown), and Status's three bars are a screen still running (Screening).
 *   The outcome is always also a word, and a failed Must requirement also gets the Fog row band.
 * - Marks follow the text color, swap in one frame and are hidden from assistive tech.
 * - `ResultLabel` reserves the widest word ("Screening") in one grid cell, as Status does, so the
 *   text after it never moves when the result changes.
 */
export type CheckResult = "pass" | "fail" | "unknown" | "screening";

export const RESULT_LABELS: Record<CheckResult, string> = {
  pass: "Pass",
  fail: "Fail",
  unknown: "Unknown",
  screening: "Screening",
};

export function ResultMark({ result, className }: { result: CheckResult; className?: string }) {
  if (result === "screening") return <StatusMark variant="processing" />;
  return <Diamond size={10} variant={result === "unknown" ? "outline" : "solid"} data-slot="result-mark" data-result={result} className={className} />;
}

export function ResultLabel({ result, className }: { result: CheckResult; className?: string }) {
  return (
    <span className={cn("grid", className)}>
      {(Object.keys(RESULT_LABELS) as CheckResult[]).map((r) => (
        <span
          key={r}
          aria-hidden={r === result ? undefined : true}
          className={cn("ds-trim [grid-area:1/1] whitespace-nowrap", r !== result && "invisible")}
        >
          {r === "screening" && r === result ? <span className="ds-shimmer">{RESULT_LABELS[r]}</span> : RESULT_LABELS[r]}
        </span>
      ))}
    </span>
  );
}
