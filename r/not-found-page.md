# Not found page
The 404 page: the code in DM Mono, one line that says the page is off the map, the way home (the Forest key) and to the docs, beside an empty survey plate.

Install: npx mireye-ds add not-found-page
Requires: theme, icons, page-section, site-footer, site-header, survey-plate, button
Packages: none
Exports: NotFoundPageProps, NotFoundPage
Client boundary: not required by this entry file
Reference: Mireye website (mireye-website, read-only): not-found page and NotFoundScene (the survey scene)


## Usage
Use as the app's or site's not-found page. Pass `title`, `description` and `home`.
- Avoid: Jokes or illustrations off the brand
- Avoid: More than two actions
- Avoid: A search field as the only way out


## Examples
Example components: npx mireye-ds add not-found-page
[Preview](https://mireye-ds.agencidev.com/preview/not-found-page/Preview)

examples/not-found-page.tsx

```tsx
import { NotFoundPage } from "@/components/blocks/not-found-page";

export function Preview() {
  return <NotFoundPage />;
}

```

## Source

components/blocks/not-found-page.tsx

```tsx
import * as React from "react";

import { ArrowRightIcon } from "@/components/icons/arrow-right";
import { PageSection } from "@/components/blocks/page-section";
import { SiteFooter, type SiteFooterProps } from "@/components/blocks/site-footer";
import { SiteHeader, type SiteHeaderProps } from "@/components/blocks/site-header";
import { SurveyPlate } from "@/components/blocks/survey-plate";
import { Button } from "@/components/ui/button";

// The 404 page: the code in DM Mono, one line that says the page is not here, the way home (the Forest key) and to the
// docs, beside an empty survey plate: the grid, the contours and one outlined parcel with no marker.

export type NotFoundPageProps = { header?: SiteHeaderProps; title?: string; description?: string; home?: { label: string; href: string }; footer?: SiteFooterProps };

export function NotFoundPage({ header, title = "This page is off the map.", description = "The link may be old, or the page may have moved. Start again from the home page.", home = { label: "Back to home", href: "#" }, footer }: NotFoundPageProps) {
  return (
    <div data-slot="not-found-page" className="min-h-dvh bg-page font-sans text-fg">
      <SiteHeader {...header} />
      <main>
        <PageSection>
          <div className="grid gap-10 lg:grid-cols-2 lg:items-center lg:gap-12">
            <div className="grid content-start gap-5">
              <p className="font-mono text-caption leading-tight text-fg-muted">404 · Not found</p>
              <h1 className="text-display leading-display font-normal text-balance text-fg">{title}</h1>
              <p className="max-w-(--ds-layout-text) text-body-lg leading-body text-fg-secondary">{description}</p>
              <div className="flex flex-wrap items-center gap-3">
                <Button asChild>
                  <a href={home.href}>
                    {home.label}
                    <ArrowRightIcon size={20} />
                  </a>
                </Button>
                <Button asChild variant="outline">
                  <a href="#docs">Read the docs</a>
                </Button>
              </div>
            </div>
            <SurveyPlate className="aspect-4/3 w-full" marker={null} caption="No parcel at this address" scale={null} parcels={[{ x: 36, y: 30, w: 28, h: 40, state: "plain", label: "404" }]} />
          </div>
        </PageSection>
      </main>
      <SiteFooter {...footer} />
    </div>
  );
}

```
