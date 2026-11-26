# Alert Dialog
The dialog's framed cut panel for a confirmation: a 16px regular title, a line in the secondary ink and two keys at the end; no close key, and a click outside does not dismiss it.

Install: npx mireye-ds add alert-dialog
Requires: theme, button, surface, utils
Packages: radix-ui
Exports: AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogMedia, AlertDialogOverlay, AlertDialogPortal, AlertDialogTitle, AlertDialogTrigger
Client boundary: yes
Reference: Not in Figma. Drawn in Mireye's grammar: the dialog's panel


## Usage
Use to confirm an action that is destructive or hard to undo (remove a site, rescore every site). Name the action on the confirming key (Remove site), never just OK. Use size="sm" with AlertDialogMedia for a short centered question. Content taller than the screen fades at an edge (fade-y) where more scrolls past it.
- Avoid: Information that needs no answer (use a toast)
- Avoid: A close key
- Avoid: Rounded corners or a shadow
- Avoid: Two primary keys


## Examples
Example components: npx mireye-ds add alert-dialog button
Example packages: @phosphor-icons/react
[Preview](https://mireye-ds.agencidev.com/preview/alert-dialog/Preview) | [Small](https://mireye-ds.agencidev.com/preview/alert-dialog/Small) | [Open](https://mireye-ds.agencidev.com/preview/alert-dialog/Open)

examples/alert-dialog.tsx

```tsx
"use client";

import { ArrowsClockwiseIcon, TrashIcon } from "@phosphor-icons/react/ssr";

import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogMedia, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";

function RemoveSite() {
  return (
    <AlertDialogContent>
      <AlertDialogHeader>
        <AlertDialogTitle>Remove Site 14?</AlertDialogTitle>
        <AlertDialogDescription>Its 6 parcels, notes and fit scores are removed with it. Exports you already shared keep their copy. This cannot be undone.</AlertDialogDescription>
      </AlertDialogHeader>
      <AlertDialogFooter>
        <AlertDialogCancel>Cancel</AlertDialogCancel>
        <AlertDialogAction variant="destructive">Remove site</AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  );
}

export function Preview() {
  return (
    <div className="flex justify-center">
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button variant="destructive">
            <TrashIcon />
            Remove site
          </Button>
        </AlertDialogTrigger>
        <RemoveSite />
      </AlertDialog>
    </div>
  );
}

export function Small() {
  return (
    <div className="flex justify-center">
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button variant="outline">
            <ArrowsClockwiseIcon />
            Rescore sites
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent size="sm">
          <AlertDialogHeader>
            <AlertDialogMedia>
              <ArrowsClockwiseIcon />
            </AlertDialogMedia>
            <AlertDialogTitle>Rescore 24 sites?</AlertDialogTitle>
            <AlertDialogDescription>Fit scores change to the new requirements. The old scores stay in the history.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction>Rescore</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export function Open() {
  return (
    <div className="min-h-100">
      <AlertDialog defaultOpen>
        <RemoveSite />
      </AlertDialog>
    </div>
  );
}

```

## Source

components/ui/alert-dialog.tsx

```tsx
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

function AlertDialogContent({ className, size = "default", children, ...props }: React.ComponentProps<typeof AlertDialogPrimitive.Content> & { size?: "default" | "sm" }) {
  return (
    <AlertDialogPortal>
      <AlertDialogOverlay />
      <AlertDialogPrimitive.Content
        data-slot="alert-dialog-content"
        data-size={size}
        className={cn(
          "group/alert-dialog ds-cut-frame fixed top-1/2 left-1/2 z-50 flex flex-col max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] -translate-x-1/2 -translate-y-1/2 overflow-hidden p-5 text-fg outline-none [--ds-shape-fill:var(--ds-color-bg-default)] [--ds-shape-stroke:var(--ds-color-border-default)] data-[size=default]:max-w-112 data-[size=sm]:max-w-80 data-[state=closed]:animate-dialog-out data-[state=open]:animate-dialog-in max-md:data-[size=default]:top-0 max-md:data-[size=default]:left-0 max-md:data-[size=default]:translate-x-0 max-md:data-[size=default]:translate-y-0 max-md:data-[size=default]:h-dvh max-md:data-[size=default]:max-h-dvh max-md:data-[size=default]:w-full max-md:data-[size=default]:max-w-none max-md:data-[size=default]:content-start max-md:data-[size=default]:[--ds-cut:0px] max-md:data-[size=default]:[--ds-shape-stroke:var(--ds-color-bg-default)] max-md:data-[size=default]:px-[calc(env(safe-area-inset-left,0px)+16px)] max-md:data-[size=default]:pt-[calc(env(safe-area-inset-top,0px)+20px)] max-md:data-[size=default]:pb-[calc(env(safe-area-inset-bottom,0px)+20px)]",
          className,
        )}
        {...props}
      >
        {/* The scrolling box sits inside the frame: its edges fade where more scrolls past them, and the content's own
            enter and exit animations stay on the frame. */}
        <div data-slot="alert-dialog-body" className="grid min-h-0 content-start gap-5 overflow-y-auto fade-y">
          {children}
        </div>
      </AlertDialogPrimitive.Content>
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

```
