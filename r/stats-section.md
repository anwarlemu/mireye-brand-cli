# Stats section
Big calm numbers rail to rail: a mono unit, a large number and one line in each cell, columns parted by 1px Stone rules.

Install: npx mireye-ds add stats-section
Requires: theme, page-section, utils
Packages: none
Exports: Stat, StatsSectionProps, StatsSection
Client boundary: not required by this entry file
Reference: Mireye website (mireye-website, read-only): HomeNumbers and home-numbers.css (four numbers on the strip's columns)


## Usage
Use for two to four figures right after the hero or a logo strip. Every figure needs a source the page can show. Two columns on a phone, four on wide screens.
- Avoid: Counting animations
- Avoid: Figures without a source
- Avoid: Icons over the numbers
- Avoid: More than four cells


## Examples
Example components: npx mireye-ds add stats-section
[Preview](https://mireye-ds.agencidev.com/preview/stats-section/Preview) | [WithTitle](https://mireye-ds.agencidev.com/preview/stats-section/WithTitle)

examples/stats-section.tsx

```tsx
import { StatsSection } from "@/components/blocks/stats-section";

export function Preview() {
  return <StatsSection closing />;
}

export function WithTitle() {
  return <StatsSection closing label="Coverage" title="One request covers the country." stats={[{ value: "3,143", unit: "Counties", description: "Every county in the U.S." }, { value: "155M", unit: "Parcels", description: "With owners and lines." }]} />;
}

```

## Source

components/blocks/stats-section.tsx

```tsx
import * as React from "react";

import { PageSection, type PageSectionProps } from "@/components/blocks/page-section";
import { cn } from "@/lib/utils";

// Big calm numbers rail to rail, as on the website's home: each cell a mono unit over a large number and one line,
// columns parted by 1px Stone rules that run the section's full height, a hollow node where a column rule meets the
// section rules. Nothing moves.

export type Stat = { value: string; unit?: string; description?: string };

const STATS: Stat[] = [
  { value: "600+", unit: "Fields", description: "About any U.S. place." },
  { value: "50", unit: "States", description: "Every county covered." },
  { value: "1", unit: "Request", description: "Per answer, with sources." },
  { value: "100%", unit: "Cited", description: "Every value names its record." },
];

export type StatsSectionProps = Omit<PageSectionProps, "children"> & { stats?: Stat[] };

export function StatsSection({ stats = STATS, space = "none", ...props }: StatsSectionProps) {
  return (
    <PageSection space={space} {...props}>
      <dl data-slot="stats-section" className={cn("grid grid-cols-2 lg:grid-cols-4", props.title != null && "pt-16")}>
        {stats.map((s, i) => (
          <div key={`${s.value}-${i}`} className={cn("relative grid content-start gap-4 border-line py-10 pr-5 sm:pr-8", i % 2 === 1 && "border-l pl-5 sm:pl-8", i >= 2 && "border-t lg:border-t-0", i > 0 && "lg:border-l lg:pl-8")}>
            {s.unit != null && <dt className="font-mono text-caption leading-tight text-fg-muted">{s.unit}</dt>}
            <dd className="m-0 text-display leading-display font-normal text-fg">{s.value}</dd>
            {s.description != null && <dd className="m-0 max-w-60 text-body leading-body text-fg-secondary">{s.description}</dd>}
          </div>
        ))}
      </dl>
    </PageSection>
  );
}

```
