# Toggle group
A choice among a few: a segmented track in the field's frame (36px, Bone, 1px Stone line, the cut) whose chosen item is a Forest key with a Bone label. The outline variant is a row of framed toggles, joined with spacing 0.

Install: npx mireye-ds add toggle-group
Requires: theme, toggle, utils
Packages: radix-ui, class-variance-authority
Exports: ToggleGroup, ToggleGroupItem
Client boundary: yes
Reference: Not in Figma; drawn from "UI · Buttons" (442:3) and the field frame (442:107)


## Usage
Use for switching a view (Map, List, Compare), a unit or a distance band, with two to five short options. Use type single for one choice and multiple for layers. For more options or long labels use Select or Radio Group. A row too wide for its container fades at the side (fade-x) where more items scroll past it.
- Avoid: A sliding or animated chosen item
- Avoid: More than five items
- Avoid: Icons without labels unless each has an aria-label


## Examples
Example components: npx mireye-ds add toggle-group
[Preview](https://mireye-ds.agencidev.com/preview/toggle-group/Preview) | [Outline](https://mireye-ds.agencidev.com/preview/toggle-group/Outline) | [Sizes](https://mireye-ds.agencidev.com/preview/toggle-group/Sizes)

examples/toggle-group.tsx

```tsx
"use client";

import * as React from "react";

import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

export function Preview() {
  const [view, setView] = React.useState("map");
  return (
    <ToggleGroup type="single" value={view} onValueChange={(v) => v && setView(v)} aria-label="View">
      <ToggleGroupItem value="map">Map</ToggleGroupItem>
      <ToggleGroupItem value="list">List</ToggleGroupItem>
      <ToggleGroupItem value="compare">Compare</ToggleGroupItem>
    </ToggleGroup>
  );
}

export function Outline() {
  return (
    <ToggleGroup type="multiple" variant="outline" spacing={0} defaultValue={["parcels"]} aria-label="Layers">
      <ToggleGroupItem value="parcels">Parcels</ToggleGroupItem>
      <ToggleGroupItem value="substations">Substations</ToggleGroupItem>
      <ToggleGroupItem value="wetlands">Wetlands</ToggleGroupItem>
    </ToggleGroup>
  );
}

export function Sizes() {
  return (
    <div className="grid gap-3">
      <ToggleGroup type="single" size="sm" defaultValue="ac" aria-label="Area unit">
        <ToggleGroupItem value="ac">ac</ToggleGroupItem>
        <ToggleGroupItem value="ha">ha</ToggleGroupItem>
      </ToggleGroup>
      <ToggleGroup type="single" size="lg" defaultValue="30" aria-label="Distance">
        <ToggleGroupItem value="10">10 mi</ToggleGroupItem>
        <ToggleGroupItem value="30">30 mi</ToggleGroupItem>
        <ToggleGroupItem value="60">60 mi</ToggleGroupItem>
      </ToggleGroup>
    </div>
  );
}

```

## Source

components/ui/toggle-group.tsx

```tsx
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
        variant === "default" && "ds-cut-frame overflow-x-auto fade-x p-px [--ds-shape-fill:var(--ds-color-bg-default)] [--ds-shape-stroke:var(--ds-color-border-default)] [scrollbar-width:none]",
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

```
