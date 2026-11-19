import * as React from "react";

import { CtaSection, type CtaSectionProps } from "@/components/blocks/cta-section";
import { FaqSection, type FaqSectionProps } from "@/components/blocks/faq-section";
import { FeatureGrid, type FeatureGridProps } from "@/components/blocks/feature-grid";
import { HeroSection, type HeroSectionProps } from "@/components/blocks/hero-section";
import { LogoStrip, type LogoStripProps } from "@/components/blocks/logo-strip";
import { SiteFooter, type SiteFooterProps } from "@/components/blocks/site-footer";
import { SiteHeader, type SiteHeaderProps } from "@/components/blocks/site-header";
import { TestimonialSection, type TestimonialSectionProps } from "@/components/blocks/testimonial-section";

// The home page, in the website's order: the hero, who builds on it, what it covers, one customer's words, questions,
// the closing card and the footer, all on one set of rails. Each section takes its own props; leave one out with null.

export type HomePageProps = {
  header?: SiteHeaderProps;
  hero?: HeroSectionProps;
  logos?: LogoStripProps | null;
  features?: FeatureGridProps | null;
  testimonial?: TestimonialSectionProps | null;
  faq?: FaqSectionProps | null;
  cta?: CtaSectionProps | null;
  footer?: SiteFooterProps;
};

export function HomePage({ header, hero, logos = {}, features = {}, testimonial = {}, faq = {}, cta = {}, footer }: HomePageProps) {
  return (
    <div data-slot="home-page" className="min-h-dvh bg-page font-sans text-fg">
      <SiteHeader {...header} />
      <main>
        <HeroSection {...hero} />
        {logos && <LogoStrip {...logos} />}
        {features && <FeatureGrid {...features} />}
        {testimonial && <TestimonialSection {...testimonial} />}
        {faq && <FaqSection {...faq} />}
        {cta && <CtaSection {...cta} />}
      </main>
      <SiteFooter {...footer} />
    </div>
  );
}
