"use client";

import * as React from "react";
import { chakra } from "@chakra-ui/react";

import { cn } from "@/lib/utils";

// A field's label (Figma "UI · Inputs": Parcel size, Location): 12px regular in 80% Forest on a 16px line, 8px above its
// field. Beside a checkbox, radio or switch (a horizontal Field) it is the control's own label instead: 13px Forest.
// A required mark inside it (`<span aria-hidden>*</span>` with data-slot="label-required") is brick. A disabled field's
// label turns Slate with it.
function Label({ className, ...props }: React.ComponentProps<"label">) {
  return (
    <chakra.label
      data-slot="label"
      className={cn(
        "flex items-center gap-2 font-sans text-caption leading-line-caption font-normal text-fg-secondary select-none",
        "*:data-[slot=label-required]:-ms-1 *:data-[slot=label-required]:text-danger",
        "group-data-[orientation=horizontal]/field:text-body group-data-[orientation=horizontal]/field:leading-line-body group-data-[orientation=horizontal]/field:text-fg",
        "peer-data-[slot=checkbox]:text-body peer-data-[slot=checkbox]:text-fg peer-data-[slot=switch]:text-body peer-data-[slot=switch]:text-fg peer-data-[slot=radio-group-item]:text-body peer-data-[slot=radio-group-item]:text-fg",
        "group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:text-fg-subtle peer-disabled:cursor-not-allowed peer-disabled:text-fg-subtle",
        className,
      )}
      {...props}
    />
  );
}

export { Label };
