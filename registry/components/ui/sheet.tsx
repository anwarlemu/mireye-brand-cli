"use client";

import * as React from "react";
import { Dialog as SheetPrimitive } from "radix-ui";
import { XIcon } from "@phosphor-icons/react/ssr";

import { usePortalContainer } from "@/lib/surface";
import { cn } from "@/lib/utils";

// A panel from the edge of the screen. Figma has none, so it is drawn as the dialog in Mireye's grammar: white, square
// and flush with its edge, with a 1px Stone line on its inner edge and no shadow, on the page under Forest at 40
// percent. The head holds the 16px regular title 20px in, over a 13px line in the secondary ink; the close key is the
// dialog's (a square 32px key 12px from the corner with a 16px X, Fog under the pointer, Mist while pressed); the sides
// are 20px. It travels its own size from its edge on the drawer curve (300ms in, 200ms out). Side panels are 384px wide
// (the full width on phones); top and bottom panels take their content's height.
function Sheet(props: React.ComponentProps<typeof SheetPrimitive.Root>) {
  return <SheetPrimitive.Root data-slot="sheet" {...props} />;
}

function SheetTrigger(props: React.ComponentProps<typeof SheetPrimitive.Trigger>) {
  return <SheetPrimitive.Trigger data-slot="sheet-trigger" {...props} />;
}

function SheetClose(props: React.ComponentProps<typeof SheetPrimitive.Close>) {
  return <SheetPrimitive.Close data-slot="sheet-close" {...props} />;
}

function SheetPortal(props: React.ComponentProps<typeof SheetPrimitive.Portal>) {
  const container = usePortalContainer();
  return <SheetPrimitive.Portal data-slot="sheet-portal" container={container} {...props} />;
}

function SheetOverlay({ className, ...props }: React.ComponentProps<typeof SheetPrimitive.Overlay>) {
  return (
    <SheetPrimitive.Overlay
      data-slot="sheet-overlay"
      className={cn("fixed inset-0 z-50 bg-scrim data-[state=closed]:animate-fade-out data-[state=open]:animate-fade-in", className)}
      {...props}
    />
  );
}

const SIDES = {
  right: "inset-y-0 right-0 h-full w-full border-l border-line sm:max-w-96 data-[state=closed]:animate-sheet-out-right data-[state=open]:animate-sheet-in-right",
  left: "inset-y-0 left-0 h-full w-full border-r border-line sm:max-w-96 data-[state=closed]:animate-sheet-out-left data-[state=open]:animate-sheet-in-left",
  top: "inset-x-0 top-0 h-auto max-h-[85dvh] border-b border-line data-[state=closed]:animate-sheet-out-top data-[state=open]:animate-sheet-in-top",
  bottom: "inset-x-0 bottom-0 h-auto max-h-[85dvh] border-t border-line data-[state=closed]:animate-sheet-out-bottom data-[state=open]:animate-sheet-in-bottom",
} as const;

function SheetContent({ className, children, side = "right", showCloseButton = true, instant = false, ...props }: React.ComponentProps<typeof SheetPrimitive.Content> & { side?: keyof typeof SIDES; showCloseButton?: boolean; instant?: boolean }) {
  return (
    <SheetPortal>
      <SheetOverlay data-ds-motion={instant ? "instant" : undefined} />
      <SheetPrimitive.Content
        data-slot="sheet-content"
        data-ds-motion={instant ? "instant" : undefined}
        data-side={side}
        className={cn("fixed z-50 flex flex-col overflow-y-auto bg-surface text-fg outline-none", SIDES[side], className)}
        {...props}
      >
        {children}
        {showCloseButton && (
          <SheetPrimitive.Close
            data-slot="sheet-close"
            className="absolute top-3 right-3 inline-flex size-8 items-center justify-center text-fg outline-none transition-[background-color] duration-150 ease-out hover:bg-subtle active:bg-subtle-hover active:duration-0 focus-visible:outline-solid focus-visible:outline-1 focus-visible:-outline-offset-1 focus-visible:outline-line-strong motion-reduce:transition-none"
          >
            <XIcon className="size-4" />
            <span className="sr-only">Close</span>
          </SheetPrimitive.Close>
        )}
      </SheetPrimitive.Content>
    </SheetPortal>
  );
}

function SheetHeader({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="sheet-header" className={cn("flex shrink-0 flex-col justify-center gap-1 pt-5 pr-13 pb-4 pl-5", className)} {...props} />;
}

function SheetFooter({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="sheet-footer" className={cn("mt-auto flex shrink-0 flex-col gap-2 p-5", className)} {...props} />;
}

function SheetTitle({ className, ...props }: React.ComponentProps<typeof SheetPrimitive.Title>) {
  return <SheetPrimitive.Title data-slot="sheet-title" className={cn("font-sans text-h3 leading-tight font-normal text-fg", className)} {...props} />;
}

function SheetDescription({ className, ...props }: React.ComponentProps<typeof SheetPrimitive.Description>) {
  return <SheetPrimitive.Description data-slot="sheet-description" className={cn("text-body leading-body text-fg-secondary", className)} {...props} />;
}

export { Sheet, SheetClose, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetOverlay, SheetPortal, SheetTitle, SheetTrigger };
