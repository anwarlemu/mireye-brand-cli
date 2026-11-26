# Blog page
The blog index: the title, topic tabs that filter at once, the newest post as a lead with a survey plate, the rest as ruled rows (date in DM Mono, title, one line, a Fog topic tag) and pagination.

Install: npx mireye-ds add blog-page
Requires: theme, icons, cta-section, page-section, site-footer, site-header, survey-plate, badge, pagination, tabs
Packages: none
Exports: Post, formatPostDate, BlogPageProps, BlogPage
Client boundary: yes
Reference: Mireye website (mireye-website, read-only): blog page and ResourcePages


## Usage
Use for /blog. Pass `posts` (ISO dates) and `topics`. The first post in the current topic leads.
- Avoid: Thumbnails with rounded corners
- Avoid: Animated filtering
- Avoid: Author photos in circles


## Examples
Example components: npx mireye-ds add blog-page
[Preview](https://mireye-ds.agencidev.com/preview/blog-page/Preview)

examples/blog-page.tsx

```tsx
"use client";

import { BlogPage } from "@/components/blocks/blog-page";

export function Preview() {
  return <BlogPage />;
}

```

## Source

components/blocks/blog-page.tsx

```tsx
"use client";

import * as React from "react";

import { ArrowRightIcon } from "@/components/icons/arrow-right";
import { CtaSection, type CtaSectionProps } from "@/components/blocks/cta-section";
import { PageSection } from "@/components/blocks/page-section";
import { SiteFooter, type SiteFooterProps } from "@/components/blocks/site-footer";
import { SiteHeader, type SiteHeaderProps } from "@/components/blocks/site-header";
import { SurveyPlate } from "@/components/blocks/survey-plate";
import { Badge } from "@/components/ui/badge";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

// The blog index: the page title, topic tabs that filter the list at once (no motion), the newest post as a lead card
// with a survey plate, then the rest as ruled rows (date in DM Mono, title, one line, the topic as a Fog tag) and
// pagination. A row's title takes a Stone underline under the pointer that turns Forest (150ms, color only).

export type Post = { title: string; excerpt: string; date: string; topic: string; href: string; readingTime?: string };

const POSTS: Post[] = [
  { title: "Why every value needs a source", excerpt: "An agent that cannot show where a fact came from cannot be trusted with a site decision.", date: "2026-11-12", topic: "Product", href: "#post-sources", readingTime: "6 min" },
  { title: "Reading flood zones from federal layers", excerpt: "How we turn flood hazard maps into one field an agent can read.", date: "2026-10-28", topic: "Data", href: "#post-flood", readingTime: "8 min" },
  { title: "Screening a county overnight", excerpt: "What it takes to hold every parcel in a county to one buy box.", date: "2026-10-14", topic: "Engineering", href: "#post-screening", readingTime: "10 min" },
  { title: "Permits data is available now", excerpt: "Filed and issued permits, with status and dates, for every county we read.", date: "2026-09-30", topic: "Product", href: "#post-permits", readingTime: "3 min" },
  { title: "Slope from an elevation model", excerpt: "A short note on sampling terrain across an irregular parcel.", date: "2026-09-16", topic: "Data", href: "#post-slope", readingTime: "5 min" },
];

const DATE = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" });
export const formatPostDate = (iso: string) => DATE.format(new Date(`${iso}T00:00:00Z`));

const TITLE_LINK =
  "underline decoration-transparent underline-offset-4 outline-none transition-[text-decoration-color] duration-150 ease-out hover:decoration-line-strong focus-visible:outline-solid focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-line-strong motion-reduce:transition-none";

export type BlogPageProps = {
  header?: SiteHeaderProps;
  title?: string;
  intro?: string;
  posts?: Post[];
  topics?: string[];
  cta?: CtaSectionProps | null;
  footer?: SiteFooterProps;
};

export function BlogPage({
  header,
  title = "Blog",
  intro = "Notes on the data, the product and the engineering behind physical world context.",
  posts = POSTS,
  topics = ["All", "Product", "Data", "Engineering"],
  cta = { title: "Get new posts by email.", description: "One email when we publish. Nothing else.", primary: { label: "Subscribe", href: "#subscribe" }, secondary: null, tone: "light" },
  footer,
}: BlogPageProps) {
  const [topic, setTopic] = React.useState(topics[0]);
  const shown = topic === topics[0] ? posts : posts.filter((p) => p.topic === topic);
  const [lead, ...rest] = shown;
  return (
    <div data-slot="blog-page" className="min-h-dvh bg-page font-sans text-fg">
      <SiteHeader current="#blog" {...header} />
      <main>
        <PageSection as="h1" title={title} intro={intro}>
          <Tabs value={topic} onValueChange={setTopic} className="mb-8">
            <TabsList aria-label="Topics">
              {topics.map((t) => (
                <TabsTrigger key={t} value={t}>
                  {t}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
          {lead ? (
            <article className="grid gap-6 border-b border-line pb-10 lg:grid-cols-2 lg:items-center lg:gap-12">
              <SurveyPlate className="aspect-video w-full" caption={lead.topic} scale={null} />
              <div className="grid content-start gap-4">
                <p className="flex items-center gap-3 font-mono text-caption text-fg-muted">
                  <time dateTime={lead.date}>{formatPostDate(lead.date)}</time>
                  {lead.readingTime && <span>{lead.readingTime}</span>}
                </p>
                <h2 className="text-h1 leading-heading font-normal text-balance text-fg">
                  <a href={lead.href} className={TITLE_LINK}>
                    {lead.title}
                  </a>
                </h2>
                <p className="text-body-lg leading-body text-fg-secondary">{lead.excerpt}</p>
                <a href={lead.href} className="inline-flex w-fit items-center gap-2 text-body font-medium text-fg-secondary outline-none transition-colors duration-150 ease-out hover:text-fg focus-visible:outline-solid focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-line-strong motion-reduce:transition-none">
                  Read the post
                  <ArrowRightIcon size={16} />
                </a>
              </div>
            </article>
          ) : (
            <p className="text-body text-fg-muted">No posts in this topic yet.</p>
          )}
          <ul className="grid">
            {rest.map((p) => (
              <li key={p.href} className="grid gap-2 border-b border-line-subtle py-6 sm:grid-cols-4 sm:gap-6">
                <time dateTime={p.date} className="font-mono text-caption leading-body text-fg-muted">
                  {formatPostDate(p.date)}
                </time>
                <div className="grid gap-2 sm:col-span-2">
                  <h3 className="text-h3 leading-heading font-normal text-fg">
                    <a href={p.href} className={TITLE_LINK}>
                      {p.title}
                    </a>
                  </h3>
                  <p className="text-body leading-body text-fg-secondary">{p.excerpt}</p>
                </div>
                <div className="sm:justify-self-end">
                  <Badge>{p.topic}</Badge>
                </div>
              </li>
            ))}
          </ul>
          <Pagination className="mt-8">
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious href="#" aria-disabled />
              </PaginationItem>
              <PaginationItem>
                <PaginationLink href="#" isActive>
                  1
                </PaginationLink>
              </PaginationItem>
              <PaginationItem>
                <PaginationLink href="#">2</PaginationLink>
              </PaginationItem>
              <PaginationItem>
                <PaginationNext href="#" />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </PageSection>
        {cta && <CtaSection {...cta} />}
      </main>
      <SiteFooter {...footer} />
    </div>
  );
}

```
