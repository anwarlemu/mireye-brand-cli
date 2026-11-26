# Legal page
A legal page: the title and effective date in DM Mono, a contents list that stays in view on wide screens, then numbered sections at a 680px measure.

Install: npx mireye-ds add legal-page
Requires: theme, page-section, site-footer, site-header
Packages: none
Exports: LegalSection, LegalPageProps, LegalPage
Client boundary: not required by this entry file
Reference: Mireye website (mireye-website, read-only): terms and privacy pages


## Usage
Use for terms, privacy and security pages. Pass `sections` (id, title, paragraphs) and `effective`. The sample text is a placeholder, not legal advice.
- Avoid: Text wider than 680px
- Avoid: Uppercase headings
- Avoid: Collapsed sections


## Examples
Example components: npx mireye-ds add legal-page
[Preview](https://mireye-ds.agencidev.com/preview/legal-page/Preview)

examples/legal-page.tsx

```tsx
import { LegalPage } from "@/components/blocks/legal-page";

export function Preview() {
  return <LegalPage />;
}

```

## Source

components/blocks/legal-page.tsx

```tsx
import * as React from "react";

import { PageSection } from "@/components/blocks/page-section";
import { SiteFooter, type SiteFooterProps } from "@/components/blocks/site-footer";
import { SiteHeader, type SiteHeaderProps } from "@/components/blocks/site-header";

// A legal page (terms, privacy, security): the title and the date it took effect in DM Mono, a contents list that
// stays in view on wide screens, then numbered sections at a 680px measure. Contents links are Forest at 80% and turn
// Forest under the pointer (150ms, color only). The sample text is a placeholder, not legal advice.

export type LegalSection = { id: string; title: string; body: string[] };

const SECTIONS: LegalSection[] = [
  { id: "agreement", title: "The agreement", body: ["These terms govern your use of the API and the platform. By creating an account you agree to them on behalf of yourself or the company you work for."] },
  { id: "data", title: "Data and sources", body: ["Values come from public and licensed records. Each response names its sources. You may store responses for your own use; you may not resell them as a dataset.", "Records can be wrong or out of date. Check the source before relying on a value for a legal or financial decision."] },
  { id: "accounts", title: "Accounts and keys", body: ["Keep your API keys secret. You are responsible for requests made with them. Rotate a key from the settings page if you think it has been exposed."] },
  { id: "billing", title: "Billing", body: ["Paid plans are billed in advance, monthly or yearly. Requests over your plan are billed at the plan's rate at the end of each month."] },
  { id: "changes", title: "Changes to these terms", body: ["We will email account owners 30 days before a material change takes effect."] },
];

export type LegalPageProps = { header?: SiteHeaderProps; title?: string; effective?: string; sections?: LegalSection[]; footer?: SiteFooterProps };

const LINK =
  "text-body leading-body text-fg-secondary outline-none transition-colors duration-150 ease-out hover:text-fg focus-visible:outline-solid focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-line-strong motion-reduce:transition-none";

export function LegalPage({ header, title = "Terms of service", effective = "Effective Nov 1, 2026", sections = SECTIONS, footer }: LegalPageProps) {
  return (
    <div data-slot="legal-page" className="min-h-dvh bg-page font-sans text-fg">
      <SiteHeader {...header} />
      <main>
        <PageSection label={effective} as="h1" title={title} space="compact" />
        <PageSection>
          <div className="grid gap-10 lg:grid-cols-4 lg:gap-12">
            <nav aria-label="Contents" className="lg:sticky lg:top-20 lg:self-start">
              <p className="mb-3 font-mono text-caption leading-tight text-fg-muted">Contents</p>
              <ol className="grid gap-2 border-l border-line pl-4">
                {sections.map((s, i) => (
                  <li key={s.id}>
                    <a href={`#${s.id}`} className={LINK}>
                      <span className="mr-2 font-mono text-caption text-fg-muted">{String(i + 1).padStart(2, "0")}</span>
                      {s.title}
                    </a>
                  </li>
                ))}
              </ol>
            </nav>
            <div className="grid max-w-(--ds-layout-text) gap-10 lg:col-span-3">
              {sections.map((s, i) => (
                <section key={s.id} id={s.id} className="grid scroll-mt-20 gap-3 border-t border-line-subtle pt-5">
                  <h2 className="flex items-baseline gap-3 text-h2 leading-heading font-normal text-fg">
                    <span className="font-mono text-caption text-fg-muted">{String(i + 1).padStart(2, "0")}</span>
                    {s.title}
                  </h2>
                  {s.body.map((p) => (
                    <p key={p} className="text-body-lg leading-relaxed text-fg-secondary">
                      {p}
                    </p>
                  ))}
                </section>
              ))}
            </div>
          </div>
        </PageSection>
      </main>
      <SiteFooter {...footer} />
    </div>
  );
}

```
