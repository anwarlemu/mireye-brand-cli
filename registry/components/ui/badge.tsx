"use client";

import * as React from "react";
import { chakra } from "@chakra-ui/react";
import { cva, type VariantProps } from "class-variance-authority";

import { Diamond } from "@/components/ui/diamond";
import { cn, svgBox, svgSize } from "@/lib/utils";

// Mireye's tags and statuses (Figma "UI · Status and tags", 442:177), at the product scale. Badges are small, so they are
// square: no cut corner, no radius.
// - `default` (also `tag`): the Fog data tag for a site value ("345 kV", "41.2 ac", "Zone X"), Forest ink, no line.
// - `inverse`: the Forest tag with white ink, for a tag on a map or photo, or one value that must lead.
// - `outline` (also `status`): the status pill, white with the 1px Stone line. Lead it with a BadgeMark (Verified,
//   Loading, Queued).
// - `secondary`: Mist, a quieter tag beside Fog ones. `ghost`: no fill, muted ink. `link`: underlined ink.
// - `success`, `warning` and `destructive`: the chosen status colours (Figma has none), a 1px line and ink in the colour
//   on white. Use them sparingly; a status reads first by its mark and word.
// - `count`: a small Forest number (unread, selected).
// Sizes: sm 20px, default 24px (Figma's 44px tag at 0.6, on the 4px grid), lg 28px. 12px regular labels (13px at lg),
// 8px sides. Nothing moves; a badge that links fills one step on hover (150ms).
const badgeVariants = cva(
  "inline-flex w-fit shrink-0 items-center justify-center gap-1.5 overflow-hidden border border-transparent font-sans font-normal whitespace-nowrap normal-case outline-none transition-[background-color,color] duration-fast ease-out focus-visible:outline-solid focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-line-strong motion-reduce:transition-none [&>svg]:pointer-events-none [&>svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-tag text-tag-fg [a&]:hover:bg-subtle-hover",
        tag: "bg-tag text-tag-fg [a&]:hover:bg-subtle-hover",
        inverse: "bg-inverse text-fg-inverse [a&]:hover:bg-primary-hover",
        secondary: "bg-subtle-hover text-fg",
        outline: "border-line bg-surface text-fg [a&]:hover:bg-subtle",
        status: "border-line bg-surface text-fg [a&]:hover:bg-subtle",
        ghost: "text-fg-muted [a&]:hover:text-fg",
        link: "px-0 text-fg underline decoration-line underline-offset-4 [a&]:hover:decoration-line-strong",
        success: "border-success bg-surface text-success",
        warning: "border-warning bg-surface text-warning",
        destructive: "border-danger bg-surface text-danger",
        count: "bg-inverse text-fg-inverse tabular-nums",
        // Older names, kept so existing code still renders: pink was the plan mark, now the status pill.
        pink: "border-line bg-surface text-fg",
      },
      size: {
        sm: "h-5 px-1.5 text-micro leading-none [&>svg]:size-3",
        default: "h-6 px-2 text-caption leading-none [&>svg]:size-3.5",
        lg: "h-7 px-2.5 text-body leading-none [&>svg]:size-4",
      },
    },
    compoundVariants: [{ variant: "count", className: "h-4 min-w-4 px-1 text-micro" }],
    defaultVariants: { variant: "default", size: "default" },
  },
);

function Badge({ className, variant, size, asChild = false, ...props }: React.ComponentProps<"span"> & VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? chakra.span : "span";
  // Chakra's factory renders its child in its place only when told to.
  const slotProps = asChild ? { asChild: true } : {};
  return <Comp {...slotProps} data-slot="badge" data-variant={variant ?? "default"} className={cn(badgeVariants({ variant, size }), className)} {...props} />;
}

/**
 * The mark at the start of a status (Figma 442:189, 442:194, 442:199), 6px at the product scale: Verified is a solid
 * diamond, Queued an outlined one, Loading three 1px bars. It takes the text colour.
 */
function BadgeMark({ state = "verified", className }: { state?: "verified" | "loading" | "queued"; className?: string }) {
  // Wrapped, so the badge's glyph size does not stretch the 6px mark.
  return (
    <span data-slot="badge-mark" className={cn("flex shrink-0 items-center", className)}>
      {state === "loading" ? (
        <svg width={10} height={10} viewBox="0 0 10 10" fill="none" aria-hidden className={cn("block shrink-0", svgBox)} style={svgSize(10)}>
          <path d="M1.5 0V10M5 0V10M8.5 0V10" stroke="currentColor" vectorEffect="non-scaling-stroke" />
        </svg>
      ) : (
        <Diamond size={10} variant={state === "verified" ? "solid" : "outline"} />
      )}
    </span>
  );
}

export { Badge, BadgeMark, badgeVariants };
