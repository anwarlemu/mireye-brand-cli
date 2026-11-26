# Collapsible
A part that shows and hides in place, opening with its height; the trigger is the row it sits in.

Install: npx mireye-ds add collapsible
Requires: theme, utils
Packages: @chakra-ui/react
Exports: Collapsible, CollapsibleContent, CollapsibleTrigger
Client boundary: yes
Reference: Not in Figma: built from the arrow head (UI · Buttons, 442:3) and the cut frame, for a designer's review


## Usage
Use for one optional group (search settings under a query, the layers behind a value). Make the trigger the whole row: a 13px label with Mireye's chevron (ArrowRightIcon with head, turned 90 degrees) at the right that turns when open. In a cut-frame panel let the content open at once (see Section). For several sections, use Accordion.
- Avoid: Hiding required fields in it
- Avoid: A trigger without a chevron
- Avoid: Animating anything but the content height and the chevron's turn
- Avoid: A chevron that moves on hover


## Examples
Example components: npx mireye-ds add collapsible icons
[Preview](https://mireye-ds.agencidev.com/preview/collapsible/Preview) | [Section](https://mireye-ds.agencidev.com/preview/collapsible/Section)

examples/collapsible.tsx

```tsx
"use client";

import * as React from "react";

import { ArrowRightIcon } from "@/components/icons/arrow-right";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

const TRIGGER =
  "group flex w-full cursor-pointer items-center justify-between gap-4 py-2 text-left text-body text-fg outline-none focus-visible:outline-solid focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-line-strong";
const CHEVRON = "shrink-0 rotate-90 text-fg-muted transition-[rotate,color] duration-base ease-out group-hover:text-fg group-data-[state=open]:-rotate-90 motion-reduce:transition-none";

export function Preview() {
  const [open, setOpen] = React.useState(false);
  return (
    <Collapsible open={open} onOpenChange={setOpen} className="w-full max-w-120">
      <CollapsibleTrigger className={TRIGGER}>
        Search settings: radius, minimum acres, voltage
        <ArrowRightIcon size={16} head aria-hidden className={CHEVRON} />
      </CollapsibleTrigger>
      <CollapsibleContent>
        <dl className="grid grid-cols-[8rem_1fr] gap-x-4 gap-y-2 pt-3 text-body">
          <dt className="text-caption text-fg-secondary">Radius</dt>
          <dd className="text-fg">25 mi from Waxahachie, TX</dd>
          <dt className="text-caption text-fg-secondary">Minimum size</dt>
          <dd className="text-fg">200 ac</dd>
          <dt className="text-caption text-fg-secondary">Voltage</dt>
          <dd className="text-fg">138 kV or above</dd>
        </dl>
      </CollapsibleContent>
    </Collapsible>
  );
}

/** A collapsible section in a white cut-frame panel whose content opens at once. */
export function Section() {
  return (
    <Collapsible defaultOpen className="ds-cut-frame w-full max-w-120 px-4 py-3 [--ds-shape-fill:var(--ds-color-bg-default)] [--ds-shape-stroke:var(--ds-color-border-default)]">
      <CollapsibleTrigger className={TRIGGER}>
        Excluded counties
        <ArrowRightIcon size={16} head aria-hidden className={CHEVRON} />
      </CollapsibleTrigger>
      <CollapsibleContent className="data-[state=closed]:animate-none data-[state=open]:animate-none">
        <p className="pt-1 pb-1 text-body text-fg-muted">Dallas and Tarrant are left out of the search. Their parcels never appear in results.</p>
      </CollapsibleContent>
    </Collapsible>
  );
}

```

## Source

components/ui/collapsible.tsx

```tsx
"use client";

import * as React from "react";
import { Collapsible as ChakraCollapsible } from "@chakra-ui/react";

import { cn } from "@/lib/utils";

// A part that shows and hides in place. The parts carry no look of their own beyond the motion: the content opens with
// its height (the collapsible keyframes, under 200ms, ease-out). Style the trigger as the row it is: a 13px label with
// Mireye's chevron (ArrowRightIcon head, turned) at the right (see the example).
type CollapsibleProps = Omit<React.ComponentProps<typeof ChakraCollapsible.Root>, "onOpenChange"> & { onOpenChange?: (open: boolean) => void };
function Collapsible({ onOpenChange, ...props }: CollapsibleProps) {
  return <ChakraCollapsible.Root unstyled data-slot="collapsible" onOpenChange={(details) => onOpenChange?.(details.open)} {...props} />;
}

function CollapsibleTrigger(props: React.ComponentProps<typeof ChakraCollapsible.Trigger>) {
  return <ChakraCollapsible.Trigger unstyled data-slot="collapsible-trigger" {...props} />;
}

function CollapsibleContent({ className, ...props }: React.ComponentProps<typeof ChakraCollapsible.Content>) {
  return <ChakraCollapsible.Content unstyled data-slot="collapsible-content" className={cn("overflow-hidden data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down", className)} {...props} />;
}

export { Collapsible, CollapsibleContent, CollapsibleTrigger };

```
