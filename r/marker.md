# Marker
A 12px muted note in a conversation or list: a date between Mist rules, an event with a glyph, or the Forest line where new results begin.

Install: npx mireye-ds add marker
Requires: theme, utils
Packages: @chakra-ui/react, class-variance-authority
Exports: Marker, MarkerContent, MarkerIcon, markerVariants
Client boundary: yes
Reference: Not in Figma: Mist and Forest rules from Cited fields (443:470), for a designer's review


## Usage
Use between messages or rows to mark time (Yesterday, Oct 28), a change the agent made (Search widened to 25 mi), or where new results start (variant unread). Keep it one short line; links inside are underlined.
- Avoid: Coloured markers
- Avoid: Markers as headings
- Avoid: Bold text
- Avoid: More than one unread marker in a list


## Examples
Example components: npx mireye-ds add marker
Example packages: @phosphor-icons/react
[Preview](https://mireye-ds.agencidev.com/preview/marker/Preview) | [Variants](https://mireye-ds.agencidev.com/preview/marker/Variants)

examples/marker.tsx

```tsx
import { MagnifyingGlassIcon, StackIcon } from "@phosphor-icons/react/ssr";

import { Marker, MarkerContent, MarkerIcon } from "@/components/ui/marker";

export function Preview() {
  return (
    <div className="mx-auto grid w-full max-w-120 gap-5">
      <Marker variant="separator">
        <MarkerContent>Yesterday</MarkerContent>
      </Marker>
      <Marker>
        <MarkerIcon>
          <MagnifyingGlassIcon />
        </MarkerIcon>
        <MarkerContent>Search widened to 25 mi from Waxahachie</MarkerContent>
      </Marker>
      <Marker variant="unread">
        <MarkerContent>3 new sites</MarkerContent>
      </Marker>
    </div>
  );
}

export function Variants() {
  return (
    <div className="mx-auto grid w-full max-w-120 gap-5">
      <Marker variant="border">
        <MarkerContent>Saved searches</MarkerContent>
      </Marker>
      <Marker>
        <MarkerIcon>
          <StackIcon />
        </MarkerIcon>
        <MarkerContent>
          Ellis County site 14 added to Shortlist. <a href="#shortlist">View shortlist</a>
        </MarkerContent>
      </Marker>
      <Marker variant="separator">
        <MarkerContent>Oct 28</MarkerContent>
      </Marker>
    </div>
  );
}

```

## Source

components/ui/marker.tsx

```tsx
"use client";

import * as React from "react";
import { chakra } from "@chakra-ui/react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

// A marker in a conversation or a list: 12px text in Forest at 72%, as a run log sets its times. `separator` centers it
// between two 1px Mist rules ("Yesterday"), `border` rules it underneath, and `unread` is the Forest line, medium,
// between two 1px Forest rules, where new results begin. Links inside are underlined and step to Forest on hover.
const markerVariants = cva(
  "group/marker relative flex min-h-4 w-full items-center gap-2 text-left font-sans text-caption leading-tight text-fg-muted [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 [a]:underline [a]:underline-offset-4 [a]:hover:text-fg",
  {
    variants: {
      variant: {
        default: "",
        separator: "before:mr-1 before:h-px before:min-w-0 before:flex-1 before:bg-line-subtle after:ml-1 after:h-px after:min-w-0 after:flex-1 after:bg-line-subtle",
        border: "border-b border-line-subtle pb-2",
        unread: "font-medium text-fg before:mr-1 before:h-px before:min-w-0 before:flex-1 before:bg-line-strong after:ml-1 after:h-px after:min-w-0 after:flex-1 after:bg-line-strong",
      },
    },
    defaultVariants: { variant: "default" },
  },
);

function Marker({ className, variant = "default", asChild = false, ...props }: React.ComponentProps<"div"> & VariantProps<typeof markerVariants> & { asChild?: boolean }) {
  const Comp = asChild ? chakra.div : "div";
  // Chakra's factory renders its child in its place only when told to.
  const slotProps = asChild ? { asChild: true } : {};
  return <Comp {...slotProps} data-slot="marker" data-variant={variant} role={variant === "default" ? undefined : "separator"} className={cn(markerVariants({ variant }), className)} {...props} />;
}

function MarkerIcon({ className, ...props }: React.ComponentProps<"span">) {
  return <span data-slot="marker-icon" aria-hidden="true" className={cn("inline-flex size-4 shrink-0 items-center justify-center [&_svg:not([class*='size-'])]:size-4", className)} {...props} />;
}

function MarkerContent({ className, ...props }: React.ComponentProps<"span">) {
  return <span data-slot="marker-content" className={cn("min-w-0 break-words group-data-[variant=separator]/marker:flex-none group-data-[variant=separator]/marker:text-center group-data-[variant=unread]/marker:flex-none *:[a]:underline *:[a]:underline-offset-4 *:[a]:hover:text-fg", className)} {...props} />;
}

export { Marker, MarkerContent, MarkerIcon, markerVariants };

```
