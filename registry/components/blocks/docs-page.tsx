import * as React from "react";

import { PageSection } from "@/components/blocks/page-section";
import { SiteFooter, type SiteFooterProps } from "@/components/blocks/site-footer";
import { SiteHeader, type SiteHeaderProps } from "@/components/blocks/site-header";
import { CodeBlock, CodeBlockActions, CodeBlockContent, CodeBlockCopyButton, CodeBlockHeader, CodeBlockTitle } from "@/components/ui/code-block";
import { cn } from "@/lib/utils";

// A documentation page: a contents rail of sections on wide screens, the title and a lead, then sections of prose with
// code blocks at a 680px measure. Rail links are Forest at 80% and Forest when current (150ms, color only).

export type DocSection = { id: string; title: string; body: string[]; code?: { language: string; code: string } };
export type DocGroup = { title: string; links: { label: string; href: string; current?: boolean }[] };

const GROUPS: DocGroup[] = [
  { title: "Start", links: [{ label: "Quickstart", href: "#quickstart", current: true }, { label: "Authentication", href: "#auth" }] },
  { title: "Endpoints", links: [{ label: "Search", href: "#search" }, { label: "Enrich", href: "#enrich" }, { label: "Ask", href: "#ask" }] },
];

const SECTIONS: DocSection[] = [
  { id: "install", title: "Make a request", body: ["Send an address, a parcel id or coordinates. The response lists every field with its source."], code: { language: "bash", code: 'curl https://api.example.com/v1/enrich \\\n  -H "Authorization: Bearer $KEY" \\\n  -d \'{"address": "1 Example St"}\'' } },
  { id: "fields", title: "Read the fields", body: ["Each value carries the record it came from and the date that record was read. A field the county has not published comes back empty, never guessed."] },
];

const LINK = "block py-1.5 text-body leading-body text-fg-secondary outline-none transition-colors duration-150 ease-out hover:text-fg focus-visible:outline-solid focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-line-strong aria-[current=page]:text-fg motion-reduce:transition-none";

export type DocsPageProps = { header?: SiteHeaderProps; title?: string; lead?: string; groups?: DocGroup[]; sections?: DocSection[]; footer?: SiteFooterProps };

export function DocsPage({ header, title = "Quickstart", lead = "Make your first request and read the answer, in five minutes.", groups = GROUPS, sections = SECTIONS, footer }: DocsPageProps) {
  return (
    <div data-slot="docs-page" className="min-h-dvh bg-page font-sans text-fg">
      <SiteHeader current="#docs" {...header} />
      <main>
        <PageSection space="default" closing>
          <div className="grid gap-10 lg:grid-cols-[200px_minmax(0,1fr)] lg:gap-16">
            <nav aria-label="Documentation" className="lg:sticky lg:top-24 lg:self-start">
              {groups.map((g) => (
                <div key={g.title} className="mb-6">
                  <p className="mb-2 font-mono text-caption leading-tight text-fg-muted">{g.title}</p>
                  {g.links.map((l) => (
                    <a key={l.href} href={l.href} aria-current={l.current ? "page" : undefined} className={cn(LINK)}>{l.label}</a>
                  ))}
                </div>
              ))}
            </nav>
            <article className="grid max-w-170 gap-10">
              <header className="grid gap-4">
                <h1 className="text-h1 leading-heading font-normal text-fg">{title}</h1>
                <p className="text-body-lg leading-body text-fg-secondary">{lead}</p>
              </header>
              {sections.map((s) => (
                <section key={s.id} id={s.id} className="grid gap-4 border-t border-line pt-8">
                  <h2 className="text-h2 leading-heading font-normal text-fg">{s.title}</h2>
                  {s.body.map((p) => <p key={p} className="text-body leading-relaxed text-fg-secondary">{p}</p>)}
                  {s.code && (
                    <CodeBlock>
                      <CodeBlockHeader>
                        <CodeBlockTitle language={s.code.language}>{s.code.language}</CodeBlockTitle>
                        <CodeBlockActions>
                          <CodeBlockCopyButton value={s.code.code} />
                        </CodeBlockActions>
                      </CodeBlockHeader>
                      <CodeBlockContent code={s.code.code} language={s.code.language} wrap />
                    </CodeBlock>
                  )}
                </section>
              ))}
            </article>
          </div>
        </PageSection>
      </main>
      <SiteFooter {...footer} />
    </div>
  );
}
