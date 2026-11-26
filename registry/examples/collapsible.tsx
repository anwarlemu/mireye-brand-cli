"use client";

import * as React from "react";

import { ArrowRightIcon } from "@/components/icons/arrow-right";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

const TRIGGER =
  "group flex w-full cursor-pointer items-center justify-between gap-4 py-2 text-left text-body text-fg outline-none focus-visible:outline-solid focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-line-strong";
const CHEVRON = "shrink-0 rotate-90 text-fg-muted transition-[rotate,color] duration-base ease-out group-hover:text-fg group-data-[state=open]:-rotate-90 motion-reduce:transition-none";

export function Preview() {
  const [open, setOpen] = React.useState(false);
  return (
    <Collapsible open={open} onOpenChange={setOpen} className="w-full max-w-120">
      <CollapsibleTrigger className={TRIGGER}>
        Search settings: radius, minimum acres, voltage
        <ArrowRightIcon size={16} head aria-hidden className={CHEVRON} />
      </CollapsibleTrigger>
      <CollapsibleContent>
        <dl className="grid grid-cols-[8rem_1fr] gap-x-4 gap-y-2 pt-3 text-body">
          <dt className="text-caption text-fg-secondary">Radius</dt>
          <dd className="text-fg">25 mi from Waxahachie, TX</dd>
          <dt className="text-caption text-fg-secondary">Minimum size</dt>
          <dd className="text-fg">200 ac</dd>
          <dt className="text-caption text-fg-secondary">Voltage</dt>
          <dd className="text-fg">138 kV or above</dd>
        </dl>
      </CollapsibleContent>
    </Collapsible>
  );
}

/** A collapsible section in a white cut-frame panel whose content opens at once. */
export function Section() {
  return (
    <Collapsible defaultOpen className="ds-cut-frame w-full max-w-120 px-4 py-3 [--ds-shape-fill:var(--ds-color-bg-default)] [--ds-shape-stroke:var(--ds-color-border-default)]">
      <CollapsibleTrigger className={TRIGGER}>
        Excluded counties
        <ArrowRightIcon size={16} head aria-hidden className={CHEVRON} />
      </CollapsibleTrigger>
      <CollapsibleContent className="data-[state=closed]:animate-none data-[state=open]:animate-none">
        <p className="pt-1 pb-1 text-body text-fg-muted">Dallas and Tarrant are left out of the search. Their parcels never appear in results.</p>
      </CollapsibleContent>
    </Collapsible>
  );
}
