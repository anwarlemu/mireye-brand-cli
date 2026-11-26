# Pricing page
The pricing page template: the page title, the plans with one yearly switch, a ruled comparison table with values in DM Mono, billing questions and the closing card.

Install: npx mireye-ds add pricing-page
Requires: theme, cta-section, faq-section, page-section, pricing-table, site-footer, site-header, table
Packages: none
Exports: PricingRow, PricingPageProps, PricingPage
Client boundary: not required by this entry file
Reference: Mireye website (mireye-website, read-only): PricingPage, PricingPlans, PricingQuestions and pricing.css


## Usage
Use for /pricing. Pass `plans` (through PricingTable's props), `planNames` and `rows` for the comparison, and `faq` for billing questions.
- Avoid: More than one Forest key per plan row
- Avoid: Check icons in the table
- Avoid: Rolling prices


## Examples
Example components: npx mireye-ds add pricing-page
[Preview](https://mireye-ds.agencidev.com/preview/pricing-page/Preview)

examples/pricing-page.tsx

```tsx
"use client";

import { PricingPage } from "@/components/blocks/pricing-page";

export function Preview() {
  return <PricingPage />;
}

```

## Source

components/blocks/pricing-page.tsx

```tsx
import * as React from "react";

import { CtaSection, type CtaSectionProps } from "@/components/blocks/cta-section";
import { FaqSection, type FaqSectionProps } from "@/components/blocks/faq-section";
import { PageSection } from "@/components/blocks/page-section";
import { PricingTable, type PricingTableProps } from "@/components/blocks/pricing-table";
import { SiteFooter, type SiteFooterProps } from "@/components/blocks/site-footer";
import { SiteHeader, type SiteHeaderProps } from "@/components/blocks/site-header";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

// The pricing page: the page title, the plans, what every plan includes as a ruled table (values in DM Mono), the
// billing questions and the closing card.

export type PricingRow = { label: string; values: string[] };

const ROWS: PricingRow[] = [
  { label: "Requests a month", values: ["1,000", "25,000", "250,000", "Custom"] },
  { label: "Rate limit", values: ["2 / s", "20 / s", "100 / s", "Custom"] },
  { label: "Batch size", values: ["None", "100", "1,000", "Custom"] },
  { label: "Seats on the platform", values: ["None", "None", "5", "Unlimited"] },
  { label: "Support", values: ["Community", "Email", "Shared channel", "Named engineer"] },
];

export type PricingPageProps = {
  header?: SiteHeaderProps;
  title?: string;
  intro?: string;
  plans?: PricingTableProps;
  /** Column heads of the comparison table, in plan order. */
  planNames?: string[];
  rows?: PricingRow[] | null;
  faq?: FaqSectionProps | null;
  cta?: CtaSectionProps | null;
  footer?: SiteFooterProps;
};

export function PricingPage({
  header,
  title = "Pricing",
  intro = "Start free. Pay for the requests your agents make, and add the platform when your team screens sites every day.",
  plans,
  planNames = ["Free", "Builder", "Team", "Enterprise"],
  rows = ROWS,
  faq = { label: "Billing", title: "Billing questions." },
  cta = {},
  footer,
}: PricingPageProps) {
  return (
    <div data-slot="pricing-page" className="min-h-dvh bg-page font-sans text-fg">
      <SiteHeader current="#pricing" {...header} />
      <main>
        <PageSection as="h1" title={title} intro={intro} space="compact" />
        <PricingTable label={null} title={null} intro={null} {...plans} />
        {rows && (
          <PageSection label="Compare" title="What every plan includes.">
            <div className="overflow-x-auto fade-x">
              <Table className="min-w-160">
                <TableHeader>
                  <TableRow>
                    <TableHead>Plan</TableHead>
                    {planNames.map((n) => (
                      <TableHead key={n}>{n}</TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.map((r) => (
                    <TableRow key={r.label}>
                      <TableCell className="text-fg-secondary">{r.label}</TableCell>
                      {r.values.map((v, i) => (
                        <TableCell key={i} className="font-mono text-caption">
                          {v}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </PageSection>
        )}
        {faq && <FaqSection {...faq} />}
        {cta && <CtaSection {...cta} />}
      </main>
      <SiteFooter {...footer} />
    </div>
  );
}

```
