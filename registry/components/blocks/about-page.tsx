import * as React from "react";

import { CtaSection, type CtaSectionProps } from "@/components/blocks/cta-section";
import { PageSection } from "@/components/blocks/page-section";
import { SiteFooter, type SiteFooterProps } from "@/components/blocks/site-footer";
import { SiteHeader, type SiteHeaderProps } from "@/components/blocks/site-header";
import { SurveyPlate } from "@/components/blocks/survey-plate";
import { Diamond } from "@/components/ui/diamond";

// The about page: the company's line as the page title, its story beside a survey plate, the figures in DM Mono, what
// the team believes as solid-node bullets, and the closing card pointing at careers. Copy is short and generic; a
// product passes its own.

export type AboutFigure = { value: string; label: string };
export type Belief = { title: string; description: string };

const FIGURES: AboutFigure[] = [
  { value: "600+", label: "Fields about a place" },
  { value: "50", label: "States covered" },
  { value: "1", label: "Request per answer" },
  { value: "100%", label: "Values with a source" },
];

const BELIEFS: Belief[] = [
  { title: "Show the source", description: "An answer without its record is a guess. Every value we return names where it came from." },
  { title: "Say what is missing", description: "When a county has not published a field, we say so instead of filling it in." },
  { title: "Stay plain", description: "One request, plain JSON, the words a site selector would use." },
];

export type AboutPageProps = {
  header?: SiteHeaderProps;
  title?: string;
  story?: string[];
  figures?: AboutFigure[];
  beliefs?: Belief[];
  cta?: CtaSectionProps | null;
  footer?: SiteFooterProps;
};

export function AboutPage({
  header,
  title = "We make the physical world legible to AI agents.",
  story = [
    "Every question about a place, who owns it, whether it floods, how far the power is, is answered somewhere in a county office, a utility map or a federal layer. Finding it takes days.",
    "We read those records, keep their sources and serve them in one request, so an agent can answer in seconds and show its work.",
  ],
  figures = FIGURES,
  beliefs = BELIEFS,
  cta = { label: "Careers", title: "Help us map the ground truth.", description: "We are hiring engineers who like maps, data and plain answers.", primary: { label: "See open roles", href: "#careers" }, secondary: { label: "Write to us", href: "#contact" } },
  footer,
}: AboutPageProps) {
  return (
    <div data-slot="about-page" className="min-h-dvh bg-page font-sans text-fg">
      <SiteHeader current="#about" {...header} />
      <main>
        <PageSection label="About" as="h1" title={title}>
          <div className="grid gap-10 lg:grid-cols-2 lg:items-start lg:gap-12">
            <div className="grid gap-4">
              {story.map((p) => (
                <p key={p} className="max-w-(--ds-layout-text) text-body-lg leading-relaxed text-fg-secondary">
                  {p}
                </p>
              ))}
            </div>
            <SurveyPlate className="aspect-4/3 w-full" caption="Any U.S. place" />
          </div>
        </PageSection>
        <PageSection space="compact">
          <dl className="grid grid-cols-2 border-t border-l border-line lg:grid-cols-4">
            {figures.map((f) => (
              <div key={f.label} className="grid gap-2 border-r border-b border-line p-5">
                <dt className="order-2 text-body leading-tight text-fg-secondary">{f.label}</dt>
                <dd className="order-1 m-0 font-mono text-h1 leading-tight text-fg">{f.value}</dd>
              </div>
            ))}
          </dl>
        </PageSection>
        <PageSection label="What we believe" title="Three rules we build by.">
          <ul className="grid gap-8 md:grid-cols-3">
            {beliefs.map((b) => (
              <li key={b.title} className="grid content-start gap-3 border-t border-line pt-5">
                <h3 className="flex items-center gap-2.5 text-h3 leading-heading font-normal text-fg">
                  <Diamond size={12} />
                  {b.title}
                </h3>
                <p className="text-body leading-body text-fg-secondary">{b.description}</p>
              </li>
            ))}
          </ul>
        </PageSection>
        {cta && <CtaSection {...cta} />}
      </main>
      <SiteFooter {...footer} />
    </div>
  );
}
