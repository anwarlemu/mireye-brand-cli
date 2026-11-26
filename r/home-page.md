# Home page
The home page template: header, hero with the survey plate, logo strip, feature grid, testimonial, questions, the closing card and the footer, on one set of rails.

Install: npx mireye-ds add home-page
Requires: theme, cta-section, faq-section, feature-grid, hero-section, logo-strip, site-footer, site-header, testimonial-section
Packages: none
Exports: HomePageProps, HomePage
Client boundary: not required by this entry file
Reference: Mireye website (mireye-website, read-only): HomePage section order (hero, customers, numbers, coverage, platform, voices, closing)


## Usage
Start a marketing home page from it. Each section takes its own props (`hero`, `features`, `faq`...) and any optional section can be left out with null. Replace the sample copy; keep one Forest key per screen.
- Avoid: Sections off the rails
- Avoid: A second hero
- Avoid: Real customer names or quotes without permission


## Examples
Example components: npx mireye-ds add home-page
[Preview](https://mireye-ds.agencidev.com/preview/home-page/Preview)

examples/home-page.tsx

```tsx
"use client";

import { HomePage } from "@/components/blocks/home-page";

export function Preview() {
  return <HomePage />;
}

```

## Source

components/blocks/home-page.tsx

```tsx
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

```
