"use client";

import * as React from "react";
import { Switch as ChakraSwitch } from "@chakra-ui/react";

import { cn } from "@/lib/utils";

// Mireye's switch (Figma "UI · Controls", 442:145, where it is called Toggle: Terrain) at the product scale: a square
// 32 by 16 track (Figma's 56 by 28) with no cut. Off it is white inside a 1px Stone line with a 12px Mist knob 2px from
// the left; on it is a Forest fill (and line) with a white knob 2px from the right. `size="sm"` is 28 by 14 with a 10px
// knob for dense rows.
// Motion (Figma draws only the two ends): the knob slides on translate in 200ms on the strong ease-out, so it starts at
// once and settles softly, as a transition so quick toggles turn around mid-way. The track's fill and line fade over
// 150ms. Nothing changes size. Under reduced motion the knob moves at once and only the colors fade. Keyboard focus is
// the 1px Forest outline 2px outside; aria-invalid turns the line brick; disabled turns the label Slate. `children` is
// the label, 13px Forest 12px after the track.
type SwitchProps = Omit<React.ComponentProps<typeof ChakraSwitch.Root>, "onCheckedChange"> & { size?: "default" | "sm"; onCheckedChange?: (checked: boolean) => void };

function Switch({ className, size = "default", onCheckedChange, children, ...props }: SwitchProps) {
  return (
    <ChakraSwitch.Root
      unstyled
      data-slot="switch"
      data-size={size}
      onCheckedChange={(details) => onCheckedChange?.(details.checked)}
      className={cn(
        "peer group/switch inline-flex w-fit shrink-0 cursor-pointer items-center gap-3 font-sans text-body leading-line-body text-fg outline-none data-disabled:cursor-not-allowed data-disabled:text-fg-subtle",
        className,
      )}
      {...props}
    >
      <ChakraSwitch.HiddenInput role="switch" />
      <ChakraSwitch.Control
        data-slot="switch-control"
        className={cn(
          "flex shrink-0 items-center border border-line bg-surface p-px transition-[background-color,border-color] duration-fast ease-out motion-reduce:transition-none",
          "group-data-[size=default]/switch:h-4 group-data-[size=default]/switch:w-8 group-data-[size=sm]/switch:h-3.5 group-data-[size=sm]/switch:w-7",
          "group-data-[state=checked]/switch:border-line-strong group-data-[state=checked]/switch:bg-inverse",
          "group-data-focus-visible/switch:outline-solid group-data-focus-visible/switch:outline-1 group-data-focus-visible/switch:outline-offset-2 group-data-focus-visible/switch:outline-line-strong",
          "group-data-invalid/switch:border-danger group-aria-invalid/switch:border-danger",
        )}
      >
        <ChakraSwitch.Thumb
          data-slot="switch-thumb"
          className={cn(
            "pointer-events-none block bg-subtle-hover group-data-[state=checked]/switch:bg-surface",
            "group-data-[size=default]/switch:size-3 group-data-[size=sm]/switch:size-2.5",
            "group-data-[size=default]/switch:group-data-[state=checked]/switch:translate-x-4 group-data-[size=sm]/switch:group-data-[state=checked]/switch:translate-x-3.5",
            "transition-[translate,background-color] duration-base ease-out motion-reduce:transition-[background-color]",
          )}
        />
      </ChakraSwitch.Control>
      {children != null && (
        <ChakraSwitch.Label data-slot="switch-label" className="select-none">
          {children}
        </ChakraSwitch.Label>
      )}
    </ChakraSwitch.Root>
  );
}

export { Switch };
