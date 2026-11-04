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
