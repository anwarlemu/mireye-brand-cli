# Separator
A 1px rule in Mist inside a panel, or Stone at a panel's edge (strong), across or down.

Install: npx mireye-ds add separator
Requires: theme, utils
Packages: @chakra-ui/react
Exports: Separator
Client boundary: yes
Reference: Figma UI · Agent chat (443:433): the Mist rules of Cited fields (443:470)


## Usage
Use between groups inside a Bone panel (rows of values, the parts of a card, toolbar groups with orientation="vertical"). Set strong for the rule under a table head or at the edge of a panel. It is decorative unless you set decorative={false}.
- Avoid: Forest rules between rows
- Avoid: Double rules
- Avoid: Dashed rules
- Avoid: Rules thicker than 1px


## Examples
Example components: npx mireye-ds add separator
[Preview](https://mireye-ds.agencidev.com/preview/separator/Preview) | [Strong](https://mireye-ds.agencidev.com/preview/separator/Strong)

examples/separator.tsx

```tsx
import { Separator } from "@/components/ui/separator";

export function Preview() {
  return (
    <div className="w-full max-w-96">
      <p className="text-body text-fg">Ellis County site 14</p>
      <p className="font-mono text-caption text-fg-muted">32.4113, -96.8302</p>
      <Separator className="my-4" />
      <div className="flex h-5 items-center gap-4 text-body whitespace-nowrap text-fg">
        <span>Parcel</span>
        <Separator orientation="vertical" />
        <span>Power</span>
        <Separator orientation="vertical" />
        <span>Water</span>
      </div>
    </div>
  );
}

export function Strong() {
  return (
    <div className="grid w-full max-w-96 gap-3 text-body">
      <p className="text-caption text-fg-secondary">Requirements</p>
      <Separator strong />
      <p className="text-fg">200+ ac within Ellis County</p>
      <Separator />
      <p className="text-fg">138 kV substation within 2 mi</p>
    </div>
  );
}

```

## Source

components/ui/separator.tsx

```tsx
"use client";

import * as React from "react";
import { Separator as ChakraSeparator } from "@chakra-ui/react";

import { cn } from "@/lib/utils";

// Mireye's rules: 1px Mist between parts inside a panel (the Cited fields rules, Figma 443:470), 1px Stone at a panel's
// edge or under a table head (`strong`). Square, never dashed. Decorative by default.
function Separator({
  className,
  orientation = "horizontal",
  decorative = true,
  strong = false,
  ...props
}: Omit<React.ComponentProps<typeof ChakraSeparator>, "orientation"> & { orientation?: "horizontal" | "vertical"; decorative?: boolean; strong?: boolean }) {
  return (
    <ChakraSeparator
      unstyled
      data-slot="separator"
      aria-hidden={decorative || undefined}
      orientation={orientation}
      className={cn(
        "shrink-0 data-[orientation=horizontal]:h-px data-[orientation=horizontal]:w-full data-[orientation=vertical]:h-full data-[orientation=vertical]:w-px",
        strong ? "bg-line" : "bg-line-subtle",
        className,
      )}
      {...props}
    />
  );
}

export { Separator };

```
