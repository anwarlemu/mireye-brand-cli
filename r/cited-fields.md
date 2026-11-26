# Cited fields
The values an agent answer reports, each with its label and source chip, between Mist rules.

Install: npx mireye-ds add cited-fields
Requires: theme, utils, sources
Packages: none
Exports: CitedFields, CitedField
Client boundary: yes
Reference: Figma "UI · Agent chat" (443:433): rows 443:471 to 443:487


## Usage
Use under an answer to show the values it read ("Flood zone, Zone X, 1"). Each `CitedField` takes a label, its value as children and a source number; put them in `CitedFields`, and both under a `SourceGroup` with the `Sources` list so pointing links them.
- Avoid: Values without a source
- Avoid: Fills on rows
- Avoid: More than one value per row


## Examples
Example components: npx mireye-ds add cited-fields sources
[Preview](https://mireye-ds.agencidev.com/preview/cited-fields/Preview)

examples/cited-fields.tsx

```tsx
import { CitedFields, CitedField } from "@/components/ui/cited-fields";
import { Sources, Source, SourceGroup } from "@/components/ui/sources";

// Every value points at its source. Point at or focus a row and its source chip turns Forest,
// with the matching source; the other sources step back. No row gets a fill.
const FIELDS = [
  { label: "Flood zone", value: "Zone X", source: 1 },
  { label: "Elevation", value: "412 ft", source: 2 },
  { label: "Slope", value: "2.8%", source: 3 },
];
const SOURCES = ["FEMA flood hazard layer", "USGS 3DEP elevation model", "Slope, from the elevation model"];
const focus = "cursor-default outline-none focus-visible:outline-solid focus-visible:outline-1 focus-visible:outline-offset-4 focus-visible:outline-line-strong";

export function Preview() {
  return (
    <SourceGroup>
      <div className="flex w-full max-w-102 flex-col gap-6">
        <CitedFields>
          {FIELDS.map((f) => (
            <CitedField key={f.label} label={f.label} source={f.source} tabIndex={0} className={focus}>
              {f.value}
            </CitedField>
          ))}
        </CitedFields>
        <Sources aria-label="Sources">
          {SOURCES.map((s, i) => (
            <Source key={s} number={i + 1} cut={false} tabIndex={0} className={focus}>
              {s}
            </Source>
          ))}
        </Sources>
      </div>
    </SourceGroup>
  );
}

```

## Source

components/ui/cited-fields.tsx

```tsx
"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { SourceRef, useSourceLink } from "@/components/ui/sources";

/**
 * Cited fields: the values an agent answer reports, each with the source it came from.
 * Source: Figma "UI · Agent chat" (443:433). Rules 443:470, 443:476, 443:482, 443:488; rows
 * "Flood zone" (443:471…443:475), "Elevation" (443:477…443:481), "Slope" (443:483…443:487).
 *
 * - 1px Mist rules above the first row and under every row; rows are 52px apart.
 * - Columns: 18px label (80% Forest) at 0, 20px value at 240px, source ref 22px from the right
 *   edge (Figma: x = 1000, 1240, 1658 in a 680px table).
 * - Label, value and ref number share a baseline 19px above the next rule (Figma: y = 297, rule
 *   at 316). With single-line text that is the bottom of each trimmed box, so the row aligns its
 *   cells to the end, with 19px of bottom padding in a row at least 51px tall (52px pitch minus
 *   the rule). That leaves Figma's 18px above the 14px value, and keeps the pitch whatever font
 *   renders the text. A value that wraps grows the row.
 * - The ref is the Fog source chip as a plain rectangle (no cut corner, so the column of chips
 *   stays quiet), right-aligned to the rules and centered on the row's text (the later chat
 *   mock, "Chat 16 F1"). Pair it with `<Source cut={false}>`. `refVariant="marker"` keeps the
 *   first board's diamond and number in a fixed 22px column; the specimen uses it.
 * - Inside a `SourceGroup`, pointing at or focusing a row marks its source chip and the matching
 *   source (see Sources). The row itself gets no fill.
 *
 * Product scale: the sizes above are Figma's. Here a row is 32px at least with 12px under the
 * baseline (a 33px pitch with the rule), the value column starts at 144px and the chip is 20px.
 *
 * Semantics: a <dl>. The rules are decorative elements between the rows, hidden from screen
 * readers, so the audit can measure each one as Figma draws it.
 */
export function CitedFields({ className, children, ...props }: React.HTMLAttributes<HTMLDListElement>) {
  return (
    <dl data-slot="cited-fields" className={cn("flex flex-col font-sans", className)} {...props}>
      <Rule />
      {React.Children.map(children, (child) =>
        child ? (
          <>
            {child}
            <Rule />
          </>
        ) : null,
      )}
    </dl>
  );
}

export function CitedField({
  label,
  source,
  refVariant = "chip",
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & {
  /** Field name, e.g. "Flood zone". */
  label: React.ReactNode;
  /** Number of the source in the Sources list. */
  source: number | string;
  /** "chip" (default) or the first board's "marker". */
  refVariant?: "chip" | "marker";
}) {
  const { handlers } = useSourceLink(source);
  const chip = refVariant === "chip";
  return (
    <div
      data-slot="cited-field"
      className={cn(
        "grid min-h-8 items-end pb-3",
        chip ? "grid-cols-[calc(var(--spacing)*36)_minmax(0,1fr)_auto]" : "grid-cols-[calc(var(--spacing)*36)_minmax(0,1fr)_calc(var(--spacing)*3.5)]",
        className,
      )}
      {...handlers}
      {...props}
    >
      {/* justify-self-start: label and value hug their text, like Figma's auto-width text
          layers, instead of stretching across the column. A long value still wraps at the
          column edge. */}
      <dt data-slot="label" className="ds-trim justify-self-start text-caption font-normal text-fg-secondary">
        {label}
      </dt>
      <dd data-slot="value" className="ds-trim justify-self-start text-body font-normal text-fg">
        {children}
      </dd>
      {/* The 20px chip is centered on the text's cap boxes: its bottom sits 6px under their baseline. */}
      <dd data-slot="ref" className={chip ? "-mb-1.5" : undefined}>
        <SourceRef number={source} variant={refVariant} cut={false} />
      </dd>
    </div>
  );
}

function Rule() {
  return <div data-slot="rule" aria-hidden className="h-px shrink-0 bg-line-subtle" />;
}

```
