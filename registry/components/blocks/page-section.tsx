import * as React from "react";

import { Diamond } from "@/components/ui/diamond";
import { MireyeMark } from "@/components/ui/mireye-mark";
import { cn } from "@/lib/utils";

// The survey frame every website section sits in (the website's "window and rules"): two 1px Stone rails run down the
// page at the content edges, a rule runs edge to edge at the top of each section, and a solid Forest diamond marks each
// crossing. The last section on a page passes `closing` to draw the bottom rule and its nodes. Rails sit 12px in on a
// phone and 32px on wider screens, so text never touches a line. Nothing moves.

/** The space outside the rails. */
export const SECTION_GUTTER = "px-3 sm:px-8";
/** The column between the rails. */
export const SECTION_COLUMN = "relative mx-auto w-full max-w-(--ds-layout-column)";
/** The space inside the rails. */
export const SECTION_INSET = "px-5 sm:px-10";

export type SiteLink = { label: string; href: string };

/** A website link: Forest at 80%, Forest under the pointer (150ms, color only). */
export const SITE_LINK =
  "text-body leading-none text-fg-secondary outline-none transition-colors duration-150 ease-out hover:text-fg focus-visible:outline-solid focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-line-strong aria-[current=page]:text-fg motion-reduce:transition-none";

/** The mark with the name set in Gilroy (the wordmark is not final). */
export function SiteLockup({ name = "Mireye", href = "#" }: { name?: string; href?: string }) {
  return (
    <a href={href} className="inline-flex items-center gap-2 text-fg outline-none focus-visible:outline-solid focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-line-strong">
      <MireyeMark aria-hidden role="presentation" className="h-4 w-5.5" />
      <span className="text-body-lg leading-none">{name}</span>
    </a>
  );
}

/** A node on a crossing: centered on the 1px lines, so it starts half a line before them. */
function Node({ side, edge }: { side: "left" | "right"; edge: "top" | "bottom" }) {
  return (
    <span
      aria-hidden
      className={cn(
        "absolute z-10",
        side === "left" ? "left-[calc(var(--ds-border-width)/2)] -translate-x-1/2" : "right-[calc(var(--ds-border-width)/2)] translate-x-1/2",
        edge === "top" ? "top-[calc(var(--ds-border-width)/-2)] -translate-y-1/2" : "bottom-[calc(var(--ds-border-width)/-2)] translate-y-1/2",
      )}
    >
      <Diamond size={12} className="text-fg" />
    </span>
  );
}

export type PageSectionProps = Omit<React.ComponentProps<"section">, "title"> & {
  /** A mono label over the title, e.g. "Coverage". */
  label?: React.ReactNode;
  title?: React.ReactNode;
  /** One paragraph beside the title on wide screens, under it on a phone. */
  intro?: React.ReactNode;
  /** Actions after the intro. */
  actions?: React.ReactNode;
  /** The last section on the page: draws the bottom rule and its nodes. */
  closing?: boolean;
  /** Vertical rhythm: `default` 64 to 96px, `compact` 32 to 48px (a logo strip), `none` (the block pads itself). */
  space?: "default" | "compact" | "none";
  /** Heading level of the title. */
  as?: "h1" | "h2";
  /** Classes for the column between the rails. */
  contentClassName?: string;
};

export function PageSection({ label, title, intro, actions, closing = false, space = "default", as: Heading = "h2", className, contentClassName, children, ...props }: PageSectionProps) {
  const hasHead = label != null || title != null || intro != null || actions != null;
  return (
    <section data-slot="page-section" className={cn("border-t border-line bg-page font-sans text-fg", closing && "border-b", SECTION_GUTTER, className)} {...props}>
      <div className={cn(SECTION_COLUMN, "border-x border-line")}>
        <Node side="left" edge="top" />
        <Node side="right" edge="top" />
        {closing && (
          <>
            <Node side="left" edge="bottom" />
            <Node side="right" edge="bottom" />
          </>
        )}
        <div className={cn(SECTION_INSET, space === "default" && "py-16 sm:py-24", space === "compact" && "py-8 sm:py-12", contentClassName)}>
          {hasHead && (
            <header className={cn("grid gap-4 lg:grid-cols-2 lg:items-end lg:gap-10", children != null && "mb-10 sm:mb-12")}>
              <div className="grid gap-3">
                {label != null && <p className="font-mono text-caption leading-tight text-fg-muted">{label}</p>}
                {title != null && <Heading className="max-w-(--ds-layout-heading) text-h1 leading-heading font-normal text-balance text-fg">{title}</Heading>}
              </div>
              {(intro != null || actions != null) && (
                <div className="grid gap-5 lg:justify-items-start">
                  {intro != null && <p className="max-w-(--ds-layout-text) text-body-lg leading-body text-fg-secondary">{intro}</p>}
                  {actions != null && <div className="flex flex-wrap items-center gap-3">{actions}</div>}
                </div>
              )}
            </header>
          )}
          {children}
        </div>
      </div>
    </section>
  );
}
