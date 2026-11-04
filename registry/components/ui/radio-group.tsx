"use client";

import * as React from "react";
import { RadioGroup as ChakraRadioGroup } from "@chakra-ui/react";

import { Diamond } from "@/components/ui/diamond";
import { cn } from "@/lib/utils";

// Mireye's radio (Figma "UI · Controls", 442:145: Industrial) is the survey diamond, not a circle: a 16px outline
// diamond (Figma's 28px) with a 1px stroke kept inside its box, Stone when not chosen and Forest when chosen, with a
// solid 7px Forest diamond in its center (Figma's 12px, 8px in from each side). The choice changes at once; only an
// unchosen diamond's line steps to Slate under the pointer, over 150ms. Keyboard focus is the 1px Forest outline 2px
// outside the box; aria-invalid turns the line brick; disabled turns it and the label Slate. Options stack 12px apart.
// `children` is the label: 13px Forest, 12px after the diamond, and a click on it chooses the option.
type RadioGroupProps = Omit<React.ComponentProps<typeof ChakraRadioGroup.Root>, "onValueChange"> & { onValueChange?: (value: string | null) => void };
function RadioGroup({ className, onValueChange, ...props }: RadioGroupProps) {
  return <ChakraRadioGroup.Root unstyled data-slot="radio-group" className={cn("grid gap-3", className)} onValueChange={(details) => onValueChange?.(details.value)} {...props} />;
}

function RadioGroupItem({ className, children, ...props }: React.ComponentProps<typeof ChakraRadioGroup.Item>) {
  return (
    <ChakraRadioGroup.Item
      data-slot="radio-group-item"
      unstyled
      className={cn(
        "peer group/radio inline-flex w-fit shrink-0 cursor-pointer items-center gap-3 font-sans text-body leading-line-body text-fg outline-none data-disabled:cursor-not-allowed data-disabled:text-fg-subtle",
        className,
      )}
      {...props}
    >
      <ChakraRadioGroup.ItemHiddenInput />
      <ChakraRadioGroup.ItemControl
        data-slot="radio-group-control"
        className={cn(
          "relative flex size-4 shrink-0 items-center justify-center text-line transition-[color] duration-fast ease-out motion-reduce:transition-none",
          "group-hover/radio:text-slate group-data-[state=checked]/radio:text-line-strong group-data-[state=checked]/radio:transition-none",
          "group-data-focus-visible/radio:outline-solid group-data-focus-visible/radio:outline-1 group-data-focus-visible/radio:outline-offset-2 group-data-focus-visible/radio:outline-line-strong",
          "group-data-invalid/radio:text-danger group-aria-invalid/radio:text-danger group-data-disabled/radio:text-line",
        )}
      >
        <Diamond size={16} variant="outline" fill="var(--ds-color-bg-default)" className="absolute inset-0 size-4" />
        {/* Chakra's ItemIndicator draws its own dot, so the center diamond is ours. */}
        <Diamond size={7} data-slot="radio-group-indicator" className="relative hidden size-1.75 group-data-[state=checked]/radio:block group-data-disabled/radio:text-fg-subtle" />
      </ChakraRadioGroup.ItemControl>
      {children != null && (
        <ChakraRadioGroup.ItemText data-slot="radio-group-label" className="select-none">
          {children}
        </ChakraRadioGroup.ItemText>
      )}
    </ChakraRadioGroup.Item>
  );
}

export { RadioGroup, RadioGroupItem };
