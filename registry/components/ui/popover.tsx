"use client";

import * as React from "react";
import { Popover as ChakraPopover, Portal } from "@chakra-ui/react";

import { usePortalContainer } from "@/lib/surface";
import { cn } from "@/lib/utils";

// A popover. Figma has none, so it is drawn in Mireye's grammar: a white panel with the 6px cut corner and a 1px Stone
// line, no shadow, 8px from its trigger, 16px of padding and 12px between its parts; the title is 13px medium Forest
// over a 13px line in the secondary ink. It grows out of its trigger from 98 percent with a fade (150ms, the strong
// ease-out) and leaves faster than it came (120ms).
type PopoverProps = Omit<React.ComponentProps<typeof ChakraPopover.Root>, "onOpenChange"> & { onOpenChange?: (open: boolean) => void };
function Popover({ onOpenChange, ...props }: PopoverProps) {
  return <ChakraPopover.Root unstyled data-slot="popover" onOpenChange={(details) => onOpenChange?.(details.open)} {...props} />;
}

function PopoverTrigger(props: React.ComponentProps<typeof ChakraPopover.Trigger>) {
  return <ChakraPopover.Trigger data-slot="popover-trigger" {...props} />;
}

function PopoverAnchor(props: React.ComponentProps<typeof ChakraPopover.Anchor>) {
  return <ChakraPopover.Anchor data-slot="popover-anchor" {...props} />;
}

type PopoverContentProps = Omit<React.ComponentProps<typeof ChakraPopover.Content>, "positioning"> & { align?: "start" | "center" | "end"; sideOffset?: number; onOpenAutoFocus?: (event: { preventDefault(): void }) => void };
function PopoverContent({ className, align = "center", sideOffset = 8, onOpenAutoFocus: _onOpenAutoFocus, ...props }: PopoverContentProps) {
  const container = usePortalContainer();
  const portalRef = React.useMemo(() => container ? { current: container } : undefined, [container]);
  return (
    <Portal container={portalRef}>
      <ChakraPopover.Positioner>
      <ChakraPopover.Content
        unstyled
        data-slot="popover-content"
        className={cn(
          "ds-cut-frame z-50 flex w-72 max-w-[calc(100vw-2rem)] origin-(--transform-origin) flex-col gap-3 p-4 text-body leading-body text-fg outline-none [--ds-cut:var(--ds-cut-md)] [--ds-shape-fill:var(--ds-color-bg-default)] [--ds-shape-stroke:var(--ds-color-border-default)] data-[state=closed]:animate-pop-out data-[state=open]:animate-pop-in",
          className,
        )}
        {...props}
      />
      </ChakraPopover.Positioner>
    </Portal>
  );
}

/** The popover's head: its title over a short muted line. */
function PopoverHeader({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="popover-header" className={cn("flex flex-col gap-1", className)} {...props} />;
}

function PopoverTitle({ className, ...props }: React.ComponentProps<"h2">) {
  return <h2 data-slot="popover-title" className={cn("font-sans text-body leading-body font-medium text-fg", className)} {...props} />;
}

function PopoverDescription({ className, ...props }: React.ComponentProps<"p">) {
  return <p data-slot="popover-description" className={cn("text-body leading-body text-fg-secondary", className)} {...props} />;
}

export { Popover, PopoverAnchor, PopoverContent, PopoverDescription, PopoverHeader, PopoverTitle, PopoverTrigger };
