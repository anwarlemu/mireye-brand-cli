"use client";

import * as React from "react";
import { Checkbox as ChakraCheckbox } from "@chakra-ui/react";

import { CheckIcon } from "@/components/icons/check";
import { cn } from "@/lib/utils";

// Mireye's checkbox (Figma "UI · Controls", 442:145: Exclude floodplain) at the product scale: a 16px square (Figma's
// 28px), no cut, as every small control. Off it is white inside a 1px Stone line; on it is a Forest fill with Mireye's
// white check (the 1.75px stroke from the board). Figma has no mixed state: "indeterminate" is the Forest fill with a
// white 8px rule. Under the pointer an empty box steps to Fog over 150ms; the check itself appears at once. Keyboard
// focus is the 1px Forest outline 2px outside; aria-invalid turns the line brick. Disabled sits on Mist with a Slate
// mark. `children` is the label: 13px Forest, 12px after the box (Figma's 20px), and a click on it toggles the box.
type CheckboxProps = Omit<React.ComponentProps<typeof ChakraCheckbox.Root>, "onCheckedChange"> & {
  onCheckedChange?: (checked: boolean | "indeterminate") => void;
};

function Checkbox({ className, onCheckedChange, children, ...props }: CheckboxProps) {
  return (
    <ChakraCheckbox.Root
      unstyled
      data-slot="checkbox"
      className={cn(
        "peer group/checkbox inline-flex shrink-0 cursor-pointer items-center gap-3 font-sans text-body leading-line-body text-fg outline-none data-disabled:cursor-not-allowed data-disabled:text-fg-subtle",
        className,
      )}
      onCheckedChange={(details) => onCheckedChange?.(details.checked)}
      {...props}
    >
      <ChakraCheckbox.HiddenInput />
      <ChakraCheckbox.Control
        data-slot="checkbox-control"
        className={cn(
          "flex size-4 shrink-0 items-center justify-center border border-line bg-surface text-on-primary transition-[background-color] duration-fast ease-out motion-reduce:transition-none",
          "group-hover/checkbox:bg-subtle group-data-[state=checked]/checkbox:border-line-strong group-data-[state=checked]/checkbox:bg-inverse group-data-[state=indeterminate]/checkbox:border-line-strong group-data-[state=indeterminate]/checkbox:bg-inverse",
          "group-data-focus-visible/checkbox:outline-solid group-data-focus-visible/checkbox:outline-1 group-data-focus-visible/checkbox:outline-offset-2 group-data-focus-visible/checkbox:outline-line-strong",
          "group-data-invalid/checkbox:border-danger group-aria-invalid/checkbox:border-danger",
          "group-data-disabled/checkbox:border-line group-data-disabled/checkbox:bg-subtle-hover group-data-disabled/checkbox:text-fg-subtle",
        )}
      >
        <CheckIcon data-slot="checkbox-indicator" className="hidden group-data-[state=checked]/checkbox:block" />
        <span aria-hidden data-slot="checkbox-indicator" className="hidden h-px w-2 bg-current group-data-[state=indeterminate]/checkbox:block" />
      </ChakraCheckbox.Control>
      {children != null && (
        <ChakraCheckbox.Label data-slot="checkbox-label" className="select-none">
          {children}
        </ChakraCheckbox.Label>
      )}
    </ChakraCheckbox.Root>
  );
}

export { Checkbox };
