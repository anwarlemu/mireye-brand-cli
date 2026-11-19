"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpenTextIcon, ListIcon, MagnifyingGlassIcon, PaletteIcon, SquaresFourIcon, XIcon } from "@phosphor-icons/react/ssr";

import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Lockup } from "@www/components/logo";

type Entry = { name: string; title: string; type?: string; group?: string };

// Rail groups by registry type: the shadcn set, then Mireye's own parts, then the blocks split by their docs
// frontmatter `group` (section blocks, page templates, app shells). A block without a group lists under Blocks.
const GROUPS: { label: string; match: (e: Entry) => boolean }[] = [
  { label: "Components", match: (e) => ["ui", "site", "visual"].includes(e.type ?? "ui") },
  { label: "Mireye", match: (e) => e.type === "product" },
  { label: "Blocks", match: (e) => e.type === "block" && (e.group ?? "blocks") === "blocks" },
  { label: "Pages", match: (e) => e.type === "block" && e.group === "pages" },
  { label: "App shells", match: (e) => e.type === "block" && e.group === "shells" },
];

// A rail row: 32px and square, 12px in, a 16px glyph 8px before the 13px Forest label. A row under the pointer fills
// with Fog and the current page sits on Mist (150ms, color only); nothing moves.
const ROW =
  "flex h-8 items-center gap-2 px-3 text-body leading-none text-fg outline-none transition-colors duration-150 ease-out hover:bg-subtle focus-visible:outline-solid focus-visible:outline-1 focus-visible:-outline-offset-1 focus-visible:outline-line-strong aria-[current=page]:bg-subtle-hover motion-reduce:transition-none [&_svg]:size-4 [&_svg]:shrink-0 [&_svg]:text-fg-muted";

const FOCUS = "outline-none focus-visible:outline-solid focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-line-strong";

const PAGES = [
  { href: "/", label: "Introduction", icon: BookOpenTextIcon },
  { href: "/components", label: "All components", icon: SquaresFourIcon },
  { href: "/theme", label: "Theme", icon: PaletteIcon },
];

/** A section label in the rail: a 12px chip in the 1px Stone line. */
function GroupLabel({ children }: { children: React.ReactNode }) {
  return <p className="mb-2 inline-flex h-5 items-center border border-line px-1.5 text-caption leading-none text-fg-secondary">{children}</p>;
}

function Groups({ entries, query, onNavigate }: { entries: Entry[]; query: string; onNavigate: () => void }) {
  const pathname = usePathname();
  const q = query.trim().toLowerCase();
  const shown = q ? entries.filter((e) => e.title.toLowerCase().includes(q) || e.name.includes(q)) : entries;
  return (
    <>
      {!q && (
        <div>
          <GroupLabel>Guide</GroupLabel>
          <ul className="grid gap-0.5">
            {PAGES.map(({ href, label, icon: Icon }) => (
              <li key={href}>
                <Link href={href} onNavigate={onNavigate} aria-current={pathname === href ? "page" : undefined} className={ROW}>
                  <Icon aria-hidden />
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
      {GROUPS.map((group) => {
        const list = shown.filter(group.match);
        if (!list.length) return null;
        return (
          <div key={group.label}>
            <GroupLabel>{group.label}</GroupLabel>
            <ul className="grid gap-0.5">
              {list.map((e) => {
                const href = `/components/${e.name}`;
                return (
                  <li key={e.name}>
                    <Link href={href} scroll={false} onNavigate={onNavigate} data-item={e.name} aria-current={pathname === href ? "page" : undefined} className={ROW}>
                      {e.title}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        );
      })}
      {!shown.length && <p className="px-3 text-body text-fg-muted">Nothing matches.</p>}
    </>
  );
}

/**
 * The docs' rail: 212px of white beside the canvas, no line of its own. The lockup, a filter, the guide pages and
 * every component, each group under a framed chip. Below 1024px it folds into a white bar at the top of the page that
 * opens it over the page.
 */
export function DocsRail({ entries }: { entries: Entry[] }) {
  const [query, setQuery] = React.useState("");
  const [open, setOpen] = React.useState(false);
  const close = React.useCallback(() => setOpen(false), []);
  return (
    <>
      <div className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-line bg-surface px-4 lg:hidden">
        <Link href="/" aria-label="Mireye design system" className={FOCUS}>
          <Lockup />
        </Link>
        <button
          type="button"
          aria-expanded={open}
          aria-controls="docs-rail"
          onClick={() => setOpen((o) => !o)}
          className={cn("inline-flex size-9 cursor-pointer items-center justify-center text-fg transition-colors duration-150 ease-out hover:bg-subtle active:bg-subtle-hover motion-reduce:transition-none", FOCUS)}
        >
          {open ? <XIcon className="size-5" /> : <ListIcon className="size-5" />}
          <span className="sr-only">{open ? "Close the library" : "Open the library"}</span>
        </button>
      </div>
      <nav
        id="docs-rail"
        aria-label="Library"
        className={cn(
          "z-20 flex-col bg-surface max-lg:fixed max-lg:inset-x-0 max-lg:top-14 max-lg:bottom-0 lg:sticky lg:top-0 lg:flex lg:h-dvh lg:w-(--ds-layout-rail) lg:shrink-0",
          open ? "flex" : "hidden",
        )}
      >
        <Link href="/" aria-label="Mireye design system" className={cn("mx-6 mt-6 mb-5 hidden w-fit lg:block", FOCUS)}>
          <Lockup />
        </Link>
        <div className="relative mx-3 mt-3 mb-4 lg:mt-0">
          <MagnifyingGlassIcon aria-hidden className="pointer-events-none absolute top-1/2 left-3 z-10 size-4 -translate-y-1/2 text-fg-subtle" />
          <Input type="text" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Filter components" aria-label="Filter components" className="h-8 pl-9" />
        </div>
        <div className="grid min-h-0 flex-1 content-start gap-5 overflow-y-auto overscroll-contain px-3 pb-6 [scrollbar-width:thin]">
          <Groups entries={entries} query={query} onNavigate={close} />
        </div>
      </nav>
    </>
  );
}
