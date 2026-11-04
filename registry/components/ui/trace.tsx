"use client";

import * as React from "react";

import { ArrowRightIcon } from "@/components/icons/arrow-right";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Diamond } from "@/components/ui/diamond";
import { cn } from "@/lib/utils";

// An agent's steps as it works, drawn as the Figma chat steps (UI · Agent chat, 443:445 to 443:453): a 6px outlined
// Forest diamond, then the 13px label in Forest at 80%, rows 12px apart. TraceNode is that diamond and follows the line's
// status: done is the outline, running adds a 2px node inside that breathes (opacity, 1.2s each way) while its label
// carries the shimmer, pending is a Stone outline with a Slate label, error a danger outline and label. A Phosphor glyph
// in TraceIcon can stand in for the node when the tool matters. A step that can open shows Mireye's chevron after its
// title, turning a quarter when open (state, never hover); its detail hangs from a 1px Stone rule 8px in, in 13px
// Forest at 80%, and opens with its height. A line that is a link or button steps to Forest on hover (150ms). Under
// reduced motion nothing breathes or shimmers.
function Trace({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="trace"
      className={cn(
        "flex w-full min-w-0 flex-col gap-3 *:has-[>[data-slot=trace-line]]:flex *:has-[>[data-slot=trace-line]]:w-fit *:has-[>[data-slot=trace-line]]:max-w-full *:has-[>[data-slot=trace-line]]:min-w-0 *:has-[>[data-slot=trace-line]]:text-left *:has-[>[data-slot=trace-line]]:outline-none *:has-[>[data-slot=trace-line]]:focus-visible:outline-solid *:has-[>[data-slot=trace-line]]:focus-visible:outline-1 *:has-[>[data-slot=trace-line]]:focus-visible:outline-offset-2 *:has-[>[data-slot=trace-line]]:focus-visible:outline-line-strong",
        className,
      )}
      {...props}
    />
  );
}

function TraceLine({ className, status, ...props }: React.ComponentProps<"span"> & { status?: "running" | "error" | "pending" }) {
  return (
    <span
      data-slot="trace-line"
      data-status={status}
      className={cn(
        "group/trace-line flex w-fit max-w-full min-w-0 items-center gap-2.5 font-sans text-body leading-body text-fg-secondary transition-colors duration-fast ease-out in-[a,button]:cursor-pointer in-[a:hover,button:hover]:text-fg data-[status=error]:text-danger data-[status=pending]:text-fg-subtle motion-reduce:transition-none",
        className,
      )}
      {...props}
    />
  );
}

/** The step's node: an outlined diamond that follows the line's status. */
function TraceNode({ className, ...props }: React.ComponentProps<"span">) {
  return (
    <span data-slot="trace-node" aria-hidden="true" className={cn("relative flex size-4 shrink-0 items-center justify-center text-fg group-data-[status=error]/trace-line:text-danger group-data-[status=pending]/trace-line:text-line", className)} {...props}>
      <Diamond size={10} variant="outline" />
      <span className="absolute inset-0 hidden items-center justify-center group-data-[status=running]/trace-line:flex">
        <Diamond size={4} className="motion-safe:animate-[ds-breathe_1.2s_var(--ds-easing-in-out)_infinite_alternate]" />
      </span>
    </span>
  );
}

/** A 16px Phosphor glyph in place of the node, for a step whose tool matters (searched, measured, read). */
function TraceIcon({ className, ...props }: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="trace-icon"
      aria-hidden="true"
      className={cn("flex size-4 shrink-0 items-center justify-center text-fg group-data-[status=error]/trace-line:text-danger group-data-[status=pending]/trace-line:text-fg-subtle [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 [[data-slot=trace-title]~&]:-ml-1", className)}
      {...props}
    />
  );
}

function TraceTitle({ className, ...props }: React.ComponentProps<"span">) {
  return <span data-slot="trace-title" className={cn("min-w-0 truncate group-data-[status=running]/trace-line:ds-shimmer", className)} {...props} />;
}

/** A step's quiet detail at its end: a duration or a count, in DM Mono, Slate. */
function TraceDescription({ className, ...props }: React.ComponentProps<"span">) {
  return <span data-slot="trace-description" className={cn("shrink-0 font-mono text-caption text-fg-subtle tabular-nums", className)} {...props} />;
}

function TraceCollapsible({
  className,
  ...props
}: Omit<React.ComponentProps<typeof Collapsible>, "asChild" | "open"> & ({ open?: undefined } | { open: boolean; onOpenChange: NonNullable<React.ComponentProps<typeof Collapsible>["onOpenChange"]> })) {
  return <Collapsible data-slot="trace-collapsible" className={cn("flex w-full min-w-0 flex-col", className)} {...props} />;
}

function TraceCollapsibleTrigger({ className, children, ...props }: Omit<React.ComponentProps<typeof CollapsibleTrigger>, "asChild">) {
  return (
    <CollapsibleTrigger
      data-slot="trace-collapsible-trigger"
      className={cn(
        "group/trace-collapsible-trigger flex w-fit max-w-full min-w-0 cursor-pointer items-center gap-1.5 text-left text-fg-secondary outline-none transition-colors duration-fast ease-out hover:text-fg focus-visible:outline-solid focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-line-strong has-[[data-status=error]]:text-danger motion-reduce:transition-none",
        className,
      )}
      {...props}
    >
      {children}
      <ArrowRightIcon size={16} head aria-hidden className="shrink-0 text-fg-muted transition-transform duration-base ease-out group-aria-expanded/trace-collapsible-trigger:rotate-90 motion-reduce:transition-none" />
    </CollapsibleTrigger>
  );
}

function TraceCollapsibleContent({ className, children, ...props }: Omit<React.ComponentProps<typeof CollapsibleContent>, "asChild">) {
  return (
    <CollapsibleContent data-slot="trace-collapsible-content" className="min-w-0" {...props}>
      <div data-slot="trace-collapsible-content-inner" className={cn("mt-2 mb-1 ml-2 min-w-0 border-l border-line pr-1 pl-4 font-sans text-body leading-body [overflow-wrap:anywhere] text-fg-secondary", className)}>
        {children}
      </div>
    </CollapsibleContent>
  );
}

export { Trace, TraceCollapsible, TraceCollapsibleContent, TraceCollapsibleTrigger, TraceDescription, TraceIcon, TraceLine, TraceNode, TraceTitle };
