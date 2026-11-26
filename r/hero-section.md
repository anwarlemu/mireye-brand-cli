# Hero section
The website hero: a notice chip with a solid node, the display title, one line, the Forest key and an outlined key, a mono line, and the survey plate beside or under the copy.

Install: npx mireye-ds add hero-section
Requires: theme, icons, page-section, survey-plate, button, diamond, utils
Packages: none
Exports: HeroLink, HeroSectionProps, HeroSection
Client boundary: not required by this entry file
Reference: Mireye website (mireye-website, read-only): HomeHero (notice tag, one-line title, short line, header-sized actions)


## Usage
Use once at the top of a home or product page. `layout="split"` puts the copy beside the plate on wide screens; `center` stacks them. Pass `visual` to replace the plate (a product screen), or null for copy only. Keep the title to one sentence.
- Avoid: Two Forest keys
- Avoid: A title heavier than regular
- Avoid: Stock photos
- Avoid: Gradients or glows behind the title


## Examples
Example components: npx mireye-ds add hero-section
[Preview](https://mireye-ds.agencidev.com/preview/hero-section/Preview) | [Centered](https://mireye-ds.agencidev.com/preview/hero-section/Centered)

examples/hero-section.tsx

```tsx
import { HeroSection } from "@/components/blocks/hero-section";

export function Preview() {
  return <HeroSection />;
}

export function Centered() {
  return <HeroSection layout="center" notice={null} title="Ask anything about any U.S. place." description="Your agent asks in plain words; Mireye answers with cited values from county, utility and federal records." />;
}

```

## Source

components/blocks/hero-section.tsx

```tsx
import * as React from "react";

import { ArrowRightIcon } from "@/components/icons/arrow-right";
import { PageSection } from "@/components/blocks/page-section";
import { SurveyPlate } from "@/components/blocks/survey-plate";
import { Button } from "@/components/ui/button";
import { Diamond } from "@/components/ui/diamond";
import { cn } from "@/lib/utils";

// The website hero: a notice tag that links to what is new, the display title, one short line, the main action (the one
// Forest key on the screen) and a second, outlined, then the survey plate. `split` puts the copy beside the plate on
// wide screens; `center` stacks them. The notice is an outlined chip with a solid node; it steps to Fog under the
// pointer (150ms, color only). Nothing moves.

export type HeroLink = { label: string; href: string };

export type HeroSectionProps = {
  notice?: HeroLink | null;
  title?: React.ReactNode;
  description?: React.ReactNode;
  primary?: HeroLink | null;
  secondary?: HeroLink | null;
  /** The picture: the survey plate by default; pass null for a copy-only hero. */
  visual?: React.ReactNode;
  layout?: "split" | "center";
  /** A mono line under the actions, e.g. what the product covers. */
  meta?: React.ReactNode;
  className?: string;
};

export function HeroSection({
  notice = { label: "Permits data is available now", href: "#changelog" },
  title = "Physical world context for AI agents.",
  description = "One API for sourced facts about any U.S. place: parcels, power, water, terrain, zoning and permits.",
  primary = { label: "Get started", href: "#get-started" },
  secondary = { label: "Book a call", href: "#contact" },
  visual,
  layout = "split",
  meta = "600+ fields · any U.S. place · every value cited",
  className,
}: HeroSectionProps) {
  const picture = visual === undefined ? <SurveyPlate className={cn("w-full", layout === "split" ? "aspect-4/3" : "aspect-video max-sm:aspect-4/3")} /> : visual;
  const center = layout === "center";
  return (
    <PageSection className={className} contentClassName="py-12 sm:py-20">
      <div className={cn("grid gap-10 lg:gap-12", center ? "justify-items-center" : "lg:grid-cols-2 lg:items-center")}>
        <div className={cn("grid gap-6", center && "max-w-(--ds-layout-text) justify-items-center text-center")}>
          {notice && (
            <a
              href={notice.href}
              className="inline-flex h-7 w-fit items-center gap-2 border border-line bg-surface px-2.5 text-caption leading-none text-fg outline-none transition-colors duration-150 ease-out hover:bg-subtle focus-visible:outline-solid focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-line-strong motion-reduce:transition-none"
            >
              <Diamond size={12} />
              {notice.label}
              <ArrowRightIcon size={16} className="text-fg-muted" />
            </a>
          )}
          <h1 className="text-display leading-display font-normal text-balance text-fg">{title}</h1>
          {description != null && <p className="max-w-(--ds-layout-text) text-body-lg leading-body text-fg-secondary">{description}</p>}
          {(primary || secondary) && (
            <div className="flex flex-wrap items-center gap-3">
              {primary && (
                <Button asChild>
                  <a href={primary.href}>
                    {primary.label}
                    <ArrowRightIcon size={20} />
                  </a>
                </Button>
              )}
              {secondary && (
                <Button asChild variant="outline">
                  <a href={secondary.href}>{secondary.label}</a>
                </Button>
              )}
            </div>
          )}
          {meta != null && <p className="font-mono text-caption leading-tight text-fg-muted">{meta}</p>}
        </div>
        {picture && <div className="w-full min-w-0">{picture}</div>}
      </div>
    </PageSection>
  );
}

```
