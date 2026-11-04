import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

// Mireye's card: the cut frame of the message panel (Figma "UI · Agent chat", 443:433), a 1px Stone line around white
// with the 8px chamfer at the top-left, 16px in (Figma's 24 to 28px at 0.6). No radius and no shadow.
// - `default` (also `outline`, `raised`, `elevated`): the white cut frame. A card does not lift; a raised card is
//   the same line.
// - `muted` (also `filled`): Fog with no line, for a group of values inside a white panel.
// - `inverse`: Forest with white ink, for the one card that leads (a verdict, a selected site).
// The title is 16px regular, the description 13px in Forest at 72%. Size sm tightens the insides to 12px. Nothing
// moves. The shape is drawn on ::before and ::after (ds-cut-frame), so the card's own background stays transparent.
const cardVariants = cva(
  "group/card flex flex-col gap-4 py-4 font-sans text-body leading-body text-fg data-[size=sm]:gap-3 data-[size=sm]:py-3",
  {
    variants: {
      variant: {
        default: "ds-cut-frame [--ds-shape-fill:var(--ds-color-bg-default)] [--ds-shape-stroke:var(--ds-color-border-default)]",
        outline: "ds-cut-frame [--ds-shape-fill:var(--ds-color-bg-default)] [--ds-shape-stroke:var(--ds-color-border-default)]",
        raised: "ds-cut-frame [--ds-shape-fill:var(--ds-color-bg-default)] [--ds-shape-stroke:var(--ds-color-border-default)]",
        elevated: "ds-cut-frame [--ds-shape-fill:var(--ds-color-bg-default)] [--ds-shape-stroke:var(--ds-color-border-default)]",
        muted: "ds-cut [--ds-shape-fill:var(--ds-color-bg-subtle)]",
        filled: "ds-cut [--ds-shape-fill:var(--ds-color-bg-subtle)]",
        inverse: "ds-cut text-fg-inverse [--ds-shape-fill:var(--ds-color-bg-inverse)]",
      },
    },
    defaultVariants: { variant: "default" },
  },
);

function Card({ className, variant, size = "default", ...props }: React.ComponentProps<"div"> & VariantProps<typeof cardVariants> & { size?: "default" | "sm" }) {
  return <div data-slot="card" data-variant={variant ?? "default"} data-size={size} className={cn(cardVariants({ variant }), className)} {...props} />;
}

function CardHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-header"
      className={cn("grid auto-rows-min items-start gap-x-3 gap-y-1 px-4 group-data-[size=sm]/card:px-3 has-data-[slot=card-action]:grid-cols-[minmax(0,1fr)_auto]", className)}
      {...props}
    />
  );
}

function CardTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-title"
      className={cn("flex min-w-0 items-center gap-2 text-h3 leading-heading font-normal group-data-[size=sm]/card:text-body-lg [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4", className)}
      {...props}
    />
  );
}

function CardDescription({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="card-description" className={cn("text-body leading-body text-fg-muted group-data-[variant=inverse]/card:text-fg-inverse-muted", className)} {...props} />;
}

function CardAction({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="card-action" className={cn("col-start-2 row-span-2 row-start-1 flex self-start justify-self-end", className)} {...props} />;
}

function CardContent({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="card-content" className={cn("px-4 group-data-[size=sm]/card:px-3", className)} {...props} />;
}

/** The card's last row: actions at the end. */
function CardFooter({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="card-footer" className={cn("flex items-center gap-2 px-4 group-data-[size=sm]/card:px-3", className)} {...props} />;
}

export { Card, CardAction, CardContent, CardDescription, CardFooter, CardHeader, CardTitle, cardVariants };
