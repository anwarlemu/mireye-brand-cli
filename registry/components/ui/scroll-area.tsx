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
