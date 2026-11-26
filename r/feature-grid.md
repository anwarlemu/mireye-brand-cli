# Feature grid
Features on a survey grid: cells share 1px Stone rules, each with a 20px glyph, a mono index, a 16px title, a muted line and a mono value.

Install: npx mireye-ds add feature-grid
Requires: theme, page-section, utils
Packages: @phosphor-icons/react
Exports: Feature, FeatureGridProps, FeatureGrid
Client boundary: not required by this entry file
Reference: Mireye website (mireye-website, read-only): feature-rows.css and coverage-grid (cells on 1px rules, mono labels)


## Usage
Use for three to six capabilities of equal weight. One column on a phone, two on a tablet, three on wide screens (`columns={2}` keeps two). Keep each description to one sentence and the value to a few mono words.
- Avoid: Cards with gaps instead of shared rules
- Avoid: Filled or coloured glyphs
- Avoid: Hover fills on cells that are not links
- Avoid: More than nine cells


## Examples
Example components: npx mireye-ds add feature-grid
[Preview](https://mireye-ds.agencidev.com/preview/feature-grid/Preview)

examples/feature-grid.tsx

```tsx
import { FeatureGrid } from "@/components/blocks/feature-grid";

export function Preview() {
  return <FeatureGrid closing />;
}

```

## Source

components/blocks/feature-grid.tsx

```tsx
import * as React from "react";
import { DropIcon, FileTextIcon, LightningIcon, MapTrifoldIcon, MountainsIcon, ShieldCheckIcon } from "@phosphor-icons/react/ssr";

import { PageSection, type PageSectionProps } from "@/components/blocks/page-section";
import { cn } from "@/lib/utils";

// Features on a survey grid: cells share 1px Stone rules, each with a mono index, a 20px glyph, a 16px regular title,
// a muted line and an optional mono value (a count, a unit). One column on a phone, two on a tablet, three on wide
// screens. Static: nothing fills or moves on hover, because the cells are not links.

export type Feature = { title: string; description: string; icon?: React.ReactNode; value?: string };

const FEATURES: Feature[] = [
  { title: "Parcels", description: "Boundaries, owners of record, acreage and zoning for any lot.", icon: <MapTrifoldIcon />, value: "Owner, zoning, acreage" },
  { title: "Power", description: "Substations, transmission lines and voltage within any distance.", icon: <LightningIcon />, value: "kV, distance, capacity" },
  { title: "Water", description: "Mains, wells, flood zones and the 100-year floodplain.", icon: <DropIcon />, value: "Zone, main, depth" },
  { title: "Terrain", description: "Elevation, slope and the profile across a site.", icon: <MountainsIcon />, value: "ft, %, profile" },
  { title: "Permits", description: "Filed and issued permits, with status and dates.", icon: <FileTextIcon />, value: "Status, type, date" },
  { title: "Sources", description: "Every value cites the record it came from, so an agent can check it.", icon: <ShieldCheckIcon />, value: "Cited, dated" },
];

export type FeatureGridProps = Omit<PageSectionProps, "children"> & { features?: Feature[]; columns?: 2 | 3 };

export function FeatureGrid({
  label = "Coverage",
  title = "Everything an agent needs to know about a place.",
  intro = "One request returns the facts for a parcel or a point, each with its source.",
  features = FEATURES,
  columns = 3,
  ...props
}: FeatureGridProps) {
  return (
    <PageSection label={label} title={title} intro={intro} {...props}>
      <ul className={cn("grid border-t border-l border-line sm:grid-cols-2", columns === 3 && "lg:grid-cols-3")}>
        {features.map((f, i) => (
          <li key={f.title} className="grid content-start gap-4 border-r border-b border-line p-5 sm:p-6">
            <div className="flex items-center justify-between gap-3">
              <span className="text-fg [&_svg]:size-5">{f.icon}</span>
              <span className="font-mono text-caption leading-none text-fg-muted">{String(i + 1).padStart(2, "0")}</span>
            </div>
            <div className="grid gap-2">
              <h3 className="text-h3 leading-heading font-normal text-fg">{f.title}</h3>
              <p className="text-body leading-body text-fg-secondary">{f.description}</p>
            </div>
            {f.value && <p className="font-mono text-caption leading-tight text-fg-muted">{f.value}</p>}
          </li>
        ))}
      </ul>
    </PageSection>
  );
}

```
