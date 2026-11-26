# List detail page
Saved sites in the app shell: a filterable list (name, parcel ID in DM Mono, fit bar) beside the chosen site's name, coordinates, status, tags, survey plate, cited fields with sources and the composer with the site chip.

Install: npx mireye-ds add list-detail-page
Requires: theme, app-shell, survey-plate, button, chat, cited-fields, fit-score, input, site-chip, sources, status, tag, utils
Packages: @phosphor-icons/react
Exports: SavedSite, ListDetailPageProps, ListDetailPage
Client boundary: yes
Reference: brand/reference product UI boards (Figma 442:2) and the library's product parts: Figma UI · Agent chat (443:433), cited-fields, sources, site-chip, fit-score, status, tag


## Usage
Use for any list of records with a detail view (sites, reports, searches). Pass `sites`, `defaultSelected` and `onAsk`. On a phone the list sits above the detail.
- Avoid: Opening the detail in a modal on wide screens
- Avoid: Values without their source
- Avoid: More than one Forest key


## Examples
Example components: npx mireye-ds add list-detail-page
[Preview](https://mireye-ds.agencidev.com/preview/list-detail-page/Preview)

examples/list-detail-page.tsx

```tsx
"use client";

import { ListDetailPage } from "@/components/blocks/list-detail-page";

// Embedded at 900px; in an app the shell fills the viewport.
export function Preview() {
  return <ListDetailPage className="h-225" />;
}

```

## Source

components/blocks/list-detail-page.tsx

```tsx
"use client";

import * as React from "react";
import { MagnifyingGlassIcon } from "@phosphor-icons/react/ssr";

import { AppShell, type AppShellProps } from "@/components/blocks/app-shell";
import { SurveyPlate } from "@/components/blocks/survey-plate";
import { Button } from "@/components/ui/button";
import { ChatInput } from "@/components/ui/chat";
import { CitedField, CitedFields } from "@/components/ui/cited-fields";
import { FitScore } from "@/components/ui/fit-score";
import { Input } from "@/components/ui/input";
import { SiteChip } from "@/components/ui/site-chip";
import { Source, SourceGroup, Sources } from "@/components/ui/sources";
import { Status, type StatusVariant } from "@/components/ui/status";
import { Tag } from "@/components/ui/tag";
import { cn } from "@/lib/utils";

// Saved sites as a list beside the chosen site, in the app shell. The list: a filter field, then rows (name, parcel ID
// in DM Mono, the fit bar); a row fills Fog under the pointer and Mist when chosen (150ms, color only). The detail: the
// site's name, coordinates and status pill, its tags, the survey plate, the cited fields with their sources, and the
// composer to ask about it with the site chip. On a phone the list sits above the detail.

export type SavedSite = {
  id: string;
  name: string;
  parcel: string;
  coordinates: string;
  fit: number;
  status: StatusVariant;
  tags: string[];
  fields: { label: string; value: string; source: number }[];
  sources: string[];
};

const SITES: SavedSite[] = [
  {
    id: "ellis-14",
    name: "Ellis County site 14",
    parcel: "042-117-09",
    coordinates: "32.4113, -96.8302",
    fit: 92,
    status: "verified",
    tags: ["212.6 ac", "138 kV", "Zone X", "I-2 Industrial"],
    fields: [
      { label: "Owner", value: "Acme Land LLC", source: 1 },
      { label: "Nearest substation", value: "0.8 mi, 138 kV", source: 2 },
      { label: "Flood zone", value: "Zone X", source: 3 },
      { label: "Slope", value: "2.8%", source: 4 },
    ],
    sources: ["Ellis County appraisal roll", "Transmission lines and substations", "FEMA flood hazard layer", "USGS elevation model"],
  },
  {
    id: "navarro-3",
    name: "Navarro County site 3",
    parcel: "175-020-41",
    coordinates: "32.0954, -96.4689",
    fit: 84,
    status: "verified",
    tags: ["318.0 ac", "345 kV", "Zone X", "Agricultural"],
    fields: [
      { label: "Owner", value: "Acme Holdings", source: 1 },
      { label: "Nearest substation", value: "2.1 mi, 345 kV", source: 2 },
      { label: "Flood zone", value: "Zone X", source: 3 },
      { label: "Slope", value: "1.9%", source: 4 },
    ],
    sources: ["Navarro County appraisal roll", "Transmission lines and substations", "FEMA flood hazard layer", "USGS elevation model"],
  },
  {
    id: "kaufman-8",
    name: "Kaufman County site 8",
    parcel: "129-334-02",
    coordinates: "32.5891, -96.3087",
    fit: 71,
    status: "processing",
    tags: ["164.3 ac", "69 kV", "Zone AE"],
    fields: [
      { label: "Owner", value: "Acme Farms", source: 1 },
      { label: "Nearest substation", value: "4.6 mi, 69 kV", source: 2 },
      { label: "Flood zone", value: "Zone AE", source: 3 },
      { label: "Slope", value: "3.4%", source: 4 },
    ],
    sources: ["Kaufman County appraisal roll", "Transmission lines and substations", "FEMA flood hazard layer", "USGS elevation model"],
  },
  {
    id: "ellis-22",
    name: "Ellis County site 22",
    parcel: "042-131-17",
    coordinates: "32.3620, -96.9011",
    fit: 63,
    status: "queued",
    tags: ["126.8 ac", "138 kV"],
    fields: [
      { label: "Owner", value: "Acme Trust", source: 1 },
      { label: "Nearest substation", value: "3.2 mi, 138 kV", source: 2 },
    ],
    sources: ["Ellis County appraisal roll", "Transmission lines and substations"],
  },
];

const ROW =
  "grid w-full cursor-pointer gap-2 border-b border-line-subtle px-4 py-3 text-left outline-none transition-colors duration-150 ease-out hover:bg-subtle focus-visible:outline-solid focus-visible:outline-1 focus-visible:-outline-offset-1 focus-visible:outline-line-strong aria-[current=true]:bg-subtle-hover motion-reduce:transition-none";

export type ListDetailPageProps = Omit<AppShellProps, "title" | "children"> & {
  sites?: SavedSite[];
  defaultSelected?: string;
  onAsk?: (site: SavedSite, question: string) => void;
};

export function ListDetailPage({ sites = SITES, defaultSelected, onAsk, ...shell }: ListDetailPageProps) {
  const [query, setQuery] = React.useState("");
  const [selected, setSelected] = React.useState(defaultSelected ?? sites[0]?.id);
  const [question, setQuestion] = React.useState("");
  const q = query.trim().toLowerCase();
  const shown = q ? sites.filter((s) => s.name.toLowerCase().includes(q) || s.parcel.includes(q)) : sites;
  const site = sites.find((s) => s.id === selected) ?? sites[0];
  return (
    <AppShell current="sites" title="Saved sites" meta={`${sites.length} sites`} actions={<Button size="sm" variant="outline">Export</Button>} contentClassName="lg:flex lg:overflow-hidden" {...shell}>
      <aside aria-label="Sites" className="flex shrink-0 flex-col border-b border-line lg:w-80 lg:border-r lg:border-b-0">
        <div className="relative border-b border-line-subtle p-3">
          <MagnifyingGlassIcon aria-hidden className="pointer-events-none absolute top-1/2 left-6 z-10 size-4 -translate-y-1/2 text-fg-subtle" />
          <Input type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Filter sites" aria-label="Filter sites" className="pl-9" />
        </div>
        <ul className="min-h-0 flex-1 overflow-y-auto fade-y max-lg:max-h-72">
          {shown.map((s) => (
            <li key={s.id}>
              <button type="button" aria-current={s.id === site?.id} onClick={() => setSelected(s.id)} className={ROW}>
                <span className="flex items-baseline justify-between gap-3">
                  <span className="truncate text-body text-fg">{s.name}</span>
                  <span className="shrink-0 font-mono text-caption text-fg-muted">{s.parcel}</span>
                </span>
                <FitScore value={s.fit} className="w-full" />
              </button>
            </li>
          ))}
          {!shown.length && <li className="px-4 py-6 text-body text-fg-muted">No site matches.</li>}
        </ul>
      </aside>
      {site && (
        <article aria-label={site.name} className="min-w-0 flex-1 lg:overflow-y-auto lg:fade-y">
          <div className="grid gap-6 p-4 sm:p-6">
            <header className="flex flex-wrap items-start justify-between gap-4">
              <div className="grid gap-1.5">
                <h2 className="text-h1 leading-heading font-normal text-fg">{site.name}</h2>
                <p className="font-mono text-caption text-fg-muted">
                  {site.parcel} · {site.coordinates}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Status variant={site.status} />
                <Button size="sm">Open report</Button>
              </div>
            </header>
            <div className="flex flex-wrap gap-2">
              {site.tags.map((t) => (
                <Tag key={t}>{t}</Tag>
              ))}
            </div>
            <SurveyPlate className="aspect-video w-full max-sm:aspect-4/3" caption={site.coordinates} marker={{ x: 47, y: 61, value: site.tags[0], coordinates: site.coordinates }} parcels={[{ x: 8, y: 14, w: 22, h: 26, state: "plain" }, { x: 34, y: 46, w: 26, h: 30, state: "selected", label: site.parcel }, { x: 66, y: 20, w: 20, h: 24, state: "hatched" }]} />
            <SourceGroup>
              <div className="grid gap-6 lg:grid-cols-2 lg:gap-8">
                <CitedFields>
                  {site.fields.map((f) => (
                    <CitedField key={f.label} label={f.label} source={f.source}>
                      {f.value}
                    </CitedField>
                  ))}
                </CitedFields>
                <Sources aria-label="Sources">
                  {site.sources.map((s, i) => (
                    <Source key={s} number={i + 1} cut={false}>
                      {s}
                    </Source>
                  ))}
                </Sources>
              </div>
            </SourceGroup>
            <ChatInput
              placeholder={`Ask about ${site.name}`}
              site={<SiteChip>{site.coordinates}</SiteChip>}
              submitDisabled={!question.trim()}
              textareaProps={{ value: question, onChange: (e) => setQuestion(e.target.value) }}
              onSubmit={(e) => {
                e.preventDefault();
                if (!question.trim()) return;
                onAsk?.(site, question.trim());
                setQuestion("");
              }}
              className={cn("w-full")}
            />
          </div>
        </article>
      )}
    </AppShell>
  );
}

```
