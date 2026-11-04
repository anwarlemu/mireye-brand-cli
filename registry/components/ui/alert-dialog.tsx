"use client";

import * as React from "react";
import { AlertDialog as AlertDialogPrimitive } from "radix-ui";

import { buttonVariants } from "@/components/ui/button";
import { usePortalContainer } from "@/lib/surface";
import { cn } from "@/lib/utils";

// A confirmation, drawn as the dialog (Figma has none; this is Mireye's grammar): a white panel with the 8px cut corner
// and a 1px Stone line, no shadow, on the page under Forest at 40 percent; 20px of padding, the 16px regular title over
// a 13px line in the secondary ink, then the actions 8px apart: the cancel as the secondary key and the action as the
// primary one (the destructive key for a destructive action), side by side at the end, stacked full width on phones.
// It is at most 448px wide. Below 768px it fills the screen (square, without the line, inside the safe area), as the
// dialog does. `size="sm"` is a 320px panel with the title centered under an optional media tile (AlertDialogMedia, a
// square 40px Fog tile), on phones too. It has no close key: the person answers it. Opens from 98 percent with a fade
// (180ms), centered; closes to 98 percent faster (120ms).
function AlertDialog(props: React.ComponentProps<typeof AlertDialogPrimitive.Root>) {
  return <AlertDialogPrimitive.Root data-slot="alert-dialog" {...props} />;
}

function AlertDialogTrigger(props: React.ComponentProps<typeof AlertDialogPrimitive.Trigger>) {
  return <AlertDialogPrimitive.Trigger data-slot="alert-dialog-trigger" {...props} />;
}

function AlertDialogPortal(props: React.ComponentProps<typeof AlertDialogPrimitive.Portal>) {
  const container = usePortalContainer();
  return <AlertDialogPrimitive.Portal data-slot="alert-dialog-portal" container={container} {...props} />;
}

function AlertDialogOverlay({ className, ...props }: React.ComponentProps<typeof AlertDialogPrimitive.Overlay>) {
  return (
    <AlertDialogPrimitive.Overlay
      data-slot="alert-dialog-overlay"
      className={cn("fixed inset-0 z-50 bg-scrim data-[state=closed]:animate-fade-out data-[state=open]:animate-fade-in", className)}
      {...props}
    />
  );
}

function AlertDialogContent({ className, size = "default", ...props }: React.ComponentProps<typeof AlertDialogPrimitive.Content> & { size?: "default" | "sm" }) {
  return (
    <AlertDialogPortal>
      <AlertDialogOverlay />
      <AlertDialogPrimitive.Content
        data-slot="alert-dialog-content"
        data-size={size}
        className={cn(
          "group/alert-dialog ds-cut-frame fixed top-1/2 left-1/2 z-50 grid max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] -translate-x-1/2 -translate-y-1/2 gap-5 overflow-y-auto p-5 text-fg outline-none [--ds-shape-fill:var(--ds-color-bg-default)] [--ds-shape-stroke:var(--ds-color-border-default)] data-[size=default]:max-w-112 data-[size=sm]:max-w-80 data-[state=closed]:animate-dialog-out data-[state=open]:animate-dialog-in max-md:data-[size=default]:top-0 max-md:data-[size=default]:left-0 max-md:data-[size=default]:translate-x-0 max-md:data-[size=default]:translate-y-0 max-md:data-[size=default]:h-dvh max-md:data-[size=default]:max-h-dvh max-md:data-[size=default]:w-full max-md:data-[size=default]:max-w-none max-md:data-[size=default]:content-start max-md:data-[size=default]:[--ds-cut:0px] max-md:data-[size=default]:[--ds-shape-stroke:var(--ds-color-bg-default)] max-md:data-[size=default]:px-[calc(env(safe-area-inset-left,0px)+16px)] max-md:data-[size=default]:pt-[calc(env(safe-area-inset-top,0px)+20px)] max-md:data-[size=default]:pb-[calc(env(safe-area-inset-bottom,0px)+20px)]",
          className,
        )}
        {...props}
      />
    </AlertDialogPortal>
  );
}

function AlertDialogHeader({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="alert-dialog-header" className={cn("grid gap-1.5 group-data-[size=sm]/alert-dialog:justify-items-center group-data-[size=sm]/alert-dialog:text-center", className)} {...props} />;
}

function AlertDialogFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-dialog-footer"
      className={cn("flex flex-col-reverse gap-2 sm:flex-row sm:justify-end group-data-[size=sm]/alert-dialog:grid group-data-[size=sm]/alert-dialog:grid-cols-2 group-data-[size=sm]/alert-dialog:[&>*]:w-full", className)}
      {...props}
    />
  );
}

/** A square 40px Fog tile above the title: put a 20px glyph inside. */
function AlertDialogMedia({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="alert-dialog-media" className={cn("mb-1 inline-flex size-10 items-center justify-center bg-subtle text-fg [&_svg:not([class*='size-'])]:size-5", className)} {...props} />;
}

function AlertDialogTitle({ className, ...props }: React.ComponentProps<typeof AlertDialogPrimitive.Title>) {
  return <AlertDialogPrimitive.Title data-slot="alert-dialog-title" className={cn("font-sans text-h3 leading-tight font-normal text-fg", className)} {...props} />;
}

function AlertDialogDescription({ className, ...props }: React.ComponentProps<typeof AlertDialogPrimitive.Description>) {
  return <AlertDialogPrimitive.Description data-slot="alert-dialog-description" className={cn("text-body leading-body text-fg-secondary", className)} {...props} />;
}

function AlertDialogAction({ className, variant = "default", ...props }: React.ComponentProps<typeof AlertDialogPrimitive.Action> & { variant?: "default" | "destructive" }) {
  return <AlertDialogPrimitive.Action data-slot="alert-dialog-action" className={cn(buttonVariants({ variant }), className)} {...props} />;
}

function AlertDialogCancel({ className, ...props }: React.ComponentProps<typeof AlertDialogPrimitive.Cancel>) {
  return <AlertDialogPrimitive.Cancel data-slot="alert-dialog-cancel" className={cn(buttonVariants({ variant: "secondary" }), className)} {...props} />;
}

export {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogOverlay,
  AlertDialogPortal,
  AlertDialogTitle,
  AlertDialogTrigger,
};
