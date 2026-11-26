# Status
A status pill: Verified, Loading or Queued, with a diamond or bars as its mark and the cut frame.

Install: npx mireye-ds add status
Requires: theme, utils, diamond
Packages: none
Exports: StatusVariant, Status, StatusMark
Client boundary: yes
Reference: Figma "UI · Status and tags" (442:177): Verified 442:187, Processing 442:192, Queued 442:197


## Usage
Use for the state of a site or a screen in a list. The pill keeps one width in every state, and changes swap the mark and word in place. Wrap it in your own `role="status"` when one status updates in place.
- Avoid: Colored status pills
- Avoid: A status that changes width
- Avoid: More than three states


## Examples
Example components: npx mireye-ds add status
[Preview](https://mireye-ds.agencidev.com/preview/status/Preview) | [Variants](https://mireye-ds.agencidev.com/preview/status/Variants)

examples/status.tsx

```tsx
"use client";

import * as React from "react";
import { Status, type StatusVariant } from "@/components/ui/status";

// One site's status: click the pill to screen the site. It goes from Queued to Loading, and to Verified 1.2s later;
// click again to queue it again. The pill keeps one width in every state; marks and words swap in place.
export function Preview() {
  const [variant, setVariant] = React.useState<StatusVariant>("queued");
  React.useEffect(() => {
    if (variant !== "processing") return;
    // ds-latency: the demo plays a run on a clock; no input waits on this timer.
    const id = window.setTimeout(() => setVariant("verified"), 1200);
    return () => window.clearTimeout(id);
  }, [variant]);
  const next = variant === "queued" ? "Screen this site" : variant === "verified" ? "Queue it again" : undefined;
  const word = variant === "processing" ? "Loading" : variant === "verified" ? "Verified" : "Queued";
  return (
    <div className="flex justify-center">
      <button
        type="button"
        aria-label={next ? `${word}. ${next}` : word}
        aria-disabled={variant === "processing" || undefined}
        onClick={() => setVariant((v) => (v === "queued" ? "processing" : v === "verified" ? "queued" : v))}
        className="group cursor-pointer outline-none aria-disabled:cursor-progress focus-visible:outline-solid focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-line-strong"
      >
        <Status
          variant={variant}
          className="after:transition-[background-color] after:duration-150 after:ease-out group-hover:group-not-aria-disabled:[--ds-shape-fill:var(--ds-color-fog)] group-active:after:duration-0 group-active:group-not-aria-disabled:[--ds-shape-fill:var(--ds-color-mist)]"
        />
      </button>
      {/* The change is announced outside the button, whose content is read as its name. */}
      <span role="status" className="sr-only">
        {word}
      </span>
    </div>
  );
}

// The three statuses, as Figma draws them.
export function Variants() {
  return (
    <div className="flex flex-wrap justify-center gap-3">
      <Status variant="verified" />
      <Status variant="processing" />
      <Status variant="queued" />
    </div>
  );
}

```

## Source

components/ui/status.tsx

```tsx
"use client";

import * as React from "react";
import { cn, svgBox, svgSize } from "@/lib/utils";
import { Diamond } from "@/components/ui/diamond";

/**
 * Status pill. Source: Figma "UI · Status and tags" (442:177): Verified (442:187, mark 442:189),
 * Loading (Figma's "Processing", 442:192, mark 442:194), Queued (442:197, mark 442:199).
 *
 * - 44px tall, 1px Stone border on white, 8px cut corner (`--ds-cut-sm`), drawn by ds-cut-frame.
 * - A 10px mark sits 18px from the left edge and the 20px Regular label starts 10px after it.
 *   Both are centered on the row (Figma: mark y = 17, label cap box y = 15).
 * - Marks: Verified is a solid diamond, Queued an outlined one (1px stroke kept inside the box,
 *   which is how the shared Diamond draws it), Loading three 1px bars at x = 1.5, 5 and 8.5.
 *   Figma's middle bar straddles a pixel edge and renders as two half-tone columns; the SVG keeps
 *   Figma's coordinates so the browser blends it the same way.
 * - Right padding: Figma sizes each pill by hand (23, 27 and 22px after the Gilroy label), so Figma
 *   has no single value. With no width set, the pill uses 22px, the tightest of the three. Pass a
 *   width (`className="w-19"`) to reproduce a Figma frame exactly; content stays left-aligned.
 * - Labels: Verified, Loading, Queued (Figma says "Processing"; Loading is the product word, 29
 *   Oct). With the default labels, the label slot reserves the widest of the three, so a pill
 *   keeps one width and its mark and text never move when the state changes.
 * - Motion (29 Oct): when the status changes, the old mark shrinks to 60% and fades as the new one
 *   grows from 60% in the same 10px slot, and the old word leaves 4px up while the new word rises
 *   4px into place out of a 2px blur, all in 200ms on the ease-out curve. The words share one
 *   reserved slot, so neither the mark nor the text moves sideways. Loading's word carries the
 *   shimmer, the system's sign of work in progress. CSS transitions, so a quick second change
 *   turns around mid-way; nothing moves on first render or under reduced motion.
 *
 * Not a live region: a list of statuses would announce every change. Wrap it in your own
 * `role="status"` element if a single status updates in place.
 */
const LABELS = { verified: "Verified", processing: "Loading", queued: "Queued" } as const;

export type StatusVariant = keyof typeof LABELS;

type StatusProps = React.HTMLAttributes<HTMLSpanElement> & {
  variant?: StatusVariant;
  /** Label text. Defaults to the Figma label for the variant. */
  children?: React.ReactNode;
};

export function Status({ className, variant = "verified", children, ...props }: StatusProps) {
  // The status shown before this one: its word leaves upward, the others wait below.
  const [seen, setSeen] = React.useState({ now: variant, before: variant });
  if (seen.now !== variant) setSeen({ now: variant, before: seen.now });
  const place = (v: StatusVariant) =>
    v === variant ? "opacity-100 translate-y-0 blur-none" : v === seen.before ? "opacity-0 -translate-y-[4px] blur-[2px]" : "opacity-0 translate-y-[4px] blur-[2px]";
  return (
    <span
      data-slot="status"
      data-variant={variant}
      className={cn(
        "inline-flex h-7 shrink-0 items-center gap-1.5 pl-2.5 pr-3.5 whitespace-nowrap",
        "font-sans text-body font-normal text-fg",
        "ds-cut-frame [--ds-cut:var(--ds-cut-sm)]",
        "[--ds-shape-stroke:var(--ds-color-border-default)] [--ds-shape-fill:var(--ds-color-bg-default)]",
        className,
      )}
      {...props}
    >
      {/* The three marks in one 10px slot: the current one at full size, the others at 60%. */}
      <span aria-hidden className="grid shrink-0 place-items-center">
        {(Object.keys(LABELS) as StatusVariant[]).map((v) => (
          <span
            key={v}
            className={cn(
              "[grid-area:1/1] transition-[opacity,scale] duration-200 ease-(--ds-easing-out) motion-reduce:transition-none",
              v === variant ? "scale-100 opacity-100" : "scale-60 opacity-0",
            )}
          >
            <StatusMark variant={v} marked={v === variant} />
          </span>
        ))}
      </span>
      {children !== undefined ? (
        <span data-slot="label" className="ds-trim">
          {children}
        </span>
      ) : (
        // Every default label in one grid cell; only the current one shows, so the slot is as
        // wide as the widest and the pill never changes size.
        <span className="grid">
          {Object.entries(LABELS).map(([v, text]) => (
            <span
              key={v}
              data-slot={v === variant ? "label" : undefined}
              aria-hidden={v === variant ? undefined : true}
              className={cn(
                "ds-trim [grid-area:1/1] transition-[opacity,translate,filter] duration-200 ease-(--ds-easing-out) motion-reduce:transition-none",
                place(v as StatusVariant),
              )}
            >
              {v === "processing" ? <span className="ds-shimmer">{text}</span> : text}
            </span>
          ))}
        </span>
      )}
    </span>
  );
}

/**
 * The 10px mark for each status. Colors follow the text color (Forest in Figma). `marked`
 * (default) tags it `data-slot="mark"`; Status leaves the tag off its hidden marks.
 */
export function StatusMark({ variant, marked = true }: { variant: StatusVariant; marked?: boolean }) {
  const slot = marked ? "mark" : undefined;
  if (variant === "processing") {
    return (
      <svg width={10} height={10} viewBox="0 0 10 10" fill="none" aria-hidden data-slot={slot} className={cn("block shrink-0", svgBox)} style={svgSize(10)}>
        <path d="M1.5 0V10M5 0V10M8.5 0V10" stroke="currentColor" vectorEffect="non-scaling-stroke" />
      </svg>
    );
  }
  return <Diamond size={10} variant={variant === "verified" ? "solid" : "outline"} data-slot={slot} />;
}

```
