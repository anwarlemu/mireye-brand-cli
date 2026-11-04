"use client";

import * as React from "react";
import { chakra } from "@chakra-ui/react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";

// A row of content: a site in a result list (name and coordinates over its tags), a source behind an answer, a row in
// a rail. `default` is bare; a row that is a link or button fills with Fog under the pointer and Mist when pressed
// (150ms), and a current one (aria-current or data-selected) sits on Mist, the rail's current row. `outline` is a
// white row in the 1px Stone line; `muted` is Fog. Square throughout; nothing moves.
function ItemGroup({ className, ...props }: React.ComponentProps<"div">) {
  return <div role="list" data-slot="item-group" className={cn("group/item-group flex flex-col", className)} {...props} />;
}

function ItemSeparator({ className, ...props }: React.ComponentProps<typeof Separator>) {
  return <Separator data-slot="item-separator" orientation="horizontal" className={cn("my-0.5", className)} {...props} />;
}

const itemVariants = cva(
  "group/item flex flex-wrap items-center border border-transparent font-sans text-body leading-body text-fg outline-none transition-[background-color] duration-fast ease-out focus-visible:outline-solid focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-line-strong motion-reduce:transition-none [a]:hover:bg-subtle [button]:hover:bg-subtle [a]:active:bg-subtle-hover [button]:active:bg-subtle-hover aria-[current=page]:bg-subtle-hover aria-[current=true]:bg-subtle-hover data-[selected=true]:bg-subtle-hover aria-[current=page]:hover:bg-subtle-hover aria-[current=true]:hover:bg-subtle-hover data-[selected=true]:hover:bg-subtle-hover",
  {
    variants: {
      variant: {
        default: "bg-transparent",
        outline: "border-line bg-surface",
        muted: "bg-subtle [a]:hover:bg-subtle-hover [button]:hover:bg-subtle-hover",
      },
      size: {
        default: "gap-3 p-3",
        sm: "min-h-9 gap-2.5 px-3 py-1.5",
        xs: "gap-2 px-2 py-1",
      },
    },
    defaultVariants: { variant: "default", size: "default" },
  },
);

function Item({ className, variant = "default", size = "default", asChild = false, ...props }: React.ComponentProps<"div"> & VariantProps<typeof itemVariants> & { asChild?: boolean }) {
  const Comp = asChild ? chakra.div : "div";
  // Chakra's factory renders its child in its place only when told to.
  const slotProps = asChild ? { asChild: true } : {};
  return <Comp {...slotProps} data-slot="item" data-variant={variant} data-size={size} className={cn(itemVariants({ variant, size, className }))} {...props} />;
}

const itemMediaVariants = cva("flex shrink-0 items-center justify-center gap-2 group-has-data-[slot=item-description]/item:self-start [&_svg]:pointer-events-none", {
  variants: {
    variant: {
      default: "bg-transparent",
      icon: "text-fg [&_svg:not([class*='size-'])]:size-4",
      image: "h-9 w-12 overflow-hidden bg-subtle [&_img]:size-full [&_img]:object-cover",
    },
  },
  defaultVariants: { variant: "default" },
});

function ItemMedia({ className, variant = "default", ...props }: React.ComponentProps<"div"> & VariantProps<typeof itemMediaVariants>) {
  return <div data-slot="item-media" data-variant={variant} className={cn(itemMediaVariants({ variant, className }))} {...props} />;
}

function ItemContent({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="item-content" className={cn("flex min-w-0 flex-1 flex-col gap-1 [&+[data-slot=item-content]]:flex-none", className)} {...props} />;
}

function ItemTitle({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="item-title" className={cn("flex w-fit min-w-0 items-center gap-2 text-body leading-tight text-fg", className)} {...props} />;
}

/** The muted line under a title (coordinates, a count, a source), clamped to two lines. */
function ItemDescription({ className, ...props }: React.ComponentProps<"p">) {
  return <p data-slot="item-description" className={cn("line-clamp-2 text-caption leading-tight font-normal text-balance text-fg-muted [&>a]:underline [&>a]:underline-offset-4", className)} {...props} />;
}

function ItemActions({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="item-actions" className={cn("flex items-center gap-1", className)} {...props} />;
}

/** The top line of an item: what it is at the left (a tag, a county), when or where at the right (a date, a distance). */
function ItemHeader({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="item-header" className={cn("flex basis-full items-center justify-between gap-2 text-body leading-tight", className)} {...props} />;
}

function ItemFooter({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="item-footer" className={cn("flex basis-full items-center justify-between gap-2", className)} {...props} />;
}

export { Item, ItemActions, ItemContent, ItemDescription, ItemFooter, ItemGroup, ItemHeader, ItemMedia, ItemSeparator, ItemTitle };
