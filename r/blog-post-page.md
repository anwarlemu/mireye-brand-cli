# Blog post page
A blog post: breadcrumb, topic, the title, the byline with the date in DM Mono, then the article in the typography items at a 680px measure with a cited figure.

Install: npx mireye-ds add blog-post-page
Requires: theme, cta-section, page-section, site-footer, site-header, avatar, badge, breadcrumb, cited-fields, sources, diamond, typography, utils
Packages: none
Exports: BlogPostPageProps, BlogPostPage
Client boundary: not required by this entry file
Reference: Mireye website (mireye-website, read-only): blog post layout; typography from the library


## Usage
Use for a post. Pass the post's fields and the article as `children` (typography items); the sample article shows the pattern, including a cited figure.
- Avoid: Text wider than 680px
- Avoid: Round bullets (use diamonds)
- Avoid: Bold headings


## Examples
Example components: npx mireye-ds add blog-post-page
[Preview](https://mireye-ds.agencidev.com/preview/blog-post-page/Preview)

examples/blog-post-page.tsx

```tsx
import { BlogPostPage } from "@/components/blocks/blog-post-page";

export function Preview() {
  return <BlogPostPage />;
}

```

## Source

components/blocks/blog-post-page.tsx

```tsx
import * as React from "react";

import { CtaSection, type CtaSectionProps } from "@/components/blocks/cta-section";
import { PageSection } from "@/components/blocks/page-section";
import { SiteFooter, type SiteFooterProps } from "@/components/blocks/site-footer";
import { SiteHeader, type SiteHeaderProps } from "@/components/blocks/site-header";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { CitedField, CitedFields } from "@/components/ui/cited-fields";
import { Source, SourceGroup, Sources } from "@/components/ui/sources";
import { Diamond } from "@/components/ui/diamond";
import { TypographyBlockquote, TypographyH2, TypographyP } from "@/components/ui/typography";
import { cn } from "@/lib/utils";

const PROSE = "text-body-lg leading-relaxed";

// A blog post: breadcrumb, topic tag, the title, the byline (square initials, author, date and reading time in DM
// Mono), then the article in the typography items at a 680px measure, with a figure that is a real library part
// (cited fields and their sources). Pass `children` to replace the sample article.

export type BlogPostPageProps = {
  header?: SiteHeaderProps;
  title?: string;
  topic?: string;
  author?: string;
  initials?: string;
  date?: string;
  readingTime?: string;
  children?: React.ReactNode;
  cta?: CtaSectionProps | null;
  footer?: SiteFooterProps;
};

function SampleArticle() {
  return (
    <>
      <TypographyP className={PROSE}>An agent that answers a question about land is only as useful as the record behind its answer. When a site selector asks whether a parcel floods, the answer has to say which map it read, and when.</TypographyP>
      <TypographyH2 className="mt-10 mb-1">The answer and its record</TypographyH2>
      <TypographyP className={PROSE}>Every field we return carries a source number. The sources list names each record and the date it was read, so a person can follow the answer back to the county office or the federal layer.</TypographyP>
      <figure className="my-8 grid gap-5 border-y border-line-subtle py-6">
        <SourceGroup>
          <div className="grid gap-6">
            <CitedFields>
              <CitedField label="Flood zone" source={1}>
                Zone X
              </CitedField>
              <CitedField label="Elevation" source={2}>
                412 ft
              </CitedField>
            </CitedFields>
            <Sources aria-label="Sources">
              <Source number={1} cut={false}>
                FEMA flood hazard layer, read Nov 2, 2026
              </Source>
              <Source number={2} cut={false}>
                USGS elevation model, read Oct 18, 2026
              </Source>
            </Sources>
          </div>
        </SourceGroup>
        <figcaption className="text-caption text-fg-muted">A cited answer for parcel 042-117-09.</figcaption>
      </figure>
      <TypographyH2 className="mt-10 mb-1">What we leave out</TypographyH2>
      <TypographyP className={PROSE}>Some counties do not publish every field. When a value is missing, the response says so:</TypographyP>
      <ul className="my-4 grid gap-2">
        {["The field is present, with a null value.", "The reason names the county and the record that was checked.", "No value is estimated without saying it is an estimate."].map((item) => (
          <li key={item} className={cn(PROSE, "flex items-start gap-3")}>
            <Diamond size={9} className="mt-2 text-fg" />
            {item}
          </li>
        ))}
      </ul>
      <TypographyBlockquote className={cn(PROSE, "my-6")}>A missing value that says it is missing is worth more than a confident guess.</TypographyBlockquote>
    </>
  );
}

export function BlogPostPage({
  header,
  title = "Why every value needs a source",
  topic = "Product",
  author = "The Mireye team",
  initials = "M",
  date = "Nov 12, 2026",
  readingTime = "6 min read",
  children,
  cta = { title: "Try a cited answer.", description: "Ask about any U.S. place with 1,000 free requests a month." },
  footer,
}: BlogPostPageProps) {
  return (
    <div data-slot="blog-post-page" className="min-h-dvh bg-page font-sans text-fg">
      <SiteHeader current="#blog" {...header} />
      <main>
        <PageSection>
          <article className="mx-auto grid max-w-(--ds-layout-text) gap-8">
            <header className="grid gap-5">
              <Breadcrumb>
                <BreadcrumbList>
                  <BreadcrumbItem>
                    <BreadcrumbLink href="#blog">Blog</BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem>
                    <BreadcrumbPage>{topic}</BreadcrumbPage>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
              <Badge variant="outline">{topic}</Badge>
              <h1 className="text-display leading-display font-normal text-balance text-fg">{title}</h1>
              <div className="flex items-center gap-3 border-y border-line-subtle py-4">
                <Avatar size="sm">
                  <AvatarFallback>{initials}</AvatarFallback>
                </Avatar>
                <span className="text-body text-fg">{author}</span>
                <span className="ml-auto flex gap-3 font-mono text-caption text-fg-muted">
                  <span>{date}</span>
                  <span className="max-sm:hidden">{readingTime}</span>
                </span>
              </div>
            </header>
            <div className="text-fg">{children ?? <SampleArticle />}</div>
          </article>
        </PageSection>
        {cta && <CtaSection {...cta} />}
      </main>
      <SiteFooter {...footer} />
    </div>
  );
}

```
