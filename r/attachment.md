# Attachment
A file in the Bone cut frame with a 6px chamfer: a square Fog tile with the file's glyph, the name in Forest and its size in DM Mono; uploading names shimmer, failed files take the danger line.

Install: npx mireye-ds add attachment
Requires: theme, button, utils
Packages: @chakra-ui/react, class-variance-authority
Exports: Attachment, AttachmentAction, AttachmentActions, AttachmentContent, AttachmentDescription, AttachmentGroup, AttachmentMedia, AttachmentTitle, AttachmentTrigger
Client boundary: yes
Reference: Figma UI · Inputs (442:107): the field's cut frame and the site chip's Fog, at the product scale


## Usage
Use for a file attached to a question or produced by a report (a parcel export, a site plan, a KML boundary). Show the size or the upload state in AttachmentDescription. Add AttachmentTrigger to open the file and AttachmentAction for remove, retry or download. Use orientation="vertical" for images and AttachmentGroup for a row of files. A row of attachments fades at the side (fade-x) where more scroll past it.
- Avoid: Rounded or pill cards
- Avoid: Dashed lines
- Avoid: Coloured file tiles
- Avoid: A pulsing card
- Avoid: Shadows


## Examples
Example components: npx mireye-ds add attachment
Example packages: @phosphor-icons/react
[Preview](https://mireye-ds.agencidev.com/preview/attachment/Preview) | [States](https://mireye-ds.agencidev.com/preview/attachment/States) | [Vertical](https://mireye-ds.agencidev.com/preview/attachment/Vertical) | [Sizes](https://mireye-ds.agencidev.com/preview/attachment/Sizes)

examples/attachment.tsx

```tsx
"use client";

import * as React from "react";
import { ArrowClockwiseIcon, DownloadSimpleIcon, FileCsvIcon, FilePdfIcon, GlobeHemisphereWestIcon, ImageIcon, XIcon } from "@phosphor-icons/react/ssr";

import { Attachment, AttachmentAction, AttachmentActions, AttachmentContent, AttachmentDescription, AttachmentGroup, AttachmentMedia, AttachmentTitle, AttachmentTrigger } from "@/components/ui/attachment";

export function Preview() {
  const [files, setFiles] = React.useState([
    { name: "site-14-report.pdf", size: "2.4 MB", icon: FilePdfIcon },
    { name: "ellis-parcels.csv", size: "1.2 MB", icon: FileCsvIcon },
    { name: "site-boundary.kml", size: "18 KB", icon: GlobeHemisphereWestIcon },
  ]);
  return (
    <AttachmentGroup className="max-w-full">
      {files.map(({ name, size, icon: Icon }) => (
        <Attachment key={name}>
          <AttachmentTrigger aria-label={`Open ${name}`} />
          <AttachmentMedia>
            <Icon />
          </AttachmentMedia>
          <AttachmentContent>
            <AttachmentTitle>{name}</AttachmentTitle>
            <AttachmentDescription>{size}</AttachmentDescription>
          </AttachmentContent>
          <AttachmentActions>
            <AttachmentAction aria-label={`Remove ${name}`} onClick={() => setFiles((all) => all.filter((f) => f.name !== name))}>
              <XIcon />
            </AttachmentAction>
          </AttachmentActions>
        </Attachment>
      ))}
    </AttachmentGroup>
  );
}

export function States() {
  return (
    <div className="flex flex-wrap items-start gap-3">
      <Attachment state="idle">
        <AttachmentMedia>
          <FileCsvIcon />
        </AttachmentMedia>
        <AttachmentContent>
          <AttachmentTitle>buy-box.csv</AttachmentTitle>
          <AttachmentDescription>Waiting</AttachmentDescription>
        </AttachmentContent>
      </Attachment>
      <Attachment state="uploading">
        <AttachmentMedia>
          <FilePdfIcon />
        </AttachmentMedia>
        <AttachmentContent>
          <AttachmentTitle>site-plan.pdf</AttachmentTitle>
          <AttachmentDescription>62% of 4.8 MB</AttachmentDescription>
        </AttachmentContent>
      </Attachment>
      <Attachment state="error">
        <AttachmentMedia>
          <FileCsvIcon />
        </AttachmentMedia>
        <AttachmentContent>
          <AttachmentTitle>navarro-parcels.csv</AttachmentTitle>
          <AttachmentDescription>Larger than 25 MB</AttachmentDescription>
        </AttachmentContent>
        <AttachmentActions>
          <AttachmentAction aria-label="Retry navarro-parcels.csv">
            <ArrowClockwiseIcon />
          </AttachmentAction>
        </AttachmentActions>
      </Attachment>
    </div>
  );
}

export function Vertical() {
  return (
    <div className="flex flex-wrap items-start gap-3">
      <Attachment orientation="vertical">
        <AttachmentMedia variant="image">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/examples/farmland-aerial.jpg" alt="" />
        </AttachmentMedia>
        <AttachmentContent>
          <AttachmentTitle>aerial-site-14.jpg</AttachmentTitle>
          <AttachmentDescription>164 KB</AttachmentDescription>
        </AttachmentContent>
        <AttachmentActions>
          <AttachmentAction aria-label="Download aerial-site-14.jpg">
            <DownloadSimpleIcon />
          </AttachmentAction>
        </AttachmentActions>
      </Attachment>
      <Attachment orientation="vertical" state="processing">
        <AttachmentMedia>
          <ImageIcon />
        </AttachmentMedia>
        <AttachmentContent>
          <AttachmentTitle>survey-scan.png</AttachmentTitle>
          <AttachmentDescription>Reading</AttachmentDescription>
        </AttachmentContent>
      </Attachment>
    </div>
  );
}

export function Sizes() {
  return (
    <div className="flex flex-wrap items-center gap-3">
      {(["default", "sm", "xs"] as const).map((size) => (
        <Attachment key={size} size={size}>
          <AttachmentMedia>
            <FilePdfIcon />
          </AttachmentMedia>
          <AttachmentContent>
            <AttachmentTitle>site-14-report.pdf</AttachmentTitle>
            <AttachmentDescription>2.4 MB</AttachmentDescription>
          </AttachmentContent>
        </Attachment>
      ))}
    </div>
  );
}

```

## Source

components/ui/attachment.tsx

```tsx
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

```
