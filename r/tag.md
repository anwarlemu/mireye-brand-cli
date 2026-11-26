# Tag
A filled data tag for one site value ("345 kV", "41.2 ac", "Zone X"): Fog with the small cut corner.

Install: npx mireye-ds add tag
Requires: theme, utils
Packages: none
Exports: Tag
Client boundary: not required by this entry file
Reference: Figma "UI · Status and tags" (442:177): nodes 442:202 to 442:211


## Usage
Use for the values of a site in records, cards and lists. It is static text, not a control. Pass a width class to fix the width; the label stays left.
- Avoid: Tags as buttons or filters
- Avoid: Colored tags by category
- Avoid: A remove cross inside a tag


## Examples
Example components: npx mireye-ds add tag
[Preview](https://mireye-ds.agencidev.com/preview/tag/Preview) | [Values](https://mireye-ds.agencidev.com/preview/tag/Values)

examples/tag.tsx

```tsx
"use client";

import * as React from "react";
import { Tag } from "@/components/ui/tag";

// The data values of one site, nothing else. Every 1.6s the next site's values replace them: each tag fades up 4px,
// 40ms after the one before it.
const SITES = [
  ["345 kV", "42.7 ac", "Zone X", "I-2 Industrial"],
  ["230 kV", "61.0 ac", "Zone AE", "A-1 Agricultural"],
  ["115 kV", "38.4 ac", "Zone X", "C-3 Commercial"],
];

export function Preview() {
  const [i, setI] = React.useState(0);
  React.useEffect(() => {
    // ds-latency: the demo plays a run on a clock; no input waits on this timer.
    const id = window.setTimeout(() => setI((n) => (n + 1) % SITES.length), 1600);
    return () => window.clearTimeout(id);
  }, [i]);
  return (
    <div className="flex flex-wrap justify-center gap-2">
      {SITES[i].map((t, k) => (
        <Tag key={`${i}-${t}`} className="motion-safe:animate-[ds-rise_200ms_var(--ds-easing-out)_both]" style={{ animationDelay: `${k * 40}ms` }}>
          {t}
        </Tag>
      ))}
    </div>
  );
}

// Still: a parcel's values in a record row.
export function Values() {
  return (
    <div className="flex flex-wrap justify-center gap-2">
      <Tag>345 kV</Tag>
      <Tag>41.2 ac</Tag>
      <Tag>Zone X</Tag>
      <Tag>I-2 Industrial</Tag>
    </div>
  );
}

```

## Source

components/ui/tag.tsx

```tsx
import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * Tag: a filled data tag for a site value ("345 kV", "41.2 ac", "Zone X", "I-2 Industrial").
 * Source: Figma "UI · Status and tags" (442:177), nodes 442:202, 442:205, 442:208, 442:211.
 *
 * - 44px tall, Fog fill (#E6E8E4), 8px cut corner (`--ds-cut-sm`), no border, drawn by ds-cut.
 * - 20px Regular label, 16px from the left edge, centered on the row (Figma: cap box y = 15).
 * - Right padding: Figma sizes each tag by hand (20, 19, 18 and 20px after the Gilroy label), so
 *   Figma has no single value. With no width set, the tag uses 18px, the tightest of the four.
 *   Pass a width (`className="w-15"`) to reproduce a Figma frame exactly; the label stays left.
 * - Static text, not a control: it has no hover, focus or remove state in Figma.
 */
export function Tag({ className, children, ...props }: React.HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      data-slot="tag"
      className={cn(
        "inline-flex h-7 shrink-0 items-center pl-2.5 pr-2.5 whitespace-nowrap",
        "font-sans text-body font-normal text-fg",
        "ds-cut [--ds-cut:var(--ds-cut-sm)] [--ds-shape-fill:var(--ds-color-fog)]",
        className,
      )}
      {...props}
    >
      <span data-slot="label" className="ds-trim">
        {children}
      </span>
    </span>
  );
}

```
