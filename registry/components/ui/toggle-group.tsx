"use client";

import * as React from "react";
import { ToggleGroup as ToggleGroupPrimitive } from "radix-ui";
import { type VariantProps } from "class-variance-authority";

import { toggleVariants } from "@/components/ui/toggle";
import { cn } from "@/lib/utils";

// A choice among a few (Figma has none; drawn from the keys and fields at the product scale). The default is the
// segmented track: Input's frame (white, 1px Stone line, the 8px cut) holding 32px choices 1px in, so the track is
// 36px like a field. Choices have no fill and an 80% Forest label that turns Forest under the pointer; the chosen
// one is a Forest key with a white label, the first one cut to sit inside the track's corner. Choosing is instant (no
// sliding key): it is done often and must feel immediate. `variant="outline"` drops the track: separate framed
// keys (see Toggle), joined into one bar with `spacing={0}`.
const ToggleGroupContext = React.createContext<VariantProps<typeof toggleVariants> & { spacing?: number; orientation?: "horizontal" | "vertical" }>({
  size: "default",
  variant: "default",
  spacing: 2,
  orientation: "horizontal",
});

function ToggleGroup({
  className,
  variant = "default",
  size = "default",
  spacing = 2,
  orientation = "horizontal",
  children,
  ...props
}: React.ComponentProps<typeof ToggleGroupPrimitive.Root> & VariantProps<typeof toggleVariants> & { spacing?: number; orientation?: "horizontal" | "vertical" }) {
  return (
    <ToggleGroupPrimitive.Root
      data-slot="toggle-group"
      data-variant={variant}
      data-size={size}
      data-spacing={spacing}
      data-orientation={orientation}
      orientation={orientation}
      style={{ "--gap": spacing } as React.CSSProperties}
      className={cn(
        "group/toggle-group flex w-fit max-w-full items-center gap-[calc(var(--spacing)*var(--gap))] data-[orientation=vertical]:flex-col data-[orientation=vertical]:items-stretch",
        variant === "default" && "ds-cut-frame overflow-x-auto p-px [--ds-shape-fill:var(--ds-color-bg-default)] [--ds-shape-stroke:var(--ds-color-border-default)] [scrollbar-width:none]",
        variant === "outline" && spacing === 0 && "data-[orientation=horizontal]:[&>*:not(:first-child)]:-ml-px data-[orientation=vertical]:[&>*:not(:first-child)]:-mt-px [&>*:not(:first-child)]:[--ds-cut:0px]",
        className,
      )}
      {...props}
    >
      <ToggleGroupContext.Provider value={{ variant, size, spacing, orientation }}>{children}</ToggleGroupContext.Provider>
    </ToggleGroupPrimitive.Root>
  );
}

function ToggleGroupItem({ className, children, variant, size, ...props }: React.ComponentProps<typeof ToggleGroupPrimitive.Item> & VariantProps<typeof toggleVariants>) {
  const context = React.useContext(ToggleGroupContext);
  const v = context.variant || variant || "default";
  return (
    <ToggleGroupPrimitive.Item
      data-slot="toggle-group-item"
      data-variant={v}
      data-size={context.size || size}
      data-spacing={context.spacing}
      className={cn(
        toggleVariants({ variant: v, size: context.size || size }),
        // In the track the chosen choice is the Forest key; only the first keeps a cut, inside the track's corner.
        v === "default" && "not-first:[--ds-cut:0px] data-[state=on]:text-on-primary data-[state=on]:[--ds-shape-fill:var(--ds-color-action-primary)] data-[state=on]:hover:[--ds-shape-fill:var(--ds-color-action-primary)] group-data-[size=default]/toggle-group:h-8 group-data-[size=sm]/toggle-group:h-7 group-data-[size=lg]/toggle-group:h-9",
        "focus-visible:z-10",
        className,
      )}
      {...props}
    >
      {children}
    </ToggleGroupPrimitive.Item>
  );
}

export { ToggleGroup, ToggleGroupItem };
