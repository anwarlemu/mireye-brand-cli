"use client";

import * as React from "react";
import { chakra } from "@chakra-ui/react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

// Keys joined into one control. Only the group's first key keeps the cut corner: the others square off (their cut set
// to 0) and step 1px over their neighbor, so two framed keys share one line, as a field and its unit do. A field,
// select or text segment can sit in the bar. ButtonGroupText is a Fog segment inside the Stone line with 12px caption
// text, for a fixed prefix or suffix (kV, ac). ButtonGroupSeparator is a 1px rule between filled keys (Stone, or the
// dark track on Forest keys). Groups nest with 8px between them.
const buttonGroupVariants = cva(
  "group/button-group flex w-fit items-stretch *:focus-visible:relative *:focus-visible:z-10 *:focus-within:z-10 has-[>[data-slot=button-group]]:gap-2 [&>input]:flex-1",
  {
    variants: {
      orientation: {
        horizontal: "[&>*:not(:first-child)]:-ml-px [&>*:not(:first-child)]:[--ds-cut:0px]",
        vertical: "flex-col [&>*:not(:first-child)]:-mt-px [&>*:not(:first-child)]:[--ds-cut:0px]",
      },
    },
    defaultVariants: { orientation: "horizontal" },
  },
);

function ButtonGroup({ className, orientation, ...props }: React.ComponentProps<"div"> & VariantProps<typeof buttonGroupVariants>) {
  return <div role="group" data-slot="button-group" data-orientation={orientation ?? "horizontal"} className={cn(buttonGroupVariants({ orientation }), className)} {...props} />;
}

function ButtonGroupText({ className, asChild = false, ...props }: React.ComponentProps<"div"> & { asChild?: boolean }) {
  const Comp = asChild ? chakra.div : "div";
  // Chakra's factory renders its child in its place only when told to.
  const slotProps = asChild ? { asChild: true } : {};
  return (
    <Comp
      {...slotProps}
      data-slot="button-group-text"
      className={cn(
        "ds-cut-frame flex h-9 items-center gap-2 px-3 font-sans text-caption leading-tight whitespace-nowrap text-fg-secondary [--ds-shape-fill:var(--ds-color-bg-subtle)] [--ds-shape-stroke:var(--ds-color-border-default)] [&_svg]:pointer-events-none [&_svg:not([data-slot=icon]):not([class*='size-'])]:size-4",
        className,
      )}
      {...props}
    />
  );
}

function ButtonGroupSeparator({ className, orientation = "vertical", ...props }: React.ComponentProps<"div"> & { orientation?: "horizontal" | "vertical" }) {
  return (
    <div
      role="separator"
      aria-orientation={orientation}
      data-slot="button-group-separator"
      data-orientation={orientation}
      className={cn(
        "relative z-10 shrink-0 self-stretch bg-line group-has-[>[data-variant=default]]/button-group:bg-track-dark",
        // A separator takes no room: the keys still meet under it.
        orientation === "vertical" ? "-mr-px w-px" : "-mb-px h-px",
        className,
      )}
      {...props}
    />
  );
}

export { ButtonGroup, ButtonGroupSeparator, ButtonGroupText, buttonGroupVariants };
