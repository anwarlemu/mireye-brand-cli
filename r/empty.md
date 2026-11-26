# Empty
A centered empty state: the survey node (an outlined diamond where two 1px rules cross) or a square glyph tile, a 16px regular title, a muted line and one action.

Install: npx mireye-ds add empty
Requires: theme, diamond, utils
Packages: class-variance-authority
Exports: Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMark, EmptyMedia, EmptyTitle
Client boundary: not required by this entry file
Reference: Brand principles (thin rules with nodes at their crossings) and the Diamond node, for a designer's review


## Usage
Use where a list, map panel or report has nothing to show yet (No sites yet, No parcels match, No site selected). Use EmptyMark for the first-run state of a main view and EmptyMedia variant="icon" with a Phosphor glyph for a filtered or selection state. Say what is missing and what to do next; offer at most one action.
- Avoid: Illustrations or mascots
- Avoid: Rounded or circular glyph tiles
- Avoid: More than one action
- Avoid: Bold titles
- Avoid: Motion


## Examples
Example components: npx mireye-ds add empty button
Example packages: @phosphor-icons/react
[Preview](https://mireye-ds.agencidev.com/preview/empty/Preview) | [NoResults](https://mireye-ds.agencidev.com/preview/empty/NoResults) | [NoSelection](https://mireye-ds.agencidev.com/preview/empty/NoSelection)

examples/empty.tsx

```tsx
import { MagnifyingGlassIcon, MapPinIcon } from "@phosphor-icons/react/ssr";

import { Button } from "@/components/ui/button";
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMark, EmptyMedia, EmptyTitle } from "@/components/ui/empty";

export function Preview() {
  return (
    <Empty className="min-h-90">
      <EmptyMedia>
        <EmptyMark />
      </EmptyMedia>
      <EmptyHeader>
        <EmptyTitle>No sites yet</EmptyTitle>
        <EmptyDescription>Describe the land you need, and matching sites appear here with their sources.</EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <Button>Start a search</Button>
      </EmptyContent>
    </Empty>
  );
}

export function NoResults() {
  return (
    <Empty className="min-h-72">
      <EmptyMedia variant="icon">
        <MagnifyingGlassIcon />
      </EmptyMedia>
      <EmptyHeader>
        <EmptyTitle>No parcels match</EmptyTitle>
        <EmptyDescription>Nothing in Ellis County is over 200 ac within 2 mi of 138 kV. Widen the radius or lower the voltage.</EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <Button variant="outline">Edit requirements</Button>
      </EmptyContent>
    </Empty>
  );
}

export function NoSelection() {
  return (
    <Empty className="min-h-72">
      <EmptyMedia variant="icon">
        <MapPinIcon />
      </EmptyMedia>
      <EmptyHeader>
        <EmptyTitle>No site selected</EmptyTitle>
        <EmptyDescription>Choose a site on the map to read its report.</EmptyDescription>
      </EmptyHeader>
    </Empty>
  );
}

```

## Source

components/ui/empty.tsx

```tsx
import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { Diamond } from "@/components/ui/diamond";
import { cn } from "@/lib/utils";

// An empty state, as a survey sheet with nothing on it yet. Centered: the media, a 16px regular Forest title, a 13px
// description in Forest at 72% (at most 280px wide), then the action. Media: `icon` is a 40px white square with the
// 1px Stone line and a 20px glyph; EmptyMark is the brand's survey node, an outlined diamond where two 1px rules cross
// (the principles' "thin rules with nodes at their crossings"). Nothing moves: an empty state is seen every time the
// page loads.
function Empty({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="empty" className={cn("flex min-w-0 flex-1 flex-col items-center justify-center gap-5 p-6 text-center text-balance", className)} {...props} />;
}

function EmptyHeader({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="empty-header" className={cn("flex max-w-sm flex-col items-center gap-2", className)} {...props} />;
}

const emptyMediaVariants = cva("flex shrink-0 items-center justify-center [&_svg]:pointer-events-none [&_svg]:shrink-0", {
  variants: {
    variant: {
      default: "bg-transparent",
      icon: "size-10 border border-line bg-surface text-fg [&_svg:not([class*='size-'])]:size-5",
    },
  },
  defaultVariants: { variant: "default" },
});

function EmptyMedia({ className, variant = "default", ...props }: React.ComponentProps<"div"> & VariantProps<typeof emptyMediaVariants>) {
  return <div data-slot="empty-media" data-variant={variant} className={cn(emptyMediaVariants({ variant }), className)} {...props} />;
}

/** The survey node: an outlined Forest diamond where a 1px Stone rule across meets one down, 120 by 72px. */
function EmptyMark({ className, ...props }: React.ComponentProps<"span">) {
  return (
    <span data-slot="empty-mark" aria-hidden className={cn("relative flex h-18 w-30 items-center justify-center text-fg", className)} {...props}>
      <span className="absolute inset-x-0 top-1/2 h-px bg-line" />
      <span className="absolute inset-y-0 left-1/2 w-px bg-line" />
      <Diamond size={20} variant="outline" fill="var(--ds-color-bg-default)" className="relative" />
    </span>
  );
}

function EmptyTitle({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="empty-title" className={cn("font-sans text-h3 leading-heading font-normal text-fg", className)} {...props} />;
}

function EmptyDescription({ className, ...props }: React.ComponentProps<"p">) {
  return <p data-slot="empty-description" className={cn("max-w-70 text-body leading-body text-pretty text-fg-muted [&>a]:text-fg [&>a]:underline [&>a]:underline-offset-4", className)} {...props} />;
}

function EmptyContent({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="empty-content" className={cn("flex w-full max-w-sm min-w-0 flex-col items-center gap-3 text-body text-balance", className)} {...props} />;
}

export { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMark, EmptyMedia, EmptyTitle };

```
