# Sources
The numbered sources behind an agent answer, and SourceRef, the Fog chip that points a cited value at one.

Install: npx mireye-ds add sources
Requires: theme, utils, diamond
Packages: none
Exports: SourceGroup, useSourceLink, Sources, Source, SourceRef
Client boundary: yes
Reference: Figma "UI · Agent chat" (443:433): rows 443:490 to 443:501, refs 443:473 to 443:487


## Usage
List sources with `Sources` and `Source number={n}`; cite inline with `SourceRef size="inline"`. Inside `SourceGroup`, pointing at or focusing a cited value marks every chip with that number in Forest and steps the other sources back. `cut={false}` draws the chip square for tables.
- Avoid: Footnote links in a new tab color
- Avoid: Sources without numbers
- Avoid: A fill on the row that is pointed at


## Examples
Example components: npx mireye-ds add sources
[Preview](https://mireye-ds.agencidev.com/preview/sources/Preview) | [Sidenotes](https://mireye-ds.agencidev.com/preview/sources/Sidenotes) | [Cards](https://mireye-ds.agencidev.com/preview/sources/Cards)

examples/sources.tsx

```tsx
"use client";

import { Sources, Source, SourceRef, SourceGroup, useSourceLink } from "@/components/ui/sources";

// An answer cites its sources by number, in three layouts to choose from (29 Oct). In each, point
// at a number in the text or at a source: every chip with that number turns Forest while the
// other sources step back (150ms). The list chips are the small size, at the answer's scale.
//   A · Footnotes: the sources as a compact list under a rule, like footnotes.
//   B · Sidenotes: the sources in a narrow column beside the answer, stacked under it on a phone.
//   C · Cards: each source as a card under the answer, with what kind of data it is.
const SOURCES = [
  { title: "FEMA flood hazard layer", kind: "Flood zones" },
  { title: "USGS 3DEP elevation model", kind: "Elevation and slope" },
  { title: "HIFLD electric substations", kind: "Grid" },
];
const focus = "cursor-default outline-none focus-visible:outline-solid focus-visible:outline-1 focus-visible:outline-offset-4 focus-visible:outline-line-strong";

function Answer() {
  const ref = (n: number) => <SourceRef number={n} size="inline" />;
  return (
    <p className="text-body text-fg">
      The parcel is in flood zone X{ref(1)}, sits at 412 ft with a 2.8% slope{ref(2)}, and the nearest substation is 1.8 miles away{ref(3)}.
    </p>
  );
}

function SourceList() {
  return (
    <Sources aria-label="Sources" className="gap-1.5">
      {SOURCES.map((s, i) => (
        <Source key={s.title} number={i + 1} size="sm" tabIndex={0} className={focus}>
          {s.title}
        </Source>
      ))}
    </Sources>
  );
}

export function Preview() {
  return (
    <SourceGroup>
      <div className="flex w-full max-w-90 flex-col gap-3.5">
        <Answer />
        <div className="border-t border-line-subtle pt-2.5">
          <SourceList />
        </div>
      </div>
    </SourceGroup>
  );
}

export function Sidenotes() {
  return (
    <SourceGroup>
      {/* Side by side when the container is 420px or wider; stacked below that. */}
      <div className="@container w-full max-w-114">
        <div className="flex flex-col gap-3.5 @[420px]:flex-row @[420px]:gap-5">
          <div className="min-w-0 flex-1">
            <Answer />
          </div>
          <div className="border-line-subtle @max-[420px]:border-t @max-[420px]:pt-2.5 @[420px]:w-51 @[420px]:shrink-0 @[420px]:border-l @[420px]:pl-3">
            <SourceList />
          </div>
        </div>
      </div>
    </SourceGroup>
  );
}

function SourceCard({ number, title, kind }: { number: number; title: string; kind: string }) {
  const { active, dimmed, handlers } = useSourceLink(number);
  return (
    <li
      tabIndex={0}
      {...handlers}
      className={[
        "flex min-w-0 flex-1 basis-27 flex-col gap-2 p-2",
        "ds-cut-frame [--ds-cut:0px] [--ds-shape-fill:var(--ds-color-bg-default)] before:transition-colors before:duration-150 before:ease-out",
        active ? "[--ds-shape-stroke:var(--ds-color-border-strong)]" : "[--ds-shape-stroke:var(--ds-color-border-subtle)]",
        focus,
      ].join(" ")}
    >
      <SourceRef number={number} size="sm" className="self-start" />
      <span className={`ds-trim text-caption transition-colors duration-150 ease-out ${dimmed ? "text-fg-secondary" : "text-fg"}`}>{title}</span>
      <span className="ds-trim text-caption text-fg-muted">{kind}</span>
    </li>
  );
}

export function Cards() {
  return (
    <SourceGroup>
      <div className="flex w-full max-w-96 flex-col gap-3.5">
        <Answer />
        <ul aria-label="Sources" role="list" className="flex flex-wrap gap-1">
          {SOURCES.map((s, i) => (
            <SourceCard key={s.title} number={i + 1} title={s.title} kind={s.kind} />
          ))}
        </ul>
      </div>
    </SourceGroup>
  );
}

```

## Source

components/ui/sources.tsx

```tsx
"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Diamond } from "@/components/ui/diamond";

/**
 * Sources: the numbered list of data sources behind an agent answer, and SourceRef, the marker
 * that points a cited value at one of them.
 * Source: Figma "UI · Agent chat" (443:433), list rows 443:490…443:501, refs 443:473…443:487;
 * the chip is from the later chat mock "Chat 16 F1, Cut-corner source".
 *
 * - The ref is a small Fog chip with the number centered in it and the small cut corner: 36px
 *   tall, 44px wide at least, 18px number. A list row is the chip, then the 20px title 16px
 *   after it, centered on the chip.
 * - `size="inline"` is the chip inside a sentence: 24px tall, 24px wide at least, its 6px
 *   cut corner and the number in the text's own size, sitting on the line like a footnote.
 * - `size="sm"` (29 Oct, for lists under an answer): the same 24px chip with the label's 18px
 *   number, so a source list reads at the answer's scale instead of the first board's 36px.
 * - `cut={false}` draws the chip as a plain rectangle, for tables where the cut corners
 *   would repeat down a column (CitedFields uses it).
 * - Rows are 16px apart; the first board spaces its marker rows 22px (`className="gap-3.5"`).
 * - `variant="marker"` keeps the first board's look (a 7px diamond and the number); the
 *   specimen uses it.
 * - Linking: inside `SourceGroup`, pointing at a cited value or a source marks every chip with
 *   that number. The chip turns Forest with a white number and the other source titles fade to
 *   Slate-80, over 150ms on the ease-out curve. Nothing gets a background, so no fill runs into
 *   the table's edges. Keyboard focus does the same.
 *
 * Sizes above are Figma's; here they are 0.6 of it on the 4px grid: the chip is 20px tall and 28px
 * wide at least with the 5px cut, the inline and small chips 16px with a 4px cut.
 *
 * The number is visible text, so screen readers hear "Source 1" through a visually hidden word.
 */
type Link = { active: number | string | null; setActive: (n: number | string | null) => void };
const LinkContext = React.createContext<Link | null>(null);

/** Links refs and sources by number: pointing at one marks the others with the same number. */
export function SourceGroup({ children }: { children: React.ReactNode }) {
  const [active, setActive] = React.useState<number | string | null>(null);
  return <LinkContext.Provider value={{ active, setActive }}>{children}</LinkContext.Provider>;
}

/** Hover and focus handlers that mark `number` while the pointer or focus is on the element. */
export function useSourceLink(number: number | string) {
  const link = React.useContext(LinkContext);
  const on = () => link?.setActive(number);
  const off = () => link?.setActive(null);
  return {
    active: link?.active === number,
    dimmed: link ? link.active !== null && link.active !== number : false,
    handlers: link ? { onPointerEnter: on, onPointerLeave: off, onFocus: on, onBlur: off } : {},
  };
}

export function Sources({ className, ...props }: React.OlHTMLAttributes<HTMLOListElement>) {
  // role="list": Safari drops list semantics from lists styled with list-style: none.
  return <ol role="list" data-slot="sources" className={cn("flex flex-col gap-2.5", className)} {...props} />;
}

export function Source({
  number,
  variant = "chip",
  className,
  children,
  cut,
  size = "default",
  ...props
}: React.LiHTMLAttributes<HTMLLIElement> & { number: number | string; variant?: "chip" | "marker"; cut?: boolean; size?: "default" | "sm" }) {
  const { dimmed, handlers } = useSourceLink(number);
  if (variant === "marker") {
    return (
      <li data-slot="source" className={cn("flex items-end font-sans text-body font-normal text-fg", className)} {...props}>
        <SourceRef number={number} variant="marker" className="w-6 gap-1" />
        <span data-slot="title" className="ds-trim">
          {children}
        </span>
      </li>
    );
  }
  return (
    <li data-slot="source" className={cn("flex items-center font-sans font-normal", size === "sm" ? "gap-1.5 text-caption" : "gap-2.5 text-body", className)} {...handlers} {...props}>
      <SourceRef number={number} cut={cut} size={size} />
      <span data-slot="title" className={cn("ds-trim transition-colors duration-150 ease-out", dimmed ? "text-fg-secondary" : "text-fg")}>
        {children}
      </span>
    </li>
  );
}

export function SourceRef({
  number,
  variant = "chip",
  size = "default",
  cut = true,
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & {
  number: number | string;
  variant?: "chip" | "marker";
  size?: "default" | "inline" | "sm";
  /** The cut corner. `false` draws a plain rectangle. */
  cut?: boolean;
}) {
  const { active, handlers } = useSourceLink(number);
  if (variant === "marker") {
    return (
      <span
        data-slot="source-ref"
        className={cn("flex shrink-0 items-end gap-1 font-sans text-caption font-normal text-fg whitespace-nowrap", className)}
        {...props}
      >
        <Diamond size={7} className="mb-0.5" />
        <span data-slot="number" className="ds-trim">
          <span className="sr-only">Source </span>
          {number}
        </span>
      </span>
    );
  }
  return (
    <span
      data-slot="source-ref"
      data-active={active || undefined}
      // A number in running text links on its own; in a list or a table the row does it.
      {...(size === "inline" ? handlers : {})}
      className={cn(
        "inline-flex shrink-0 items-center justify-center font-sans font-normal whitespace-nowrap tabular-nums transition-colors duration-150 ease-out",
        size === "inline"
          ? "mx-0.5 h-4 min-w-4 px-1 align-[-0.15em] [font-size:0.8em] [--ds-cut:var(--spacing)]"
          : size === "sm"
            ? "h-4 min-w-4 px-1 text-caption [--ds-cut:var(--spacing)]"
            : "h-5 min-w-7 px-2 text-caption [--ds-cut:var(--ds-cut-sm)]",
        active ? "text-fg-inverse" : "text-fg",
        // The cut chip fills its shape; the plain one fills its box.
        cut
          ? cn("ds-cut", active ? "[--ds-shape-fill:var(--ds-color-forest)]" : "[--ds-shape-fill:var(--ds-color-fog)]")
          : active
            ? "bg-forest"
            : "bg-fog",
        className,
      )}
      {...props}
    >
      <span data-slot="number" className="ds-trim">
        <span className="sr-only">Source </span>
        {number}
      </span>
    </span>
  );
}

```
