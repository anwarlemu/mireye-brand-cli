# Bubble
A message in the Figma cut frame: Bone with the 1px Stone line and the 8px chamfer, Fog for replies, Mist for system notes, Forest when one must lead, or plain text for the agent's answer.

Install: npx mireye-ds add bubble
Requires: theme, utils
Packages: @chakra-ui/react, class-variance-authority
Exports: Bubble, BubbleContent, BubbleGroup, BubbleReactions, bubbleVariants
Client boundary: yes
Reference: Figma UI · Agent chat (443:433): Message, at the product scale


## Usage
Use inside Message for each piece of a conversation with the agent. Use the default Bone frame with align end for what the person asked, ghost for the agent's answer (it reads like a report), secondary for a short reply or a note from another agent, muted for a system note and destructive for a question that failed. Stack consecutive bubbles in a BubbleGroup. BubbleReactions pins a short tag (2 sources) to an edge.
- Avoid: Rounded corners or tails
- Avoid: Shadows
- Avoid: A cut corner anywhere but the top-left
- Avoid: An entrance animation on each bubble
- Avoid: Text smaller than 13px


## Examples
Example components: npx mireye-ds add bubble
[Preview](https://mireye-ds.agencidev.com/preview/bubble/Preview) | [Variants](https://mireye-ds.agencidev.com/preview/bubble/Variants)

examples/bubble.tsx

```tsx
import { Bubble, BubbleContent, BubbleGroup, BubbleReactions } from "@/components/ui/bubble";

export function Preview() {
  return (
    <div className="mx-auto flex w-full max-w-120 flex-col gap-4">
      <Bubble align="end">
        <BubbleContent>Check flood risk and terrain for this parcel.</BubbleContent>
      </Bubble>
      <Bubble variant="ghost">
        <BubbleContent>The parcel is in Zone X, outside the 100-year flood plain. It sits at 412 ft with a 2.8% average slope.</BubbleContent>
      </Bubble>
      <BubbleGroup>
        <Bubble variant="secondary">
          <BubbleContent>Elevation came from the 10 m model.</BubbleContent>
        </Bubble>
        <Bubble variant="secondary">
          <BubbleContent>Slope is computed from the same model.</BubbleContent>
          <BubbleReactions align="start">2 sources</BubbleReactions>
        </Bubble>
      </BubbleGroup>
    </div>
  );
}

export function Variants() {
  return (
    <div className="mx-auto flex w-full max-w-120 flex-col gap-3">
      <Bubble variant="muted">
        <BubbleContent>Search widened to 25 mi.</BubbleContent>
      </Bubble>
      <Bubble variant="inverse" align="end">
        <BubbleContent>Shortlist Ellis County site 14.</BubbleContent>
      </Bubble>
      <Bubble variant="destructive" align="end">
        <BubbleContent>Not answered. The elevation source did not respond.</BubbleContent>
      </Bubble>
      <Bubble align="end">
        <BubbleContent asChild>
          <button type="button">Ask again</button>
        </BubbleContent>
      </Bubble>
    </div>
  );
}

```

## Source

components/ui/bubble.tsx

```tsx
"use client";

import * as React from "react";
import { chakra } from "@chakra-ui/react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

// A message in an agent conversation, drawn as the Figma message (UI · Agent chat, 443:433): 13px Forest text in a cut
// frame, 16px sides and 12px above and below, the 8px chamfer at the top-left. No tails and no radius.
// - `default` (also `outline`): the white cut frame with the 1px Stone line; what the person asked.
// - `secondary` (also `tinted`): Fog with no line; a reply or a note from another agent.
// - `muted`: Mist with no line and Forest at 80%; a system note.
// - `inverse`: Forest with white text; use rarely, for the one message that must lead.
// - `ghost`: no box; the agent's answer set as plain text, so long output reads like a report.
// - `destructive`: the cut frame with the line in the chosen danger colour and danger text; a question that failed.
// A bubble that is a button or link fills one step (white to Fog, Fog to Mist) under the pointer, 150ms. Bubbles never
// animate in: a conversation is read all day.
const BubbleContext = React.createContext<string>("default");

function BubbleGroup({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="bubble-group" className={cn("flex min-w-0 flex-col gap-1", className)} {...props} />;
}

function Bubble({ variant = "default", align = "start", className, ...props }: React.ComponentProps<"div"> & VariantProps<typeof bubbleVariants> & { align?: "start" | "end" }) {
  return (
    <BubbleContext.Provider value={variant ?? "default"}>
      <div data-slot="bubble" data-variant={variant} data-align={align} className={cn("group/bubble relative flex w-fit max-w-[80%] min-w-0 flex-col gap-1 group-data-[align=end]/message:self-end data-[align=end]:self-end data-[variant=ghost]:max-w-full", className)} {...props} />
    </BubbleContext.Provider>
  );
}

const FRAME = "ds-cut-frame [--ds-shape-fill:var(--ds-color-bg-default)] [--ds-shape-stroke:var(--ds-color-border-default)]";
const bubbleVariants = cva(
  "w-fit max-w-full min-w-0 font-sans text-body leading-body break-words group-data-[align=end]/bubble:self-end [button]:cursor-pointer [button]:text-left [button,a]:outline-none [button,a]:after:transition-[background-color] [button,a]:after:duration-fast [button,a]:after:ease-out [button,a]:focus-visible:outline-solid [button,a]:focus-visible:outline-1 [button,a]:focus-visible:outline-offset-2 [button,a]:focus-visible:outline-line-strong motion-reduce:after:transition-none",
  {
    variants: {
      variant: {
        default: `${FRAME} px-4 py-3 text-fg [button,a]:hover:[--ds-shape-fill:var(--ds-color-bg-subtle)]`,
        outline: `${FRAME} px-4 py-3 text-fg [button,a]:hover:[--ds-shape-fill:var(--ds-color-bg-subtle)]`,
        secondary: "ds-cut px-4 py-3 text-fg [--ds-shape-fill:var(--ds-color-bg-subtle)] [button,a]:hover:[--ds-shape-fill:var(--ds-color-bg-subtle-hover)]",
        tinted: "ds-cut px-4 py-3 text-fg [--ds-shape-fill:var(--ds-color-bg-subtle)] [button,a]:hover:[--ds-shape-fill:var(--ds-color-bg-subtle-hover)]",
        muted: "ds-cut px-4 py-3 text-fg-secondary [--ds-shape-fill:var(--ds-color-bg-subtle-hover)]",
        inverse: "ds-cut px-4 py-3 text-fg-inverse [--ds-shape-fill:var(--ds-color-bg-inverse)] [button,a]:hover:[--ds-shape-fill:var(--ds-color-action-primary-hover)]",
        ghost: "p-0 text-fg",
        destructive: "ds-cut-frame px-4 py-3 text-danger [--ds-shape-fill:var(--ds-color-bg-default)] [--ds-shape-stroke:var(--ds-color-status-danger)] [button,a]:hover:[--ds-shape-fill:var(--ds-color-bg-subtle)]",
      },
    },
    defaultVariants: { variant: "default" },
  },
);

function BubbleContent({ asChild = false, className, ...props }: React.ComponentProps<"div"> & { asChild?: boolean }) {
  const variant = React.useContext(BubbleContext) as VariantProps<typeof bubbleVariants>["variant"];
  const Comp = asChild ? chakra.div : "div";
  // Chakra's factory renders its child in its place only when told to.
  const slotProps = asChild ? { asChild: true } : {};
  return <Comp {...slotProps} data-slot="bubble-content" className={cn(bubbleVariants({ variant }), className)} {...props} />;
}

const bubbleReactionsVariants = cva("absolute z-10 flex w-fit shrink-0 items-center justify-center gap-1 border border-line bg-surface px-1.5 py-0.5 text-caption leading-tight text-fg has-[button]:p-0", {
  variants: {
    side: { top: "top-0 -translate-y-3/4", bottom: "bottom-0 translate-y-3/4" },
    align: { start: "left-3", end: "right-3" },
  },
  defaultVariants: { side: "bottom", align: "end" },
});

/** Reactions or a short tag pinned to a bubble's edge: a white square with the 1px Stone line. */
function BubbleReactions({ side = "bottom", align = "end", className, ...props }: React.ComponentProps<"div"> & { align?: "start" | "end"; side?: "top" | "bottom" }) {
  return <div data-slot="bubble-reactions" data-align={align} data-side={side} className={cn(bubbleReactionsVariants({ side, align }), className)} {...props} />;
}

export { Bubble, BubbleContent, BubbleGroup, BubbleReactions, bubbleVariants };

```
