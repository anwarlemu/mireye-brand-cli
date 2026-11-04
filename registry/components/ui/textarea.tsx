"use client";

import * as React from "react";
import { Textarea as ChakraTextarea } from "@chakra-ui/react";

import { inputClassName } from "@/components/ui/input";
import { cn } from "@/lib/utils";

// The field for more than a line: Input's frame (white, 1px Stone line, the 8px cut, Forest line on focus, brick when
// invalid, Fog read-only, Mist disabled) with 13px Forest text on 18px lines, 8px above and below and 16px at the sides.
// It grows with its content (field-sizing) from 72px, two field heights, and is not resized by hand.
function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <ChakraTextarea
      unstyled
      data-slot="textarea"
      className={cn(inputClassName, "field-sizing-content flex h-auto min-h-18 resize-none py-2 leading-line-body", className)}
      {...props}
    />
  );
}

export { Textarea };
