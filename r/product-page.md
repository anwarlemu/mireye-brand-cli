# Product page
A product or features page: the hero with a cited answer as its picture, alternating feature rows that each show a real library part (a request, cited fields, the buy box checks), the field grid, questions and the closing card.

Install: npx mireye-ds add product-page
Requires: theme, cta-section, faq-section, feature-grid, hero-section, page-section, site-footer, site-header, cited-fields, code-block, requirement-checks, sources, utils
Packages: none
Exports: FeatureRow, ProductPageProps, ProductPage
Client boundary: not required by this entry file
Reference: Mireye website (mireye-website, read-only): ProductPages and FeatureRow (copy beside a product picture, alternating)


## Usage
Use for a product or feature page. Pass `rows` of label, title, description and a `visual` (a library item with sample data). Keep pictures to real parts, never screenshots.
- Avoid: Screenshots or stock photos as pictures
- Avoid: Rows without a picture
- Avoid: More than five rows


## Examples
Example components: npx mireye-ds add product-page
[Preview](https://mireye-ds.agencidev.com/preview/product-page/Preview)

examples/product-page.tsx

```tsx
"use client";

import { ProductPage } from "@/components/blocks/product-page";

export function Preview() {
  return <ProductPage />;
}

```

## Source

components/blocks/product-page.tsx

```tsx
import * as React from "react";

import { CtaSection, type CtaSectionProps } from "@/components/blocks/cta-section";
import { FaqSection, type FaqSectionProps } from "@/components/blocks/faq-section";
import { FeatureGrid, type FeatureGridProps } from "@/components/blocks/feature-grid";
import { HeroSection, type HeroSectionProps } from "@/components/blocks/hero-section";
import { PageSection } from "@/components/blocks/page-section";
import { SiteFooter, type SiteFooterProps } from "@/components/blocks/site-footer";
import { SiteHeader, type SiteHeaderProps } from "@/components/blocks/site-header";
import { CitedField, CitedFields } from "@/components/ui/cited-fields";
import { CodeBlock, CodeBlockContent, CodeBlockHeader, CodeBlockTitle } from "@/components/ui/code-block";
import { RequirementCheck, RequirementChecks } from "@/components/ui/requirement-checks";
import { Source, SourceGroup, Sources } from "@/components/ui/sources";
import { cn } from "@/lib/utils";

// A product or features page: the hero with the product's own answer as its picture, then feature rows (copy on one
// side, a real library part on the other, alternating on wide screens), the coverage grid, questions and the closing
// card. Every picture is a library item showing sample data, never a screenshot.

export type FeatureRow = { label: string; title: string; description: string; visual: React.ReactNode };

const REQUEST = `curl https://api.mireye.com/v1/place \\
  -H "Authorization: Bearer $MIREYE_KEY" \\
  -d '{ "point": [32.4113, -96.8302], "fields": ["flood_zone", "elevation", "slope"] }'`;

function AnswerCard() {
  return (
    <SourceGroup>
      <div className="ds-cut-frame grid gap-6 p-5 sm:p-6 [--ds-cut:var(--ds-cut-lg)] [--ds-shape-fill:var(--ds-color-bg-page)] [--ds-shape-stroke:var(--ds-color-border-default)]">
        <p className="font-mono text-caption text-fg-muted">042-117-09 · 32.4113, -96.8302</p>
        <CitedFields>
          <CitedField label="Flood zone" source={1}>
            Zone X
          </CitedField>
          <CitedField label="Elevation" source={2}>
            412 ft
          </CitedField>
          <CitedField label="Slope" source={3}>
            2.8%
          </CitedField>
        </CitedFields>
        <Sources aria-label="Sources">
          <Source number={1} cut={false}>
            FEMA flood hazard layer
          </Source>
          <Source number={2} cut={false}>
            USGS elevation model
          </Source>
          <Source number={3} cut={false}>
            Slope, from the elevation model
          </Source>
        </Sources>
      </div>
    </SourceGroup>
  );
}

const ROWS: FeatureRow[] = [
  {
    label: "One request",
    title: "Ask for a place, get its facts.",
    description: "Send a parcel, an address or a coordinate and the fields you need. The answer is plain JSON your agent can read.",
    visual: (
      <CodeBlock>
        <CodeBlockHeader>
          <CodeBlockTitle language="bash">request.sh</CodeBlockTitle>
        </CodeBlockHeader>
        <CodeBlockContent code={REQUEST} language="bash" lineNumbers={false} wrap />
      </CodeBlock>
    ),
  },
  {
    label: "Every value cited",
    title: "Your agent can check every answer.",
    description: "Each value names the record it came from and when it was read, so an answer can be traced and trusted.",
    visual: <AnswerCard />,
  },
  {
    label: "Screening",
    title: "Hold every parcel to your buy box.",
    description: "Describe the site you need once. Each parcel is checked against it, with the failing requirement called out.",
    visual: (
      <SourceGroup>
        <RequirementChecks title="Buy box" summary="4 of 5 pass" className="w-full">
          <RequirementCheck result="pass" field="Acreage" requirement="≥ 200 ac" value="212.6 ac" source={1} />
          <RequirementCheck result="pass" field="Voltage" requirement="≥ 138 kV" value="345 kV" source={2} />
          <RequirementCheck result="pass" field="Distance to line" requirement="≤ 5 mi" value="0.8 mi" source={2} />
          <RequirementCheck result="fail" field="Floodplain" requirement="Outside" value="Zone AE" source={3} />
          <RequirementCheck result="pass" field="Zoning" requirement="Industrial" value="I-2" source={1} />
        </RequirementChecks>
      </SourceGroup>
    ),
  },
];

export type ProductPageProps = {
  header?: SiteHeaderProps;
  hero?: HeroSectionProps;
  rows?: FeatureRow[];
  features?: FeatureGridProps | null;
  faq?: FaqSectionProps | null;
  cta?: CtaSectionProps | null;
  footer?: SiteFooterProps;
};

export function ProductPage({ header, hero, rows = ROWS, features = { label: "Fields", title: "What a request can return." }, faq = {}, cta = {}, footer }: ProductPageProps) {
  return (
    <div data-slot="product-page" className="min-h-dvh bg-page font-sans text-fg">
      <SiteHeader current="#product" {...header} />
      <main>
        <HeroSection notice={null} title="The place API for AI agents." description="Parcels, power, water, terrain, zoning and permits for any U.S. place, in one request, with a source on every value." meta={null} {...hero} />
        {rows.map((r, i) => (
          <PageSection key={r.title}>
            <div className="grid gap-8 lg:grid-cols-2 lg:items-center lg:gap-12">
              <div className={cn("grid content-start gap-3", i % 2 === 1 && "lg:order-2")}>
                <p className="font-mono text-caption leading-tight text-fg-muted">{r.label}</p>
                <h2 className="text-h1 leading-heading font-normal text-balance text-fg">{r.title}</h2>
                <p className="max-w-(--ds-layout-text) text-body-lg leading-body text-fg-secondary">{r.description}</p>
              </div>
              <div className="min-w-0">{r.visual}</div>
            </div>
          </PageSection>
        ))}
        {features && <FeatureGrid {...features} />}
        {faq && <FaqSection {...faq} />}
        {cta && <CtaSection {...cta} />}
      </main>
      <SiteFooter {...footer} />
    </div>
  );
}

```
