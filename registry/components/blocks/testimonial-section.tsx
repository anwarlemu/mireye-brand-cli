import * as React from "react";

import { PageSection, type PageSectionProps } from "@/components/blocks/page-section";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

// One customer's words, set large: the quote in 24px regular Forest, the person under it (square initials, name, role
// and company), and beside it the figures the quote is about, in DM Mono over a muted label, split by Mist rules.
// The defaults are a fictional person at a placeholder company; a product passes a real, approved quote.

export type Figure = { value: string; label: string };

export type TestimonialSectionProps = Omit<PageSectionProps, "children" | "title" | "intro"> & {
  quote?: string;
  name?: string;
  role?: string;
  company?: string;
  initials?: string;
  figures?: Figure[];
};

const FIGURES: Figure[] = [
  { value: "212", label: "Sites screened in the first week" },
  { value: "9 of 9", label: "Requirements checked on every site" },
  { value: "3 days", label: "From buy box to shortlist" },
];

export function TestimonialSection({
  label = "Customer",
  quote = "We used to spend a week pulling county records for each site. Now our agent screens every parcel in a county overnight, and every answer links back to its source.",
  name = "Jordan Lee",
  role = "Head of site selection",
  company = "Acme Energy",
  initials = "JL",
  figures = FIGURES,
  ...props
}: TestimonialSectionProps) {
  return (
    <PageSection {...props}>
      <div className="grid gap-10 lg:grid-cols-3 lg:gap-12">
        <figure className="m-0 grid content-start gap-8 lg:col-span-2">
          {label != null && <p className="font-mono text-caption leading-tight text-fg-muted">{label}</p>}
          <blockquote className="m-0 text-h1 leading-heading font-normal text-balance text-fg">{quote}</blockquote>
          <figcaption className="flex items-center gap-3">
            <Avatar>
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
            <span className="grid gap-1">
              <span className="text-body leading-tight text-fg">{name}</span>
              <span className="text-caption leading-tight text-fg-muted">
                {role}, {company}
              </span>
            </span>
          </figcaption>
        </figure>
        <dl className="grid content-start border-t border-line-subtle">
          {figures.map((f) => (
            <div key={f.label} className="grid gap-2 border-b border-line-subtle py-5">
              <dt className="order-2 text-body leading-body text-fg-secondary">{f.label}</dt>
              <dd className="order-1 m-0 font-mono text-h2 leading-tight text-fg">{f.value}</dd>
            </div>
          ))}
        </dl>
      </div>
    </PageSection>
  );
}
