# Careers page
The careers page: the line as the title, why the work matters, how the team works as ruled rows with solid nodes, and the open roles as rows with a mono location.

Install: npx mireye-ds add careers-page
Requires: theme, icons, cta-section, page-section, site-footer, site-header, button, diamond
Packages: none
Exports: Role, Principle, CareersPageProps, CareersPage
Client boundary: not required by this entry file
Reference: Mireye website (mireye-website, read-only): careers page (ResourcePages CareersPage) and pages-company.css


## Usage
Use for /careers. Pass `roles` (title, team, location, href) and the team's own `principles` and `story`.
- Avoid: Team photos
- Avoid: Perks lists with emoji
- Avoid: A real person's name in the sample copy


## Examples
Example components: npx mireye-ds add careers-page
[Preview](https://mireye-ds.agencidev.com/preview/careers-page/Preview)

examples/careers-page.tsx

```tsx
import { CareersPage } from "@/components/blocks/careers-page";

export function Preview() {
  return <CareersPage />;
}

```

## Source

components/blocks/careers-page.tsx

```tsx
import * as React from "react";

import { ArrowRightIcon } from "@/components/icons/arrow-right";
import { CtaSection, type CtaSectionProps } from "@/components/blocks/cta-section";
import { PageSection } from "@/components/blocks/page-section";
import { SiteFooter, type SiteFooterProps } from "@/components/blocks/site-footer";
import { SiteHeader, type SiteHeaderProps } from "@/components/blocks/site-header";
import { Button } from "@/components/ui/button";
import { Diamond } from "@/components/ui/diamond";

// The careers page, as on the website: the line as the title with two actions, why the work matters beside its
// prose, how the team works as ruled rows, then the open roles as rows with a mono location and the way to apply.

export type Role = { title: string; team: string; location: string; href: string };
export type Principle = { title: string; description: string };

const ROLES: Role[] = [
  { title: "Data engineer, parcels", team: "Data", location: "Remote, U.S.", href: "#apply" },
  { title: "Product engineer, API", team: "Platform", location: "Remote, U.S.", href: "#apply" },
  { title: "Field researcher", team: "Coverage", location: "Remote, U.S.", href: "#apply" },
];

const PRINCIPLES: Principle[] = [
  { title: "Show the source", description: "Every value names its record, in the product and in how we argue." },
  { title: "Small and fast", description: "What you build reaches customers in days, and you own a large part of it." },
  { title: "Plain words", description: "We write for the person reading, not for the person writing." },
];

export type CareersPageProps = { header?: SiteHeaderProps; title?: string; intro?: string; story?: string[]; principles?: Principle[]; roles?: Role[]; cta?: CtaSectionProps | null; footer?: SiteFooterProps };

export function CareersPage({
  header,
  title = "Help us index the physical world.",
  intro = "We give AI agents, and the teams who build on land, an answer about any place in the U.S., with its source.",
  story = ["The next decade gets built in the real world: data centers, chargers, homes, the grid.", "Every one of those projects starts with the same questions, and the answers sit across thousands of agencies. We gather them into one source agents can call."],
  principles = PRINCIPLES,
  roles = ROLES,
  cta = { label: "Not listed?", title: "Write to us anyway.", description: "Tell us what you would build. We read every note.", primary: { label: "Write to us", href: "#contact" }, secondary: null },
  footer,
}: CareersPageProps) {
  return (
    <div data-slot="careers-page" className="min-h-dvh bg-page font-sans text-fg">
      <SiteHeader current="#careers" {...header} />
      <main>
        <PageSection label="Careers" as="h1" title={title} intro={intro} actions={<><Button asChild><a href="#roles">See open roles<ArrowRightIcon size={20} /></a></Button></>} />
        <PageSection title="Why this work.">
          <div className="grid gap-4 lg:ml-[50%] lg:pl-5">
            {story.map((p) => (
              <p key={p} className="max-w-(--ds-layout-text) text-body-lg leading-relaxed text-fg-secondary">{p}</p>
            ))}
          </div>
        </PageSection>
        <PageSection title="How we work.">
          <dl className="grid">
            {principles.map((p) => (
              <div key={p.title} className="grid gap-2 border-t border-line py-5 md:grid-cols-2 md:gap-10">
                <dt className="flex items-center gap-2.5 text-h3 leading-heading text-fg"><Diamond size={12} />{p.title}</dt>
                <dd className="m-0 text-body leading-body text-fg-secondary">{p.description}</dd>
              </div>
            ))}
          </dl>
        </PageSection>
        <PageSection id="roles" label="Open roles" title={`${roles.length} roles.`}>
          <ul className="grid">
            {roles.map((r) => (
              <li key={r.title}>
                <a href={r.href} className="grid gap-1 border-t border-line py-5 outline-none transition-colors duration-150 ease-out hover:bg-subtle focus-visible:outline-solid focus-visible:outline-1 focus-visible:-outline-offset-1 focus-visible:outline-line-strong motion-reduce:transition-none md:grid-cols-[2fr_1fr_1fr] md:items-center md:gap-6 md:px-3">
                  <span className="text-h3 leading-heading text-fg">{r.title}</span>
                  <span className="text-body leading-body text-fg-secondary">{r.team}</span>
                  <span className="font-mono text-caption leading-tight text-fg-muted">{r.location}</span>
                </a>
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

```
