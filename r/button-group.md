# Button group
Keys joined into one bar: the first keeps the cut corner, the others square off and share a 1px line. Holds fields, selects and a Fog text segment for a fixed prefix or suffix.

Install: npx mireye-ds add button-group
Requires: theme, utils
Packages: @chakra-ui/react, class-variance-authority
Exports: ButtonGroup, ButtonGroupSeparator, ButtonGroupText, buttonGroupVariants
Client boundary: yes
Reference: Drawn from Figma "UI · Buttons" (442:3) and "UI · Inputs" (442:107); the design has no joined keys


## Usage
Use for a set of related actions or a split key (an action and its options), a field with a fixed unit or prefix (ButtonGroupText), or a vertical zoom pair on a map. Nest groups for 8px between sets.
- Avoid: Rounded or separately cut keys inside one bar
- Avoid: Mixing filled and framed keys in one bar
- Avoid: A group of more than five keys (use a Select or a menu)


## Examples
Example components: npx mireye-ds add button-group button input
Example packages: @phosphor-icons/react
[Preview](https://mireye-ds.agencidev.com/preview/button-group/Preview) | [WithField](https://mireye-ds.agencidev.com/preview/button-group/WithField) | [Split](https://mireye-ds.agencidev.com/preview/button-group/Split) | [Vertical](https://mireye-ds.agencidev.com/preview/button-group/Vertical)

examples/button-group.tsx

```tsx
import { CaretDownIcon, MinusIcon, PlusIcon } from "@phosphor-icons/react/ssr";

import { Button } from "@/components/ui/button";
import { ButtonGroup, ButtonGroupSeparator, ButtonGroupText } from "@/components/ui/button-group";
import { Input } from "@/components/ui/input";

export function Preview() {
  return (
    <ButtonGroup aria-label="Map layers">
      <Button variant="outline">Parcels</Button>
      <Button variant="outline">Substations</Button>
      <Button variant="outline">Floodplain</Button>
    </ButtonGroup>
  );
}

export function WithField() {
  return (
    <ButtonGroup className="w-full max-w-90">
      <ButtonGroupText>Min</ButtonGroupText>
      <Input aria-label="Minimum voltage" placeholder="e.g. 138" inputMode="numeric" />
      <ButtonGroupText>kV</ButtonGroupText>
    </ButtonGroup>
  );
}

export function Split() {
  return (
    <ButtonGroup>
      <Button arrow>Find sites</Button>
      <ButtonGroupSeparator />
      <Button size="icon" aria-label="More search options">
        <CaretDownIcon />
      </Button>
    </ButtonGroup>
  );
}

export function Vertical() {
  return (
    <ButtonGroup orientation="vertical" aria-label="Zoom">
      <Button variant="outline" size="icon" aria-label="Zoom in">
        <PlusIcon />
      </Button>
      <Button variant="outline" size="icon" aria-label="Zoom out">
        <MinusIcon />
      </Button>
    </ButtonGroup>
  );
}

```

## Source

components/ui/button-group.tsx

```tsx
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

```
