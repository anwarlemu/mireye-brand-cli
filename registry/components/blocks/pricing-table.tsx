"use client";

import * as React from "react";

import { ArrowRightIcon } from "@/components/icons/arrow-right";
import { PageSection, type PageSectionProps } from "@/components/blocks/page-section";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Diamond } from "@/components/ui/diamond";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

// Plans side by side in cut frames: the name, who it is for, the price in the display size with its unit in DM Mono,
// the included usage, then what it includes as solid-node bullets. The plan most teams pick has a Forest line and the
// one Forest key; the others have outlined keys. One "Billed yearly" switch changes every monthly price at once (the
// number swaps in place, no roll). One column on a phone, two on a tablet, four on wide screens.

export type Plan = {
  name: string;
  description: string;
  /** Monthly price in dollars; null for a quoted price. */
  monthly: number | null;
  /** Monthly price when billed yearly. */
  yearly?: number | null;
  /** Shown instead of a number when the price is quoted. */
  quote?: string;
  usage: string;
  features: string[];
  cta: { label: string; href: string };
  featured?: boolean;
};

const PLANS: Plan[] = [
  { name: "Free", description: "For trying the API on a few places.", monthly: 0, yearly: 0, usage: "1,000 requests a month", features: ["Parcels, power, water and terrain", "Every value cited", "Community support"], cta: { label: "Start free", href: "#sign-up" } },
  { name: "Builder", description: "For one agent in production.", monthly: 49, yearly: 39, usage: "25,000 requests a month", features: ["Everything in Free", "Permits and zoning", "Batch requests", "Email support"], cta: { label: "Choose Builder", href: "#sign-up" } },
  { name: "Team", description: "For teams screening sites every day.", monthly: 399, yearly: 319, usage: "250,000 requests a month", features: ["Everything in Builder", "The site selection platform", "Saved searches and shortlists", "Five seats"], cta: { label: "Choose Team", href: "#sign-up" }, featured: true },
  { name: "Enterprise", description: "For custom coverage and contracts.", monthly: null, quote: "Custom", usage: "Volume pricing", features: ["Everything in Team", "Custom sources and fields", "SSO and audit log", "A named engineer"], cta: { label: "Talk to us", href: "#contact" } },
];

export type PricingTableProps = Omit<PageSectionProps, "children"> & {
  plans?: Plan[];
  /** Start on yearly billing. */
  defaultYearly?: boolean;
  /** A line under the plans, e.g. taxes or overage. */
  note?: React.ReactNode;
};

export function PricingTable({
  label = "Pricing",
  title = "Pay for the requests your agents make.",
  intro = "Every plan includes every source. Upgrade when you need more requests or the platform.",
  plans = PLANS,
  defaultYearly = true,
  note = "Prices in USD. Requests over the plan are billed at the plan rate; nothing stops your agent mid-run.",
  ...props
}: PricingTableProps) {
  const [yearly, setYearly] = React.useState(defaultYearly);
  return (
    <PageSection label={label} title={title} intro={intro} {...props}>
      <div className="mb-6 flex justify-end">
        <Switch checked={yearly} onCheckedChange={setYearly}>
          Billed yearly
        </Switch>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {plans.map((plan) => {
          const price = yearly ? (plan.yearly ?? plan.monthly) : plan.monthly;
          return (
            <Card key={plan.name} className={cn("h-full", plan.featured && "[--ds-shape-stroke:var(--ds-color-border-strong)]")}>
              <CardHeader>
                <CardTitle className="justify-between">
                  {plan.name}
                  {plan.featured && <Badge variant="inverse">Most teams</Badge>}
                </CardTitle>
                <CardDescription>{plan.description}</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-1">
                <p className="flex items-baseline gap-2">
                  <span className="text-display leading-display font-normal text-fg tabular-nums">{price == null ? plan.quote : `$${price}`}</span>
                  {price != null && <span className="font-mono text-caption text-fg-muted">/ mo</span>}
                </p>
                <p className="font-mono text-caption leading-tight text-fg-muted">{plan.usage}</p>
              </CardContent>
              <CardContent className="flex-1">
                <ul className="grid gap-2 border-t border-line-subtle pt-4">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2.5 text-body leading-body text-fg-secondary">
                      <Diamond size={9} className="mt-1.5 text-fg" />
                      {f}
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                <Button asChild variant={plan.featured ? "default" : "outline"} className="w-full">
                  <a href={plan.cta.href}>
                    {plan.cta.label}
                    {plan.featured && <ArrowRightIcon size={20} />}
                  </a>
                </Button>
              </CardFooter>
            </Card>
          );
        })}
      </div>
      {note != null && <p className="mt-6 text-caption leading-body text-fg-muted">{note}</p>}
    </PageSection>
  );
}
