# Site header
The website header: the lockup, page links (Forest at 80%, Forest when current with a Forest rule), Sign in and the Forest key, aligned to the section rails; a menu key below 768px.

Install: npx mireye-ds add site-header
Requires: theme, icons, page-section, button, utils
Packages: @phosphor-icons/react
Exports: SiteHeaderProps, SiteHeader
Client boundary: yes
Reference: Mireye website (mireye-website, read-only): SiteHeader and site-header.css


## Usage
Use at the top of every website page. Pass `links`, the `current` href, `signIn` and `cta`. It is sticky on Bone with a Stone rule under it. The phone menu opens in place without motion.
- Avoid: More than one Forest key
- Avoid: Icons that move on hover
- Avoid: A transparent header over content
- Avoid: Bold or uppercase links


## Examples
Example components: npx mireye-ds add site-header
[Preview](https://mireye-ds.agencidev.com/preview/site-header/Preview)

examples/site-header.tsx

```tsx
"use client";

import { SiteHeader } from "@/components/blocks/site-header";

export function Preview() {
  return (
    <div className="h-64">
      <SiteHeader current="#pricing" />
    </div>
  );
}

```

## Source

components/blocks/site-header.tsx

```tsx
"use client";

import * as React from "react";
import { ListIcon, XIcon } from "@phosphor-icons/react/ssr";

import { ArrowRightIcon } from "@/components/icons/arrow-right";
import { SECTION_COLUMN, SECTION_GUTTER, SECTION_INSET, SITE_LINK, SiteLockup, type SiteLink } from "@/components/blocks/page-section";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// The website's header: the lockup, the page links and two actions, on Bone with a 1px Stone rule under it, aligned to
// the section rails. Sign in is a text link and Get started an outlined key, so the hero's Forest key is the one in
// view. A link under the pointer turns from Forest at 80% to Forest (150ms, color only); the current page
// is Forest with a Forest rule under it. Below 768px the links fold into a menu key that opens them in place, with no
// motion (it is opened often and should answer at once).

const LINKS: SiteLink[] = [
  { label: "Product", href: "#product" },
  { label: "Pricing", href: "#pricing" },
  { label: "Docs", href: "#docs" },
  { label: "Blog", href: "#blog" },
  { label: "Changelog", href: "#changelog" },
];

export type SiteHeaderProps = {
  name?: string;
  links?: SiteLink[];
  /** The href of the current page: marked aria-current. */
  current?: string;
  signIn?: SiteLink;
  cta?: SiteLink;
  className?: string;
};

export function SiteHeader({ name = "Mireye", links = LINKS, current, signIn = { label: "Sign in", href: "#sign-in" }, cta = { label: "Get started", href: "#get-started" }, className }: SiteHeaderProps) {
  const [open, setOpen] = React.useState(false);
  const menu = React.useId();
  return (
    <header data-slot="site-header" className={cn("sticky top-0 z-30 border-b border-line bg-page font-sans text-fg", SECTION_GUTTER, className)}>
      <div className={cn(SECTION_COLUMN, SECTION_INSET, "flex h-14 items-center gap-8")}>
        <SiteLockup name={name} />
        <nav aria-label="Main" className="hidden md:block">
          <ul className="flex items-center gap-6">
            {links.map((l) => (
              <li key={l.href}>
                <a href={l.href} aria-current={current === l.href ? "page" : undefined} className={cn(SITE_LINK, "inline-flex h-14 items-center border-b border-transparent aria-[current=page]:border-line-strong")}>
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
        <div className="ml-auto hidden items-center gap-5 md:flex">
          <a href={signIn.href} className={SITE_LINK}>
            {signIn.label}
          </a>
          {/* Outlined, so the page's own main action stays the one Forest key in view. */}
          <Button asChild size="sm" variant="outline">
            <a href={cta.href}>{cta.label}</a>
          </Button>
        </div>
        <Button variant="ghost" size="icon" className="ml-auto size-11 md:hidden" aria-expanded={open} aria-controls={menu} onClick={() => setOpen((o) => !o)}>
          {open ? <XIcon /> : <ListIcon />}
          <span className="sr-only">{open ? "Close the menu" : "Open the menu"}</span>
        </Button>
      </div>
      {open && (
        <nav id={menu} aria-label="Main" className={cn(SECTION_COLUMN, SECTION_INSET, "border-t border-line-subtle pt-2 pb-5 md:hidden")}>
          <ul className="grid">
            {links.map((l) => (
              <li key={l.href} className="border-b border-line-subtle">
                <a href={l.href} onClick={() => setOpen(false)} aria-current={current === l.href ? "page" : undefined} className={cn(SITE_LINK, "flex h-11 items-center")}>
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
          <div className="mt-5 grid gap-3">
            <Button asChild className="w-full">
              <a href={cta.href}>
                {cta.label}
                <ArrowRightIcon size={16} />
              </a>
            </Button>
            <Button asChild variant="outline" className="w-full">
              <a href={signIn.href}>{signIn.label}</a>
            </Button>
          </div>
        </nav>
      )}
    </header>
  );
}

```
