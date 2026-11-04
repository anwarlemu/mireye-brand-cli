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
