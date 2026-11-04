"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { ParcelIcon } from "@/components/icons/parcel-icon";
import { PlusIcon } from "@/components/icons/plus";
import { usePrefersReducedMotion } from "@/lib/use-loop-frame";

/**
 * Site chip: the site an agent question is about, shown as coordinates.
 * Source: Figma "UI · Agent chat" (443:433). In the composer: 443:458 (icon 443:460, label
 * 443:463). On its own under "Site tag and button": 443:503 (icon 443:505, label 443:508).
 *
 * - 40px tall, 8px cut corner (`--ds-cut-sm`), 1px Mist border on a Fog fill (#E6E8E4),
 *   drawn by ds-cut-frame. Figma path: M8 0.5 H229.5 V39.5 H0.5 V8 L8 0.5 Z.
 * - 14px parcel icon (shared ParcelIcon; Figma M0.5 0.5 H13.5 V13.5 H0.5 Z with a solid diamond
 *   M7 3.5 L10.5 7 L7 10.5 L3.5 7 Z) 16px from the left edge, then the 18px Regular label 10px
 *   after it. Both are centered on the row (Figma: icon y = 13, label cap box y = 14).
 * - Width: both Figma chips are 230px with the label left-aligned, so 230px is the minimum.
 *   Longer labels grow the chip and keep 16px on the right, the same as the left.
 * - Figma shows no hover, focus or remove state. A chosen site must be clearable (29 Oct), so `onRemove` adds a remove button: the shared PlusIcon turned 45° at 12px, in a
 *   24px target 8px from the right edge (WCAG's minimum). Hover and press fill the target Mist,
 *   one step darker than the chip. Not in Figma yet.
 * - Product scale: the sizes above are Figma's. Here the chip is 24px tall and 140px wide at
 *   least, with 10px either side; the remove key draws 16px of Mist but a 24px hit area.
 * - Motion (29 Oct): a new label rises 4px into place out of a 2px blur (200ms, ease-out) while
 *   the chip eases to its new width, so a longer site grows the chip instead of snapping it.
 * - Remove (30 Oct, second pass; the fold into a square read as unnatural): the chip leaves the
 *   way it came, quieter and faster: it fades, shrinks to 96% towards its left end and softens
 *   by a 2px blur (160ms, ease-out), then `onRemove` runs. Nothing moves on first render or
 *   under reduced motion.
 */
export function SiteChip({
  className,
  children,
  onRemove,
  removeLabel = "Remove site",
  icon = true,
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & {
  /** The parcel icon before the text. Off in the Land platform's composer. */
  icon?: boolean;
  /** Shows a remove button that calls this. */
  onRemove?: () => void;
  /** Accessible name of the remove button. */
  removeLabel?: string;
}) {
  const root = React.useRef<HTMLSpanElement>(null);
  const reduced = usePrefersReducedMotion();
  const remove = () => {
    const el = root.current;
    if (!el || reduced) return onRemove?.();
    el.style.transformOrigin = "left center";
    el.animate(
      [
        { opacity: 1, transform: "none", filter: "blur(0)" },
        { opacity: 0, transform: "scale(0.96)", filter: "blur(2px)" },
      ],
      { duration: 160, easing: "cubic-bezier(0.23, 1, 0.32, 1)", fill: "forwards" },
    ).finished.then(() => onRemove?.());
  };
  return (
    <span
      ref={root}
      data-slot="site-chip"
      className={cn(
        "inline-flex h-6 min-w-35 shrink-0 items-center gap-1.5 pl-2.5 whitespace-nowrap",
        onRemove ? "pr-1" : "pr-2.5",
        "font-sans text-caption font-normal text-fg",
        "ds-cut-frame [--ds-cut:var(--ds-cut-sm)]",
        "[--ds-shape-stroke:var(--ds-color-border-subtle)] [--ds-shape-fill:var(--ds-color-fog)]",
        className,
      )}
      {...props}
    >
      {icon && <ParcelIcon size={14} className="shrink-0" />}
      <Label>{children}</Label>
      {onRemove && (
        <button
          type="button"
          data-slot="remove"
          aria-label={removeLabel}
          onClick={remove}
          className={cn(
            "relative ml-auto flex size-4 shrink-0 cursor-pointer items-center justify-center text-fg",
            // The hit area stays 24px (WCAG's minimum) around the 16px key.
            "after:absolute after:-inset-1 after:content-['']",
            "hover:bg-mist active:bg-mist",
            "outline-none focus-visible:outline-solid focus-visible:outline-1 focus-visible:outline-offset-1 focus-visible:outline-line-strong",
          )}
        >
          <PlusIcon size={12} className="rotate-45" />
        </button>
      )}
    </span>
  );
}

/** The label: eases to its new width and lets a new label rise in, once mounted. */
function Label({ children }: { children: React.ReactNode }) {
  const inner = React.useRef<HTMLSpanElement>(null);
  const text = React.useRef<HTMLSpanElement>(null);
  const [width, setWidth] = React.useState<number | null>(null);
  const reduced = usePrefersReducedMotion();
  const key = typeof children === "string" ? children : undefined;
  const first = React.useRef(true);
  React.useLayoutEffect(() => {
    const el = inner.current;
    if (!el) return;
    const measure = () => setWidth(el.offsetWidth);
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  React.useLayoutEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    if (reduced) return;
    text.current?.animate(
      [
        { opacity: 0, filter: "blur(2px)", transform: "translateY(4px)" },
        { opacity: 1, filter: "blur(0px)", transform: "none" },
      ],
      { duration: 200, easing: "cubic-bezier(0.23, 1, 0.32, 1)" },
    );
  }, [key, reduced]);
  return (
    <span
      // Clipped sideways only, so the trimmed label keeps its descenders.
      className="inline-flex overflow-x-clip transition-[width] duration-200 ease-(--ds-easing-out) motion-reduce:transition-none"
      style={width == null ? undefined : { width }}
    >
      <span ref={inner} className="inline-block shrink-0">
        <span ref={text} data-slot="label" className="ds-trim block">
          {children}
        </span>
      </span>
    </span>
  );
}
