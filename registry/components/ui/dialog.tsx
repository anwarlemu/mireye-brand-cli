"use client";

import * as React from "react";
import { Dialog as ChakraDialog, Portal } from "@chakra-ui/react";
import { XIcon } from "@phosphor-icons/react/ssr";

import { usePortalContainer } from "@/lib/surface";
import { cn } from "@/lib/utils";

// A dialog. Figma has none, so it is drawn in Mireye's grammar: a white panel with the 8px cut corner and a 1px Stone
// line, no shadow, on the page under Forest at 40 percent. The head (20px above, 12px below, 20px sides, 52px clear on
// the right) holds the 16px regular title over a 13px line in the secondary ink; the close key is a square 32px key
// 12px from the top and right edges with a 16px X, Fog under the pointer and Mist while pressed. The body keeps the
// 20px sides with 20px below it; a footer has 4px above, 20px below and 8px between its keys. The panel is at most
// 480px wide and the page less 32px each way, and its body scrolls; below 768px it fills the screen (square, without
// the line, inside the safe area) with 16px sides. It stays centered and opens from 98 percent with a fade (180ms, the
// strong ease-out) and closes to 98 percent faster (120ms); the scrim fades in (150ms) and out (120ms).
const CLOSE =
  "absolute top-3 right-3 inline-flex size-8 items-center justify-center text-fg outline-none transition-[background-color] duration-150 ease-out hover:bg-subtle active:bg-subtle-hover active:duration-0 focus-visible:outline-solid focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-line-strong motion-reduce:transition-none";
type DialogProps = Omit<React.ComponentProps<typeof ChakraDialog.Root>, "onOpenChange"> & { onOpenChange?: (open: boolean) => void };
function Dialog({ onOpenChange, ...props }: DialogProps) {
  return <ChakraDialog.Root unstyled data-slot="dialog" onOpenChange={(details) => onOpenChange?.(details.open)} {...props} />;
}

function DialogTrigger(props: React.ComponentProps<typeof ChakraDialog.Trigger>) {
  return <ChakraDialog.Trigger data-slot="dialog-trigger" {...props} />;
}

function DialogPortal(props: React.ComponentProps<typeof Portal>) {
  const container = usePortalContainer();
  const portalRef = React.useMemo(() => container ? { current: container } : undefined, [container]);
  return <Portal data-slot="dialog-portal" container={portalRef} {...props} />;
}

function DialogClose(props: React.ComponentProps<typeof ChakraDialog.CloseTrigger>) {
  return <ChakraDialog.CloseTrigger unstyled data-slot="dialog-close" {...props} />;
}

function DialogOverlay({ className, ...props }: React.ComponentProps<typeof ChakraDialog.Backdrop>) {
  return (
    <ChakraDialog.Backdrop unstyled
      data-slot="dialog-overlay"
      className={cn("fixed inset-0 z-50 bg-scrim data-[state=closed]:animate-fade-out data-[state=open]:animate-fade-in", className)}
      {...props}
    />
  );
}

function DialogContent({ className, children, showClose = true, ...props }: React.ComponentProps<typeof ChakraDialog.Content> & { showClose?: boolean }) {
  return (
    <DialogPortal>
      <DialogOverlay />
      {/* The centering layer: Chakra's unstyled positioner brings no layout of its own. */}
      <ChakraDialog.Positioner className="fixed inset-0 z-50 flex items-center justify-center">
      <ChakraDialog.Content
        unstyled
        data-slot="dialog-content"
        className={cn(
          "ds-cut-frame z-50 flex max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] max-w-120 flex-col p-px text-fg outline-none [--ds-shape-fill:var(--ds-color-bg-default)] [--ds-shape-stroke:var(--ds-color-border-default)] data-[state=closed]:animate-dialog-out data-[state=open]:animate-dialog-in max-md:h-dvh max-md:max-h-dvh max-md:w-full max-md:max-w-none max-md:p-0 max-md:pt-[env(safe-area-inset-top,0px)] max-md:pb-[env(safe-area-inset-bottom,0px)] max-md:ps-[env(safe-area-inset-left,0px)] max-md:pe-[env(safe-area-inset-right,0px)] max-md:[--ds-cut:0px] max-md:[--ds-shape-stroke:var(--ds-color-bg-default)]",
          className,
        )}
        {...props}
      >
        {children}
        {showClose && (
          <ChakraDialog.CloseTrigger unstyled
            data-slot="dialog-close"
            className={cn(CLOSE, "max-md:top-[calc(env(safe-area-inset-top,0px)+12px)] max-md:right-[calc(env(safe-area-inset-right,0px)+8px)]")}
          >
            <XIcon className="size-4" />
            <span className="sr-only">Close</span>
          </ChakraDialog.CloseTrigger>
        )}
      </ChakraDialog.Content>
      </ChakraDialog.Positioner>
    </DialogPortal>
  );
}

function DialogHeader({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="dialog-header" className={cn("flex shrink-0 flex-col justify-center gap-1 pt-5 pr-13 pb-3 pl-5 max-md:pl-4", className)} {...props} />;
}

/** The scrolling middle of a dialog, with the head's 20px sides (16px on phones). */
function DialogBody({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="dialog-body" className={cn("min-h-0 flex-1 content-start overflow-y-auto px-5 pt-0 pb-5 max-md:px-4", className)} {...props} />;
}

function DialogFooter({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="dialog-footer" className={cn("flex shrink-0 flex-col-reverse gap-2 px-5 pt-1 pb-5 sm:flex-row sm:justify-end max-md:px-4", className)} {...props} />;
}

function DialogTitle({ className, ...props }: React.ComponentProps<typeof ChakraDialog.Title>) {
  return <ChakraDialog.Title unstyled data-slot="dialog-title" className={cn("font-sans text-h3 leading-tight font-normal text-fg", className)} {...props} />;
}

function DialogDescription({ className, ...props }: React.ComponentProps<typeof ChakraDialog.Description>) {
  return <ChakraDialog.Description unstyled data-slot="dialog-description" className={cn("text-body leading-body text-fg-secondary", className)} {...props} />;
}

export { Dialog, DialogBody, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogOverlay, DialogPortal, DialogTitle, DialogTrigger };
