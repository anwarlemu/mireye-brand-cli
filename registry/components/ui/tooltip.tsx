"use client";

import * as React from "react";
import { Tooltip as TooltipPrimitive } from "radix-ui";

import { usePortalContainer } from "@/lib/surface";
import { cn } from "@/lib/utils";

// A tooltip, drawn as Mireye's map tag (Figma "Tooltip" 443:418 on the map boards): a Forest tag with the 6px cut
// corner and no line, 12px regular white text (balanced, breaking anywhere), at least 28px tall with 12px sides and
// 6px above and below, at most 256px wide, 8px from its trigger and without an arrow (the map tag has none). It only
// fades (150ms in, 120ms out), never scales. The first one waits 400ms; once one is open its neighbors open at once and
// without motion for 300ms (the provider's skip delay), as a toolbar should.
// Whether a TooltipProvider is above: tooltips under one share its delay, so neighbors open at once. A lone Tooltip
// brings its own provider. The dwell avoids incidental hover popups; it never delays the underlying button action.
const HasProvider = React.createContext(false);

function TooltipProvider({ delayDuration = 400, skipDelayDuration = 300, ...props }: React.ComponentProps<typeof TooltipPrimitive.Provider>) {
  return (
    <HasProvider.Provider value>
      <TooltipPrimitive.Provider data-slot="tooltip-provider" delayDuration={delayDuration} skipDelayDuration={skipDelayDuration} {...props} />
    </HasProvider.Provider>
  );
}

function Tooltip(props: React.ComponentProps<typeof TooltipPrimitive.Root>) {
  const root = <TooltipPrimitive.Root data-slot="tooltip" {...props} />;
  return React.useContext(HasProvider) ? root : <TooltipProvider>{root}</TooltipProvider>;
}

function TooltipTrigger(props: React.ComponentProps<typeof TooltipPrimitive.Trigger>) {
  return <TooltipPrimitive.Trigger data-slot="tooltip-trigger" {...props} />;
}

function TooltipContent({ className, sideOffset = 8, children, ...props }: React.ComponentProps<typeof TooltipPrimitive.Content>) {
  const container = usePortalContainer();
  return (
    <TooltipPrimitive.Portal container={container}>
      <TooltipPrimitive.Content
        data-slot="tooltip-content"
        sideOffset={sideOffset}
        className={cn(
          "ds-cut z-50 flex min-h-7 w-fit max-w-64 items-center px-3 py-1.5 font-sans text-caption leading-tight font-normal text-balance wrap-anywhere text-fg-inverse [--ds-cut:var(--ds-cut-md)] [--ds-shape-fill:var(--ds-color-bg-inverse)] data-[state=closed]:animate-fade-out data-[state=delayed-open]:animate-fade-in",
          className,
        )}
        {...props}
      >
        {children}
      </TooltipPrimitive.Content>
    </TooltipPrimitive.Portal>
  );
}

export { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger };
