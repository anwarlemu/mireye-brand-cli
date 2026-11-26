# Scroll Area
A region that scrolls inside the page with a thin square Stone bar that steps to Slate under the pointer.

Install: npx mireye-ds add scroll-area
Requires: theme, utils
Packages: @chakra-ui/react
Exports: ScrollArea, ScrollBar
Client boundary: yes
Reference: Not in Figma: Stone and Slate from the product greys (442:2), for a designer's review


## Usage
Use for a panel with its own scroll (a list of sites or counties, the sources of an answer, a row of tags) inside a fixed-height layout. Give it a height (h-72, flex-1 in a column). Add a horizontal ScrollBar for wide content. Its edges fade (fade-xy) where more content scrolls past them, either way; nothing is cut off by a hard edge.
- Avoid: Nested scroll areas in the same direction
- Avoid: Rounded thumbs
- Avoid: A Forest thumb
- Avoid: Hiding the bar entirely on desktop


## Examples
Example components: npx mireye-ds add scroll-area separator
[Preview](https://mireye-ds.agencidev.com/preview/scroll-area/Preview) | [Horizontal](https://mireye-ds.agencidev.com/preview/scroll-area/Horizontal)

examples/scroll-area.tsx

```tsx
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

const COUNTIES = ["Ellis", "Johnson", "Kaufman", "Navarro", "Hill", "Rockwall", "Hunt", "Henderson", "Collin", "Denton", "Parker", "Wise", "Hood", "Somervell", "Bosque", "Limestone", "Freestone", "Anderson"];

export function Preview() {
  return (
    <ScrollArea className="ds-cut-frame h-72 w-64 [--ds-shape-fill:var(--ds-color-bg-default)] [--ds-shape-stroke:var(--ds-color-border-default)]">
      <div className="p-4">
        <p className="mb-3 text-caption text-fg-secondary">Counties in range</p>
        {COUNTIES.map((county, i) => (
          <div key={county}>
            {i > 0 && <Separator className="my-2" />}
            <p className="flex justify-between text-body text-fg">
              {county}
              <span className="font-mono text-caption text-fg-muted">{(i * 7 + 3) % 40} sites</span>
            </p>
          </div>
        ))}
      </div>
    </ScrollArea>
  );
}

export function Horizontal() {
  return (
    <ScrollArea className="w-full max-w-96 whitespace-nowrap">
      <div className="flex w-max gap-2 pb-3">
        {["345 kV", "212.6 ac", "Zone X", "I-2 Industrial", "2.8% slope", "412 ft", "0.8 mi to substation", "Municipal water"].map((tag) => (
          <span key={tag} className="flex h-6 items-center bg-tag px-2 text-caption text-tag-fg">
            {tag}
          </span>
        ))}
      </div>
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  );
}

```

## Source

components/ui/scroll-area.tsx

```tsx
"use client";

import * as React from "react";
import { ScrollArea as ChakraScrollArea } from "@chakra-ui/react";

import { cn } from "@/lib/utils";

// A region that scrolls inside the page (a list of sites, the sources of an answer) with a thin square bar: a 6px Stone
// thumb on a clear track that steps to Slate under the pointer (150ms). Nothing is rounded.
function ScrollArea({ className, children, ...props }: React.ComponentProps<typeof ChakraScrollArea.Root>) {
  return (
    <ChakraScrollArea.Root unstyled data-slot="scroll-area" className={cn("relative overflow-hidden", className)} {...props}>
      <ChakraScrollArea.Viewport unstyled data-slot="scroll-area-viewport" className="size-full fade-xy outline-none focus-visible:outline-solid focus-visible:outline-1 focus-visible:-outline-offset-1 focus-visible:outline-line-strong">
        {children}
      </ChakraScrollArea.Viewport>
      <ScrollBar />
      <ChakraScrollArea.Corner unstyled />
    </ChakraScrollArea.Root>
  );
}

function ScrollBar({ className, orientation = "vertical", ...props }: React.ComponentProps<typeof ChakraScrollArea.Scrollbar>) {
  return (
    <ChakraScrollArea.Scrollbar
      unstyled
      data-slot="scroll-area-scrollbar"
      orientation={orientation}
      className={cn("absolute flex touch-none p-px select-none", orientation === "vertical" && "inset-y-0 right-0 w-2", orientation === "horizontal" && "inset-x-0 bottom-0 h-2 flex-col", className)}
      {...props}
    >
      <ChakraScrollArea.Thumb unstyled data-slot="scroll-area-thumb" className="relative flex-1 bg-line transition-colors duration-fast ease-out hover:bg-fg-subtle motion-reduce:transition-none" />
    </ChakraScrollArea.Scrollbar>
  );
}

export { ScrollArea, ScrollBar };

```
