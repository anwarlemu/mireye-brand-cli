# Site footer
The website footer: the lockup and one line, link columns under mono labels and the legal row under a Mist rule; it closes the page's rails.

Install: npx mireye-ds add site-footer
Requires: theme, page-section
Packages: none
Exports: FooterColumn, SiteFooterProps, SiteFooter
Client boundary: not required by this entry file
Reference: Mireye website (mireye-website, read-only): SiteFooter (Products, Solutions, Company, Explore and Connect columns, legal row)


## Usage
Use at the foot of every website page, as its last section. Pass `columns` of links, `legal` and a mono `meta` (a status).
- Avoid: Social icons that move on hover
- Avoid: Coloured footer grounds
- Avoid: More than five columns


## Examples
Example components: npx mireye-ds add site-footer
[Preview](https://mireye-ds.agencidev.com/preview/site-footer/Preview)

examples/site-footer.tsx

```tsx
import { SiteFooter } from "@/components/blocks/site-footer";

export function Preview() {
  return <SiteFooter />;
}

```

## Source

components/blocks/site-footer.tsx

```tsx
import * as React from "react";

import { PageSection, SITE_LINK, SiteLockup, type SiteLink } from "@/components/blocks/page-section";

// The website footer, the last framed section: the lockup and one line, the link columns under mono labels, then the
// legal row under a Mist rule. Links are Forest at 80% and turn Forest under the pointer (150ms, color only). It closes
// the rails with the bottom rule and its nodes.

export type FooterColumn = { title: string; links: SiteLink[] };

const COLUMNS: FooterColumn[] = [
  { title: "Product", links: [{ label: "Overview", href: "#product" }, { label: "Parcels", href: "#parcels" }, { label: "Permits", href: "#permits" }, { label: "Platform", href: "#platform" }] },
  { title: "Developers", links: [{ label: "Docs", href: "#docs" }, { label: "API reference", href: "#api" }, { label: "Changelog", href: "#changelog" }, { label: "Status", href: "#status" }] },
  { title: "Company", links: [{ label: "About", href: "#about" }, { label: "Blog", href: "#blog" }, { label: "Careers", href: "#careers" }, { label: "Contact", href: "#contact" }] },
  { title: "Legal", links: [{ label: "Terms", href: "#terms" }, { label: "Privacy", href: "#privacy" }, { label: "Security", href: "#security" }] },
];

export type SiteFooterProps = {
  name?: string;
  tagline?: React.ReactNode;
  columns?: FooterColumn[];
  /** The legal line, e.g. "© 2026 Mireye". */
  legal?: React.ReactNode;
  /** Mono text at the end of the legal row. */
  meta?: React.ReactNode;
  className?: string;
};

export function SiteFooter({
  name = "Mireye",
  tagline = "Physical world context for AI agents.",
  columns = COLUMNS,
  legal = `© ${new Date().getFullYear()} ${name}`,
  meta = "All systems normal",
  className,
}: SiteFooterProps) {
  return (
    <PageSection closing space="none" className={className} contentClassName="pt-12 pb-8 sm:pt-16">
      <footer className="grid gap-12">
        <div className="grid gap-10 lg:grid-cols-3">
          <div className="grid content-start gap-4">
            <SiteLockup name={name} />
            <p className="max-w-64 text-body leading-body text-fg-secondary">{tagline}</p>
          </div>
          <nav aria-label="Footer" className="grid grid-cols-2 gap-8 sm:grid-cols-4 lg:col-span-2">
            {columns.map((c) => (
              <div key={c.title} className="grid content-start gap-3">
                <h2 className="font-mono text-caption leading-tight font-normal text-fg-muted">{c.title}</h2>
                <ul className="grid gap-3">
                  {c.links.map((l) => (
                    <li key={l.href}>
                      <a href={l.href} className={SITE_LINK}>
                        {l.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line-subtle pt-5 text-caption leading-tight text-fg-muted">
          <span>{legal}</span>
          {meta != null && <span className="font-mono">{meta}</span>}
        </div>
      </footer>
    </PageSection>
  );
}

```
