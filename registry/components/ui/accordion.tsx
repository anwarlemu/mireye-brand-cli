"use client";

import * as React from "react";
import { Accordion as ChakraAccordion } from "@chakra-ui/react";

import { ArrowRightIcon } from "@/components/icons/arrow-right";
import { cn } from "@/lib/utils";

// Sections that open in place, ruled like a survey sheet: 1px Mist rules between items, a 13px Forest label and
// Mireye's chevron (the arrow's head alone, pointing down) at the right. The label holds still on hover; the chevron
// steps from Forest at 72% to Forest (150ms). The panel opens with its height (the accordion keyframes, under 200ms,
// ease-out) and the chevron turns to point up as state, never on hover. Focus is the 1px Forest outline, 2px out.
// Square throughout.
type AccordionProps = Omit<React.ComponentProps<typeof ChakraAccordion.Root>, "multiple" | "collapsible" | "value" | "defaultValue"> & { type?: "single" | "multiple"; collapsible?: boolean; value?: string | string[]; defaultValue?: string | string[] };
function Accordion({ type = "single", collapsible, value, defaultValue, ...props }: AccordionProps) {
  return <ChakraAccordion.Root unstyled data-slot="accordion" multiple={type === "multiple"} collapsible={collapsible} value={value === undefined ? undefined : Array.isArray(value) ? value : [value]} defaultValue={defaultValue === undefined ? undefined : Array.isArray(defaultValue) ? defaultValue : [defaultValue]} {...props} />;
}

function AccordionItem({ className, ...props }: React.ComponentProps<typeof ChakraAccordion.Item>) {
  return <ChakraAccordion.Item unstyled data-slot="accordion-item" className={cn("border-b border-line-subtle", className)} {...props} />;
}

function AccordionTrigger({ className, children, ...props }: React.ComponentProps<typeof ChakraAccordion.ItemTrigger>) {
  return (
    <ChakraAccordion.ItemTrigger
      unstyled
      data-slot="accordion-trigger"
      className={cn(
        "group/accordion-trigger flex w-full flex-1 cursor-pointer items-center justify-between gap-4 py-3 text-left font-sans text-body leading-body text-fg outline-none focus-visible:outline-solid focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-line-strong disabled:cursor-default disabled:text-fg-subtle",
        className,
      )}
      {...props}
    >
      {children}
      <ChakraAccordion.ItemIndicator unstyled className="flex shrink-0 text-fg-muted transition-colors duration-fast ease-out group-hover/accordion-trigger:text-fg group-disabled/accordion-trigger:text-fg-subtle motion-reduce:transition-none">
        <ArrowRightIcon
          size={16}
          head
          data-slot="accordion-trigger-icon"
          className="rotate-90 transition-transform duration-base ease-out group-data-[state=open]/accordion-trigger:-rotate-90 motion-reduce:transition-none"
        />
      </ChakraAccordion.ItemIndicator>
    </ChakraAccordion.ItemTrigger>
  );
}

function AccordionContent({ className, children, ...props }: React.ComponentProps<typeof ChakraAccordion.ItemContent>) {
  return (
    <ChakraAccordion.ItemContent unstyled data-slot="accordion-content" className="overflow-hidden text-body leading-body text-fg-secondary data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down" {...props}>
      <ChakraAccordion.ItemBody unstyled className={cn("pb-4", className)}>
        {children}
      </ChakraAccordion.ItemBody>
    </ChakraAccordion.ItemContent>
  );
}

export { Accordion, AccordionContent, AccordionItem, AccordionTrigger };
