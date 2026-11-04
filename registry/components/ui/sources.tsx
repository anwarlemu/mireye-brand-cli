"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Diamond } from "@/components/ui/diamond";

/**
 * Sources: the numbered list of data sources behind an agent answer, and SourceRef, the marker
 * that points a cited value at one of them.
 * Source: Figma "UI · Agent chat" (443:433), list rows 443:490…443:501, refs 443:473…443:487;
 * the chip is from the later chat mock "Chat 16 F1, Cut-corner source".
 *
 * - The ref is a small Fog chip with the number centered in it and the small cut corner: 36px
 *   tall, 44px wide at least, 18px number. A list row is the chip, then the 20px title 16px
 *   after it, centered on the chip.
 * - `size="inline"` is the chip inside a sentence: 24px tall, 24px wide at least, its 6px
 *   cut corner and the number in the text's own size, sitting on the line like a footnote.
 * - `size="sm"` (29 Oct, for lists under an answer): the same 24px chip with the label's 18px
 *   number, so a source list reads at the answer's scale instead of the first board's 36px.
 * - `cut={false}` draws the chip as a plain rectangle, for tables where the cut corners
 *   would repeat down a column (CitedFields uses it).
 * - Rows are 16px apart; the first board spaces its marker rows 22px (`className="gap-3.5"`).
 * - `variant="marker"` keeps the first board's look (a 7px diamond and the number); the
 *   specimen uses it.
 * - Linking: inside `SourceGroup`, pointing at a cited value or a source marks every chip with
 *   that number. The chip turns Forest with a white number and the other source titles fade to
 *   Slate-80, over 150ms on the ease-out curve. Nothing gets a background, so no fill runs into
 *   the table's edges. Keyboard focus does the same.
 *
 * Sizes above are Figma's; here they are 0.6 of it on the 4px grid: the chip is 20px tall and 28px
 * wide at least with the 5px cut, the inline and small chips 16px with a 4px cut.
 *
 * The number is visible text, so screen readers hear "Source 1" through a visually hidden word.
 */
type Link = { active: number | string | null; setActive: (n: number | string | null) => void };
const LinkContext = React.createContext<Link | null>(null);

/** Links refs and sources by number: pointing at one marks the others with the same number. */
export function SourceGroup({ children }: { children: React.ReactNode }) {
  const [active, setActive] = React.useState<number | string | null>(null);
  return <LinkContext.Provider value={{ active, setActive }}>{children}</LinkContext.Provider>;
}

/** Hover and focus handlers that mark `number` while the pointer or focus is on the element. */
export function useSourceLink(number: number | string) {
  const link = React.useContext(LinkContext);
  const on = () => link?.setActive(number);
  const off = () => link?.setActive(null);
  return {
    active: link?.active === number,
    dimmed: link ? link.active !== null && link.active !== number : false,
    handlers: link ? { onPointerEnter: on, onPointerLeave: off, onFocus: on, onBlur: off } : {},
  };
}

export function Sources({ className, ...props }: React.OlHTMLAttributes<HTMLOListElement>) {
  // role="list": Safari drops list semantics from lists styled with list-style: none.
  return <ol role="list" data-slot="sources" className={cn("flex flex-col gap-2.5", className)} {...props} />;
}

export function Source({
  number,
  variant = "chip",
  className,
  children,
  cut,
  size = "default",
  ...props
}: React.LiHTMLAttributes<HTMLLIElement> & { number: number | string; variant?: "chip" | "marker"; cut?: boolean; size?: "default" | "sm" }) {
  const { dimmed, handlers } = useSourceLink(number);
  if (variant === "marker") {
    return (
      <li data-slot="source" className={cn("flex items-end font-sans text-body font-normal text-fg", className)} {...props}>
        <SourceRef number={number} variant="marker" className="w-6 gap-1" />
        <span data-slot="title" className="ds-trim">
          {children}
        </span>
      </li>
    );
  }
  return (
    <li data-slot="source" className={cn("flex items-center font-sans font-normal", size === "sm" ? "gap-1.5 text-caption" : "gap-2.5 text-body", className)} {...handlers} {...props}>
      <SourceRef number={number} cut={cut} size={size} />
      <span data-slot="title" className={cn("ds-trim transition-colors duration-150 ease-out", dimmed ? "text-fg-secondary" : "text-fg")}>
        {children}
      </span>
    </li>
  );
}

export function SourceRef({
  number,
  variant = "chip",
  size = "default",
  cut = true,
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & {
  number: number | string;
  variant?: "chip" | "marker";
  size?: "default" | "inline" | "sm";
  /** The cut corner. `false` draws a plain rectangle. */
  cut?: boolean;
}) {
  const { active, handlers } = useSourceLink(number);
  if (variant === "marker") {
    return (
      <span
        data-slot="source-ref"
        className={cn("flex shrink-0 items-end gap-1 font-sans text-caption font-normal text-fg whitespace-nowrap", className)}
        {...props}
      >
        <Diamond size={7} className="mb-0.5" />
        <span data-slot="number" className="ds-trim">
          <span className="sr-only">Source </span>
          {number}
        </span>
      </span>
    );
  }
  return (
    <span
      data-slot="source-ref"
      data-active={active || undefined}
      // A number in running text links on its own; in a list or a table the row does it.
      {...(size === "inline" ? handlers : {})}
      className={cn(
        "inline-flex shrink-0 items-center justify-center font-sans font-normal whitespace-nowrap tabular-nums transition-colors duration-150 ease-out",
        size === "inline"
          ? "mx-0.5 h-4 min-w-4 px-1 align-[-0.15em] [font-size:0.8em] [--ds-cut:var(--spacing)]"
          : size === "sm"
            ? "h-4 min-w-4 px-1 text-caption [--ds-cut:var(--spacing)]"
            : "h-5 min-w-7 px-2 text-caption [--ds-cut:var(--ds-cut-sm)]",
        active ? "text-fg-inverse" : "text-fg",
        // The cut chip fills its shape; the plain one fills its box.
        cut
          ? cn("ds-cut", active ? "[--ds-shape-fill:var(--ds-color-forest)]" : "[--ds-shape-fill:var(--ds-color-fog)]")
          : active
            ? "bg-forest"
            : "bg-fog",
        className,
      )}
      {...props}
    >
      <span data-slot="number" className="ds-trim">
        <span className="sr-only">Source </span>
        {number}
      </span>
    </span>
  );
}
