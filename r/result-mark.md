# Result mark
The mark and word for one requirement checked against a site: Pass, Fail, Unknown or Screening.

Install: npx mireye-ds add result-mark
Requires: theme, utils, diamond, status
Packages: none
Exports: CheckResult, RESULT_LABELS, ResultMark, ResultLabel
Client boundary: not required by this entry file
Reference: Not in Figma yet; built from existing marks (status 442:177, diamond)


## Usage
Use inside RequirementChecks and CompareMatrix, or wherever a single check shows. The mark shows how sure the reading is (a solid diamond is a reading, an outline is none, bars are a screen running); `ResultLabel` always says the outcome and reserves the widest word.
- Avoid: Green and red for pass and fail
- Avoid: A mark without its word
- Avoid: Check and cross icons


## Examples
Example components: npx mireye-ds add result-mark
[Preview](https://mireye-ds.agencidev.com/preview/result-mark/Preview)

examples/result-mark.tsx

```tsx
import { RESULT_LABELS, ResultLabel, ResultMark, type CheckResult } from "@/components/ui/result-mark";

// The four results of a requirement check: a solid diamond is a confirmed reading, an outline is no reading, three
// bars are a screen still running. The word always says the outcome.
const RESULTS = Object.keys(RESULT_LABELS) as CheckResult[];

export function Preview() {
  return (
    <ul className="mx-auto flex w-fit flex-col gap-3">
      {RESULTS.map((r) => (
        <li key={r} className="flex items-center gap-2 text-caption text-fg">
          <ResultMark result={r} />
          <ResultLabel result={r} />
        </li>
      ))}
    </ul>
  );
}

```

## Source

components/ui/result-mark.tsx

```tsx
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

```
