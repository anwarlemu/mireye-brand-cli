"use client";

import * as React from "react";
import { HoverCard as HoverCardPrimitive } from "radix-ui";

import { usePortalContainer } from "@/lib/surface";
import { cn } from "@/lib/utils";

// A preview on hover, drawn as the popover (Figma has none): a white panel with the 6px cut corner and a 1px Stone
// line, no shadow, 8px from its trigger, 16px of padding, 13px Forest text. It waits before opening (so a passing
// pointer does not trigger it), then grows out of its trigger from 98 percent with a fade (150ms in, 120ms out). The
// dwell prevents accidental previews; it never delays the link action.
function HoverCard({ openDelay = 400, closeDelay = 150, ...props }: React.ComponentProps<typeof HoverCardPrimitive.Root>) {
  return <HoverCardPrimitive.Root data-slot="hover-card" openDelay={openDelay} closeDelay={closeDelay} {...props} />;
}

function HoverCardTrigger(props: React.ComponentProps<typeof HoverCardPrimitive.Trigger>) {
  return <HoverCardPrimitive.Trigger data-slot="hover-card-trigger" {...props} />;
}

function HoverCardContent({ className, align = "center", sideOffset = 8, ...props }: React.ComponentProps<typeof HoverCardPrimitive.Content>) {
  const container = usePortalContainer();
  return (
    <HoverCardPrimitive.Portal container={container} data-slot="hover-card-portal">
      <HoverCardPrimitive.Content
        data-slot="hover-card-content"
        align={align}
        sideOffset={sideOffset}
        className={cn(
          "ds-cut-frame z-50 w-72 max-w-[calc(100vw-2rem)] origin-(--radix-hover-card-content-transform-origin) p-4 text-body leading-body text-fg outline-none [--ds-cut:var(--ds-cut-md)] [--ds-shape-fill:var(--ds-color-bg-default)] [--ds-shape-stroke:var(--ds-color-border-default)] data-[state=closed]:animate-pop-out data-[state=open]:animate-pop-in",
          className,
        )}
        {...props}
      />
    </HoverCardPrimitive.Portal>
  );
}

export { HoverCard, HoverCardContent, HoverCardTrigger };
