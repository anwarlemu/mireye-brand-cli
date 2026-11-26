# Requirement checks
A site checked against a buy box: one row per requirement with its result, rule, value, weight and source.

Install: npx mireye-ds add requirement-checks
Requires: theme, utils, result-mark, sources, empty-value, use-loop-frame
Packages: none
Exports: RequirementChecks, RequirementCheck
Client boundary: yes
Reference: Not in Figma yet; built from the product survey of the parcel record and existing marks


## Usage
Use on a parcel record. Put `RequirementCheck` rows (result, field, requirement, value, kind, source) inside `RequirementChecks` with a title and summary. A failed Must requirement fills its row Fog and says Fail in Medium. Rows still screening say Screening and land in place as results arrive. Narrow containers stack each row.
- Avoid: Red rows for failures
- Avoid: Hiding unknown readings; they say Unknown
- Avoid: Sorting by result; keep buy box order


## Examples
Example components: npx mireye-ds add requirement-checks sources animated-counter result-mark
[Preview](https://mireye-ds.agencidev.com/preview/requirement-checks/Preview) | [WithFailure](https://mireye-ds.agencidev.com/preview/requirement-checks/WithFailure)

examples/requirement-checks.tsx

```tsx
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

```

## Source

components/ui/requirement-checks.tsx

```tsx
"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { ResultLabel, ResultMark, type CheckResult } from "@/components/ui/result-mark";
import { SourceRef, useSourceLink } from "@/components/ui/sources";
import { EmptyValue, NO_SOURCE_RECORDED } from "@/lib/empty-value";
import { usePrefersReducedMotion } from "@/lib/use-loop-frame";

/**
 * RequirementChecks: one site checked against each requirement of a buy box (a saved set of site
 * requirements). Not in Figma yet (29 Oct); built from the Land platform's parcel record
 * (product survey) on CitedFields' rhythm, so the two read as one family.
 *
 * - Columns: result, field, requirement, this site's value, kind, source. Requirements are
 *   written operator, number, unit with non-breaking spaces ("≥ 138 kV"). Kind is "Must" or a
 *   weight ("60%", read as "Weight 60%"), its share of the fit score.
 * - Rows keep CitedFields' 52px pitch (31.6px at product scale, where the 1px rule stays 1px):
 *   18px above the text and 19px below it. Cells align to the top, so a field that wraps grows
 *   its row downward and its first line stays level with the rest of the row. The header row
 *   has the same rhythm. A Stone rule under the header, Mist rules between rows, no frame.
 * - Result: ResultMark and its word, in a fixed 140px column (each row is its own grid, so the
 *   header and the rows only line up with fixed or fractional tracks). The word slot reserves
 *   "Screening", so every field name starts at the same x whatever the result.
 * - A failed Must requirement fills its row Fog, the only meaning of the band, with a 2px Forest
 *   bar inside its left edge and "Fail" in Medium, so it never reads as a hovered row. Its source
 *   chips step to Mist so they still show on the band. Only a Must requirement can fail: a
 *   weighted one lowers the fit score instead, so it reads Pass with a value and Unknown
 *   without one.
 * - No value reads "Not screened" and makes the result Unknown, whatever `result` says; no
 *   source reads "No source recorded" (72% Forest).
 * - Inside a SourceGroup, pointing at or focusing a row marks its source chip, and every chip
 *   with the same number (SourceRef's own look, no row fill).
 * - In a container narrower than 576px each row stacks: result, field and kind; then the
 *   requirement and this site's value, each under its caption; then the source. Every stacked
 *   row keeps one height while a screen runs, so the page does not grow as results land.
 * - Motion: none on load (records open often). When a live result lands, the row settles in a
 *   40ms cascade, left to right, all on the ease-out curve: the diamond stamps in from 60% (200ms),
 *   the word takes over from "Screening" with a 2px blur (150ms), then the value (40ms later) and
 *   the source (80ms later) rise 4px out of a 2px blur (200ms). A failure lands louder, once:
 *   the band flashes Mist and settles to Fog (600ms) while the bar draws down its edge (250ms). `summary` can hold an AnimatedCounter. Under reduced motion everything swaps.
 * - A row that can take focus (`tabIndex`) shows the 1px Forest focus outline, 4px out.
 *
 * Semantics: native table elements with explicit roles, because the narrow layout changes the
 * cells' display.
 */

// The wide columns, shared by the header and the rows so every column lines up.
const COLS = "[grid-template-areas:'res_fld_req_val_knd_src'] grid-cols-[calc(var(--spacing)*21)_minmax(0,2.4fr)_minmax(0,1.9fr)_minmax(0,1.6fr)_calc(var(--spacing)*12)_minmax(0,2.7fr)]";
// 51 spacing units plus the 1px rule, which does not scale: CitedFields' pitch exactly. Top-aligned
// with 18 above and 19 below, so a wrapped field grows the row downward.
const PITCH = "@xl:min-h-[calc(var(--spacing)*8+1px)] @xl:items-start @xl:pt-2.5 @xl:pb-3";

const GRID = cn(
  "grid gap-x-3.5 px-2.5 [grid-template-areas:'res_fld_knd''._req_req''._val_val''._src_src'] grid-cols-[calc(var(--spacing)*21)_minmax(0,1fr)_auto] gap-y-2.5 py-3",
  "@xl:[grid-template-areas:'res_fld_req_val_knd_src'] @xl:grid-cols-[calc(var(--spacing)*21)_minmax(0,2.4fr)_minmax(0,1.9fr)_minmax(0,1.6fr)_calc(var(--spacing)*12)_minmax(0,2.7fr)] @xl:gap-y-0",
  PITCH,
);

type RequirementChecksProps = React.HTMLAttributes<HTMLDivElement> & {
  /** Heading above the list, e.g. "Buy box". It also names the table. */
  title?: React.ReactNode;
  /** Right of the title, e.g. "5 of 6 pass". */
  summary?: React.ReactNode;
};

export function RequirementChecks({ title, summary, className, children, "aria-label": ariaLabel, ...props }: RequirementChecksProps) {
  const titleId = React.useId();
  return (
    <div data-slot="requirement-checks" className={cn("@container flex flex-col gap-2.5 font-sans", className)} {...props}>
      {(title || summary) && (
        <div className="flex items-end justify-between gap-3.5 px-2.5">
          {title && (
            <span id={titleId} className="ds-trim text-body text-fg">
              {title}
            </span>
          )}
          {summary && <span className="ds-trim ml-auto text-caption text-fg-secondary tabular-nums">{summary}</span>}
        </div>
      )}
      <table role="table" aria-labelledby={title ? titleId : undefined} aria-label={title ? undefined : ariaLabel} className="flex flex-col">
        <thead role="rowgroup" className="block">
          {/* Visible in the wide layout only; the narrow one captions each value instead. */}
          <tr role="row" className={cn("grid gap-x-3.5 px-2.5", COLS, PITCH, "border-b border-line @max-xl:sr-only")}>
            <th role="columnheader" scope="col" className="font-normal [grid-area:res]">
              <span className="sr-only">Result</span>
            </th>
            {(
              [
                ["fld", "Field"],
                ["req", "Requirement"],
                ["val", "This site"],
                ["knd", "Kind"],
                ["src", "Source"],
              ] as const
            ).map(([area, text]) => (
              <th key={area} role="columnheader" scope="col" className="ds-trim text-left text-caption font-normal text-fg-secondary" style={{ gridArea: area }}>
                {text}
              </th>
            ))}
          </tr>
        </thead>
        <tbody role="rowgroup" className="flex flex-col @max-xl:border-t @max-xl:border-line">
          {children}
        </tbody>
      </table>
    </div>
  );
}

type RequirementCheckProps = Omit<React.HTMLAttributes<HTMLTableRowElement>, "children"> & {
  result: CheckResult;
  /** Field name, e.g. "Transmission voltage". */
  field: React.ReactNode;
  /** The rule, e.g. "≥ 138 kV" or "Lower is better". */
  requirement: React.ReactNode;
  /** The site's reading. Leave it out (or null) and the cell reads "Not screened". */
  value?: React.ReactNode | null;
  /** "must" (default) or a weight in percent. */
  kind?: "must" | number;
  /** SourceRef number. Leave it out and the cell reads "No source recorded". */
  source?: number | string;
  /** Short source title after the chip. */
  sourceTitle?: React.ReactNode;
};

export function RequirementCheck({ result, field, requirement, value, kind = "must", source, sourceTitle, className, ...props }: RequirementCheckProps) {
  const link = useSourceLink(source ?? "");
  // No reading is Unknown, whatever the result says; only a Must requirement can fail.
  const shown: CheckResult = result === "screening" ? result : value == null ? "unknown" : kind !== "must" && result === "fail" ? "pass" : result;
  const failed = shown === "fail";
  const waiting = shown === "screening";
  // A value fades in only when it arrives after a wait, never on first render.
  const mounted = React.useRef(false);
  React.useEffect(() => {
    mounted.current = true;
  }, []);
  const caption = "ds-trim text-caption text-fg-secondary @xl:hidden";
  // A failure that lands after the first render flashes the band once.
  const row = React.useRef<HTMLTableRowElement>(null);
  const reduced = usePrefersReducedMotion();
  const wasFailed = React.useRef(failed);
  React.useEffect(() => {
    if (failed && !wasFailed.current && mounted.current && !reduced)
      row.current?.animate([{ backgroundColor: "var(--ds-color-mist)" }, { backgroundColor: "var(--ds-color-fog)" }], { duration: 600, easing: "cubic-bezier(0.23, 1, 0.32, 1)" });
    wasFailed.current = failed;
  }, [failed, reduced]);
  // Parts that change after the first render arrive; on the first render they are simply there.
  const play = mounted.current;
  return (
    <tr
      ref={row}
      role="row"
      data-slot="requirement-check"
      data-result={shown}
      className={cn(
        GRID,
        "relative border-b border-line-subtle transition-colors duration-200 ease-out",
        // The bar inside the left edge, drawn from the middle when the failure lands.
        "before:absolute before:inset-y-0 before:left-0 before:w-[2px] before:bg-line-strong before:transition-transform before:duration-250 before:ease-(--ds-easing-out) motion-reduce:before:transition-none",
        failed ? "before:scale-y-100" : "before:scale-y-0",
        // On the Fog band the Fog source chip would vanish, so it steps to Mist there.
        failed && "bg-subtle [&_[data-slot=source-ref]:not([data-active])]:[--ds-shape-fill:var(--ds-color-mist)]",
        "cursor-default outline-none focus-visible:outline-solid focus-visible:outline-1 focus-visible:outline-offset-4 focus-visible:outline-line-strong",
        className,
      )}
      {...(source != null ? link.handlers : {})}
      {...props}
    >
      <td role="cell" className={cn("flex items-center gap-1.5 [grid-area:res] text-caption text-fg", failed && "font-medium")}>
        <Arrive key={`mark-${shown}`} play={play && !waiting} as="stamp" className="flex">
          <ResultMark result={shown} />
        </Arrive>
        <Arrive key={`word-${shown}`} play={play && !waiting} as="blur">
          <ResultLabel result={shown} />
        </Arrive>
      </td>
      <td role="cell" className="ds-trim [grid-area:fld] text-body text-fg">
        {field}
      </td>
      <td role="cell" className="flex flex-col gap-1.5 [grid-area:req] text-body text-fg-secondary tabular-nums">
        <span aria-hidden className={caption}>
          Requirement
        </span>
        <span className="ds-trim">{requirement}</span>
      </td>
      <td role="cell" className="flex flex-col gap-1.5 [grid-area:val] text-body text-fg tabular-nums">
        <span aria-hidden className={caption}>
          This site
        </span>
        <Arrive key={waiting ? "wait" : value == null ? "empty" : "value"} play={play && !waiting} delay={40} className="ds-trim">
          {/* A space while waiting keeps the line's height, so the row does not grow when the value lands. */}
          {waiting ? "\u00a0" : value == null ? <EmptyValue /> : value}
        </Arrive>
      </td>
      <td role="cell" className="ds-trim justify-self-end [grid-area:knd] text-caption text-fg-secondary tabular-nums @xl:justify-self-start">
        {kind === "must" ? (
          "Must"
        ) : (
          <>
            <span className="sr-only">Weight </span>
            {kind}%
          </>
        )}
      </td>
      {/* min-h-5 keeps the chip's height in the stacked layout, chip or not. */}
      <td role="cell" className="flex min-h-5 min-w-0 items-center gap-2.5 [grid-area:src] text-caption text-fg-secondary @xl:-my-1.5">
        {waiting ? null : source != null ? (
          <Arrive play={play} delay={80} className="flex min-w-0 items-center gap-2.5">
            <SourceRef number={source} />
            {/* Padding and an equal negative margin move the clip edge past the letters. */}
            {sourceTitle && <span className="ds-trim [margin-block:-0.3em] truncate [padding-block:0.3em]">{sourceTitle}</span>}
          </Arrive>
        ) : (
          <Arrive play={play} delay={80} className="ds-trim">
            <EmptyValue>{NO_SOURCE_RECORDED}</EmptyValue>
          </Arrive>
        )}
      </td>
    </tr>
  );
}

const ARRIVALS = {
  // A 4px rise out of a 2px blur: values and sources.
  rise: { frames: [{ opacity: 0, filter: "blur(2px)", transform: "translateY(4px)" }, { opacity: 1, filter: "blur(0px)", transform: "none" }], duration: 200 },
  // The diamond stamps in from 60%, never from nothing.
  stamp: { frames: [{ opacity: 0, transform: "scale(0.6)" }, { opacity: 1, transform: "none" }], duration: 200 },
  // A word taking over from another in the same place: the blur masks the swap.
  blur: { frames: [{ opacity: 0, filter: "blur(2px)" }, { opacity: 1, filter: "blur(0px)" }], duration: 150 },
};

/** A part that arrives in place when it mounts after the first render (`play`, read once). */
function Arrive({ play, as = "rise", delay = 0, className, children }: { play: boolean; as?: keyof typeof ARRIVALS; delay?: number; className?: string; children: React.ReactNode }) {
  const ref = React.useRef<HTMLSpanElement>(null);
  const reduced = usePrefersReducedMotion();
  React.useLayoutEffect(() => {
    if (!play || reduced) return;
    const a = ARRIVALS[as];
    ref.current?.animate(a.frames, { duration: a.duration, delay, easing: "cubic-bezier(0.23, 1, 0.32, 1)", fill: "backwards" });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return (
    <span ref={ref} className={className}>
      {children}
    </span>
  );
}

```
