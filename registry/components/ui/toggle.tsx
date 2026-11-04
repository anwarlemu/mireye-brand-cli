"use client";

import * as React from "react";
import { Toggle as TogglePrimitive } from "radix-ui";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

// A key that stays pressed (Figma has none; drawn from the keys on "UI · Buttons", 442:3, at the product scale): 36px
// with the compact 6px cut, a 13px medium label in 80% Forest and 16px glyphs. Off it has no fill and its label turns
// Forest under the pointer while a Fog fill steps in over 150ms; on it holds a Mist fill with a Forest label (the
// pressed step). `outline` is the framed key: white inside a 1px Stone line, Fog under the pointer, and on it takes a
// Forest line on Fog. Pressing sets the fill at once; nothing moves. Keyboard focus is the 1px Forest outline 2px
// outside; disabled turns the label Slate. In a ToggleGroup the default variant becomes the segmented track.
const toggleVariants = cva(
  [
    "inline-flex shrink-0 cursor-pointer items-center justify-center gap-2 font-sans text-body leading-tight font-medium whitespace-nowrap text-fg-secondary outline-none select-none [--ds-cut:var(--ds-cut-md)]",
    "transition-[color] duration-fast ease-out after:transition-[background-color] after:duration-fast after:ease-out active:after:duration-0 motion-reduce:transition-none motion-reduce:after:transition-none",
    "hover:text-fg data-[state=on]:text-fg",
    "focus-visible:outline-solid focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-line-strong",
    "disabled:pointer-events-none disabled:text-fg-subtle aria-invalid:text-danger",
    "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([data-slot]):not([class*='size-'])]:size-4",
  ],
  {
    variants: {
      variant: {
        default:
          "ds-cut [--ds-shape-fill:transparent] hover:[--ds-shape-fill:var(--ds-color-bg-subtle)] active:[--ds-shape-fill:var(--ds-color-bg-subtle-hover)] data-[state=on]:[--ds-shape-fill:var(--ds-color-bg-subtle-hover)]",
        outline:
          "ds-cut-frame [--ds-shape-fill:var(--ds-color-bg-default)] [--ds-shape-stroke:var(--ds-color-border-default)] hover:[--ds-shape-fill:var(--ds-color-bg-subtle)] active:[--ds-shape-fill:var(--ds-color-bg-subtle-hover)] data-[state=on]:[--ds-shape-fill:var(--ds-color-bg-subtle)] data-[state=on]:[--ds-shape-stroke:var(--ds-color-border-strong)]",
      },
      size: {
        default: "h-9 min-w-9 px-3",
        sm: "h-8 min-w-8 px-2",
        lg: "h-10 min-w-10 px-4",
      },
    },
    defaultVariants: { variant: "default", size: "default" },
  },
);

function Toggle({ className, variant, size, ...props }: React.ComponentProps<typeof TogglePrimitive.Root> & VariantProps<typeof toggleVariants>) {
  return <TogglePrimitive.Root data-slot="toggle" className={cn(toggleVariants({ variant, size, className }))} {...props} />;
}

export { Toggle, toggleVariants };
