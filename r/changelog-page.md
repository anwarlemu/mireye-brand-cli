# Changelog page
The changelog: entries on a survey line (a solid node for a release, outlined for a fix), date and version in DM Mono, a title, a paragraph, Fog area tags and solid-node bullets.

Install: npx mireye-ds add changelog-page
Requires: theme, page-section, site-footer, site-header, badge, diamond
Packages: none
Exports: ChangelogEntry, ChangelogPageProps, ChangelogPage
Client boundary: not required by this entry file
Reference: Mireye website (mireye-website, read-only): resource pages; the survey line and nodes from the brand's steps


## Usage
Use for /changelog. Pass `entries`, newest first; mark fixes with `kind: "fix"`. Wrap code names in backticks.
- Avoid: Coloured version badges
- Avoid: Emoji or icons as markers
- Avoid: Animated reveals


## Examples
Example components: npx mireye-ds add changelog-page
[Preview](https://mireye-ds.agencidev.com/preview/changelog-page/Preview)

examples/changelog-page.tsx

```tsx
import { ChangelogPage } from "@/components/blocks/changelog-page";

export function Preview() {
  return <ChangelogPage />;
}

```

## Source

components/blocks/changelog-page.tsx

```tsx
import * as React from "react";

import { PageSection } from "@/components/blocks/page-section";
import { SiteFooter, type SiteFooterProps } from "@/components/blocks/site-footer";
import { SiteHeader, type SiteHeaderProps } from "@/components/blocks/site-header";
import { Badge } from "@/components/ui/badge";
import { Diamond } from "@/components/ui/diamond";

// The changelog: entries on a survey line. Each entry is a node on a 1px Stone line (solid for a release, outlined
// for a fix), the date and version in DM Mono, a 20px title, a short paragraph, its area as Fog tags and the changes
// as solid-node bullets. On a phone the date sits above the title and the line runs down the left edge.

export type ChangelogEntry = { date: string; version: string; title: string; description: string; tags: string[]; changes?: string[]; kind?: "release" | "fix" };

const ENTRIES: ChangelogEntry[] = [
  { date: "Nov 12, 2026", version: "v2.8", title: "Permits in every response", description: "Filed and issued permits now come back with any place request, each with its status and dates.", tags: ["API", "Permits"], changes: ["New `permits` field with status, type and dates", "Filter permits by type in batch requests", "Sources list the permit office and the date read"] },
  { date: "Oct 28, 2026", version: "v2.7", title: "Saved searches on the platform", description: "Save a buy box and run it again on new parcels as counties publish them.", tags: ["Platform"], changes: ["Save, rename and share a search", "A run reports what changed since the last one"] },
  { date: "Oct 14, 2026", version: "v2.6.1", title: "Slope on small parcels", description: "Slope is now sampled across the whole parcel on lots under one acre, instead of at the center.", tags: ["Data", "Fix"], kind: "fix" },
  { date: "Sep 30, 2026", version: "v2.6", title: "Batch requests", description: "Send up to 1,000 places in one request and read the answers as they finish.", tags: ["API"], changes: ["New batch endpoint", "Answers stream in order of completion"] },
];

export type ChangelogPageProps = { header?: SiteHeaderProps; title?: string; intro?: string; entries?: ChangelogEntry[]; footer?: SiteFooterProps };

export function ChangelogPage({ header, title = "Changelog", intro = "What changed in the API and the platform, newest first.", entries = ENTRIES, footer }: ChangelogPageProps) {
  return (
    <div data-slot="changelog-page" className="min-h-dvh bg-page font-sans text-fg">
      <SiteHeader current="#changelog" {...header} />
      <main>
        <PageSection as="h1" title={title} intro={intro}>
          <ol className="grid">
            {entries.map((e) => (
              <li key={e.version} className="relative grid gap-4 pb-12 pl-8 last:pb-0 md:grid-cols-4 md:gap-10 md:pl-0">
                {/* The survey line and its node: down the left edge on a phone, between the date and the entry on wider screens. */}
                <span aria-hidden className="absolute top-2 bottom-0 left-1 w-px bg-line md:left-1/4 md:-ml-2.5" />
                <span aria-hidden className="absolute top-1 left-1 -translate-x-1/2 md:left-1/4 md:-ml-2.5">
                  <Diamond size={14} variant={e.kind === "fix" ? "outline" : "solid"} fill="var(--ds-color-bg-page)" className="text-fg" />
                </span>
                <div className="grid content-start gap-1 font-mono text-caption leading-tight">
                  <time className="text-fg">{e.date}</time>
                  <span className="text-fg-muted">{e.version}</span>
                </div>
                <div className="grid content-start gap-4 md:col-span-3">
                  <h2 className="text-h2 leading-heading font-normal text-fg">{e.title}</h2>
                  <p className="max-w-(--ds-layout-text) text-body-lg leading-body text-fg-secondary">{e.description}</p>
                  <div className="flex flex-wrap gap-2">
                    {e.tags.map((t) => (
                      <Badge key={t}>{t}</Badge>
                    ))}
                  </div>
                  {e.changes && (
                    <ul className="grid gap-2 border-t border-line-subtle pt-4">
                      {e.changes.map((c) => (
                        <li key={c} className="flex items-start gap-2.5 text-body leading-body text-fg-secondary">
                          <Diamond size={9} className="mt-1.5 text-fg" />
                          {c.split("`").map((part, i) => (i % 2 ? <code key={i} className="bg-subtle px-1 font-mono text-caption text-fg">{part}</code> : part))}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </li>
            ))}
          </ol>
        </PageSection>
      </main>
      <SiteFooter {...footer} />
    </div>
  );
}

```
