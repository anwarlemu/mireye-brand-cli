# Sonner
A Bone panel with the 8px cut corner and a 1px Stone line, no shadow, a 6px diamond status mark (Fern success, brick error, outlined warning and information, the Dial while loading), a 13px medium title and square keys.

Install: npx mireye-ds add sonner
Requires: theme, dial, diamond
Packages: @phosphor-icons/react, sonner
Exports: Toaster
Client boundary: yes
Reference: Not in Figma. Drawn in Mireye's grammar: the Bone cut frame of Figma UI · Inputs (442:107) and the status diamonds of Figma UI · Status and tags (442:177)


## Usage
Use for a short report on something that just happened (a survey finished, an export failed), with an Undo or Retry action when there is one. Mount Toaster once near the root and call toast() from anywhere.
- Avoid: Information people must act on (use Alert Dialog)
- Avoid: A circle or a filled glyph as the status mark
- Avoid: Rounded corners or a shadow
- Avoid: More than one action


## Examples
Example components: npx mireye-ds add sonner button
Example packages: sonner
[Preview](https://mireye-ds.agencidev.com/preview/sonner/Preview)

examples/sonner.tsx

```tsx
"use client";

import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Toaster } from "@/components/ui/sonner";

export function Preview() {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <Toaster />
      <Button
        variant="outline"
        onClick={() =>
          toast("Site 14 removed", {
            description: "Its 6 parcels left the shortlist.",
            action: { label: "Undo", onClick: () => toast.success("Site 14 restored") },
          })
        }
      >
        Remove site
      </Button>
      <Button variant="outline" onClick={() => toast.success("Survey complete", { description: "212 acres in Weld County scored 86 against your requirements." })}>
        Success
      </Button>
      <Button variant="outline" onClick={() => toast.error("Export failed", { description: "The shapefile is over 50 MB. Export fewer parcels." })}>
        Error
      </Button>
      <Button variant="outline" onClick={() => toast.warning("Floodplain overlap", { description: "18 acres of parcel 0412-07 sit in the 100-year floodplain." })}>
        Warning
      </Button>
      <Button variant="outline" onClick={() => toast.info("New county data", { description: "Larimer County parcels were updated on Oct 30." })}>
        Info
      </Button>
      <Button
        variant="outline"
        onClick={() =>
          // ds-latency: demonstrates a pending notification; no control or input waits for the demo timer.
          toast.promise(new Promise((resolve) => setTimeout(resolve, 1600)), {
            loading: "Scoring 24 sites...",
            success: "24 sites scored",
            error: "Could not score the sites",
          })
        }
      >
        Promise
      </Button>
    </div>
  );
}

```

## Source

components/ui/sonner.tsx

```tsx
"use client";

import * as React from "react";
import { XIcon } from "@phosphor-icons/react/ssr";
import { Toaster as Sonner, type ToasterProps } from "sonner";

import { Dial } from "@/components/ui/dial";
import { Diamond } from "@/components/ui/diamond";

// Toasts. Figma has none, so they are drawn in Mireye's grammar: a white panel with the 8px cut corner and a 1px Stone
// line (Forest while focused), no shadow, 16px of padding. A 6px diamond marks the status before the text: solid Fern
// for success, solid brick for an error, outlined for a warning (in the warning color) and for information (in Forest),
// and the Dial turns while something is loading. Then the 13px medium Forest title over a 13px line in the secondary
// ink (a long one scrolls past 160px and keeps its line breaks), and two square 32px keys for its action (the Forest
// key) and cancel (the white framed key). The close key is a square 24px key 8px from the top and right edges with a
// 16px X, Fog under the pointer and Mist while pressed. The stack sits 20px above the bottom and 24px in from the right.
// Sonner stacks, swipes and times them; its motion (400ms, ease) is kept as Emil Kowalski tuned it.
//
// Sonner draws its own pseudo-elements on each toast (the hover bridge between stacked toasts, the swipe area), so the
// cut frame cannot use ds-cut-frame's ::before and ::after here. The same frame is drawn on the toast itself instead:
// a 1px line all round, a clip that cuts the corner (and keeps the bridge above the toast), and the corner's 1px
// diagonal painted as a gradient on the line's side of the clip, so the cut edge carries the line too.
const FRAME: React.CSSProperties = {
  border: "var(--ds-border-width) solid var(--ds-shape-stroke)",
  borderRadius: 0,
  boxShadow: "none",
  background:
    "linear-gradient(to bottom right, transparent 50%, var(--ds-shape-stroke) 50%, var(--ds-shape-stroke) calc(50% + var(--ds-border-width)), transparent calc(50% + var(--ds-border-width))) 0 0 / var(--ds-cut) var(--ds-cut) no-repeat border-box, var(--ds-color-bg-default)",
  clipPath: "polygon(0 calc(-1 * var(--gap) - var(--ds-border-width)), 100% calc(-1 * var(--gap) - var(--ds-border-width)), 100% 100%, 0 100%, 0 var(--ds-cut), var(--ds-cut) 0, 0 0)",
};

const KEY =
  "inline-flex h-8! shrink-0 items-center rounded-none! px-3! font-sans text-body! leading-tight font-medium! outline-none transition-[background-color] duration-150 ease-out active:duration-0 focus-visible:outline-solid focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-line-strong motion-reduce:transition-none";

function Toaster({ toastOptions, ...props }: ToasterProps) {
  return (
    <Sonner
      data-slot="sonner"
      className="toaster group"
      offset={{ bottom: 20, right: 24 }}
      icons={{
        success: <Diamond size={10} className="text-success" />,
        info: <Diamond size={10} variant="outline" className="text-fg" />,
        warning: <Diamond size={10} variant="outline" className="text-warning" />,
        error: <Diamond size={10} className="text-danger" />,
        loading: <Dial />,
        close: <XIcon className="size-4" />,
      }}
      toastOptions={{
        ...toastOptions,
        style: { ...FRAME, ...toastOptions?.style },
        classNames: {
          toast: "group/toast flex! w-(--width) items-start! gap-3! p-4! font-sans text-fg [--ds-shape-stroke:var(--ds-color-border-default)] focus-visible:[--ds-shape-stroke:var(--ds-color-border-strong)]",
          icon: "m-0! flex h-4! w-auto! shrink-0 items-center justify-center",
          content: "grid min-w-0 flex-1 gap-1 pr-6",
          title: "text-body! leading-tight font-medium! text-fg",
          description: "max-h-40 overflow-y-auto fade-y text-body! leading-body text-fg-secondary! whitespace-pre-line wrap-anywhere",
          actionButton: `${KEY} bg-primary! text-on-primary! hover:bg-primary-hover! active:bg-primary!`,
          cancelButton: `${KEY} border! border-line! bg-surface! text-fg! hover:bg-subtle! active:bg-subtle-hover!`,
          closeButton:
            "top-2! right-2! left-auto! inline-flex size-6! transform-none! items-center justify-center rounded-none! border-0! bg-transparent! text-fg! shadow-none! outline-none transition-[background-color] duration-150 ease-out hover:bg-subtle! active:bg-subtle-hover! active:duration-0 focus-visible:outline-solid focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-line-strong motion-reduce:transition-none",
          ...toastOptions?.classNames,
        },
      }}
      style={
        {
          "--width": "22.25rem",
          "--normal-bg": "var(--ds-color-bg-default)",
          "--normal-text": "var(--ds-color-text-default)",
          "--normal-border": "var(--ds-color-border-default)",
          "--border-radius": "0",
        } as React.CSSProperties
      }
      {...props}
    />
  );
}

export { Toaster };

```
