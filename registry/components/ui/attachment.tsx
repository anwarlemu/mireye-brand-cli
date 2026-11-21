"use client";

import * as React from "react";
import { chakra } from "@chakra-ui/react";
import { cva, type VariantProps } from "class-variance-authority";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// A file attached to a question or a report (a parcel export, a site plan, a KML), drawn as a field: the white cut
// frame with the 1px Stone line and the 6px chamfer at the top-left. The file sits in a square Fog tile with a 16px
// Forest glyph; its name is 13px Forest and its size or state 12px DM Mono, muted. A waiting file keeps its line and
// mutes its name; one uploading or processing shimmers its name (the system's sign of work); one that failed takes
// the danger line and a danger note. A card that opens its file fills with Fog under the pointer (150ms).
const attachmentVariants = cva(
  "group/attachment relative flex w-fit max-w-full min-w-0 shrink-0 flex-wrap ds-cut-frame text-fg [--ds-cut:var(--ds-cut-md)] [--ds-shape-fill:var(--ds-color-bg-default)] [--ds-shape-stroke:var(--ds-color-border-default)] after:transition-[background-color] after:duration-fast after:ease-out has-[>[data-slot=attachment-trigger]:hover]:[--ds-shape-fill:var(--ds-color-bg-subtle)] has-[>[data-slot=attachment-trigger]:focus-visible]:outline-solid has-[>[data-slot=attachment-trigger]:focus-visible]:outline-1 has-[>[data-slot=attachment-trigger]:focus-visible]:outline-offset-2 has-[>[data-slot=attachment-trigger]:focus-visible]:outline-line-strong data-[state=error]:[--ds-shape-stroke:var(--ds-color-status-danger)] motion-reduce:after:transition-none",
  {
    variants: {
      size: {
        default: "gap-3 text-body has-data-[slot=attachment-content]:py-2 has-data-[slot=attachment-content]:pr-3 has-data-[slot=attachment-content]:pl-2 has-data-[slot=attachment-media]:p-2",
        sm: "gap-2.5 text-body has-data-[slot=attachment-content]:py-1.5 has-data-[slot=attachment-content]:pr-2.5 has-data-[slot=attachment-content]:pl-1.5 has-data-[slot=attachment-media]:p-1.5",
        xs: "gap-2 text-caption [--ds-cut:var(--ds-cut-sm)] has-data-[slot=attachment-content]:py-1 has-data-[slot=attachment-content]:pr-2 has-data-[slot=attachment-content]:pl-1 has-data-[slot=attachment-media]:p-1",
      },
      orientation: {
        horizontal: "min-w-48 items-center",
        vertical: "w-28 flex-col has-data-[slot=attachment-content]:w-36",
      },
    },
    defaultVariants: { size: "default", orientation: "horizontal" },
  },
);

type AttachmentState = "idle" | "uploading" | "processing" | "error" | "done";

function Attachment({ className, state = "done", size = "default", orientation = "horizontal", ...props }: React.ComponentProps<"div"> & VariantProps<typeof attachmentVariants> & { state?: AttachmentState }) {
  return <div data-slot="attachment" data-state={state} data-size={size} data-orientation={orientation} aria-busy={state === "uploading" || state === "processing" || undefined} className={cn(attachmentVariants({ size, orientation }), className)} {...props} />;
}

const attachmentMediaVariants = cva(
  "relative flex aspect-square w-9 shrink-0 items-center justify-center overflow-hidden bg-subtle text-fg group-data-[orientation=vertical]/attachment:w-full group-data-[size=sm]/attachment:w-8 group-data-[size=xs]/attachment:w-6 group-data-[state=error]/attachment:text-danger [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 group-data-[orientation=vertical]/attachment:[&_svg:not([class*='size-'])]:size-6 group-data-[size=xs]/attachment:[&_svg:not([class*='size-'])]:size-3.5",
  {
    variants: {
      variant: {
        icon: "",
        // An image shows itself; it stays faint until it has uploaded.
        image: "opacity-60 group-data-[state=done]/attachment:opacity-100 group-data-[state=idle]/attachment:opacity-100 *:[img]:aspect-square *:[img]:w-full *:[img]:object-cover",
      },
    },
    defaultVariants: { variant: "icon" },
  },
);

function AttachmentMedia({ className, variant = "icon", ...props }: React.ComponentProps<"div"> & VariantProps<typeof attachmentMediaVariants>) {
  return <div data-slot="attachment-media" data-variant={variant} className={cn(attachmentMediaVariants({ variant }), className)} {...props} />;
}

function AttachmentContent({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="attachment-content" className={cn("max-w-full min-w-0 flex-1 leading-tight group-data-[orientation=vertical]/attachment:px-1 group-data-[orientation=vertical]/attachment:pb-1", className)} {...props} />;
}

function AttachmentTitle({ className, children, ...props }: React.ComponentProps<"span">) {
  return (
    <span data-slot="attachment-title" className={cn("block max-w-full min-w-0 truncate font-sans text-fg group-data-[state=idle]/attachment:text-fg-muted", className)} {...props}>
      <span className="group-data-[state=processing]/attachment:ds-shimmer group-data-[state=uploading]/attachment:ds-shimmer">{children}</span>
    </span>
  );
}

function AttachmentDescription({ className, ...props }: React.ComponentProps<"span">) {
  return <span data-slot="attachment-description" className={cn("mt-1 block max-w-full min-w-0 truncate font-mono text-caption leading-tight text-fg-muted group-data-[state=error]/attachment:font-sans group-data-[state=error]/attachment:text-danger", className)} {...props} />;
}

function AttachmentActions({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="attachment-actions" className={cn("relative z-20 flex shrink-0 items-center gap-0.5 group-data-[orientation=vertical]/attachment:absolute group-data-[orientation=vertical]/attachment:top-3 group-data-[orientation=vertical]/attachment:right-3", className)} {...props} />;
}

/** A row action on the attachment (remove, retry, download): a ghost glyph key, white on an image. */
function AttachmentAction({ className, variant, size = "icon-sm", ...props }: React.ComponentProps<typeof Button>) {
  return <Button data-slot="attachment-action" variant={variant ?? "ghost"} size={size} className={cn("group-data-[orientation=vertical]/attachment:bg-surface", className)} {...props} />;
}

/** Makes the whole card open the file: a button (or a link with asChild) stretched over it. */
function AttachmentTrigger({ className, asChild = false, type, ...props }: React.ComponentProps<"button"> & { asChild?: boolean }) {
  const Comp = asChild ? chakra.button : "button";
  // Chakra's factory renders its child in its place only when told to.
  const slotProps = asChild ? { asChild: true } : {};
  return <Comp {...slotProps} data-slot="attachment-trigger" type={asChild ? undefined : (type ?? "button")} className={cn("absolute inset-0 z-10 cursor-pointer outline-none", className)} {...props} />;
}

function AttachmentGroup({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="attachment-group"
      className={cn("flex min-w-0 snap-x snap-mandatory scroll-px-1 gap-2 overflow-x-auto overscroll-x-contain fade-x p-1 [scrollbar-width:none] *:data-[slot=attachment]:flex-none *:data-[slot=attachment]:snap-start", className)}
      {...props}
    />
  );
}

export { Attachment, AttachmentAction, AttachmentActions, AttachmentContent, AttachmentDescription, AttachmentGroup, AttachmentMedia, AttachmentTitle, AttachmentTrigger };
