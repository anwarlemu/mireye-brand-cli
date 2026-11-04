"use client";

import * as React from "react";
import { Select as SelectPrimitive } from "radix-ui";

import { ArrowRightIcon } from "@/components/icons/arrow-right";
import { Diamond } from "@/components/ui/diamond";
import { usePortalContainer } from "@/lib/surface";
import { cn } from "@/lib/utils";

// Mireye's select, drawn from the field (Figma "UI · Inputs", 442:107) and the unit list: the trigger is Input's frame
// (white, 1px Stone line, the 8px cut, 36px; `size="sm"` 32px) with the value in 13px Forest 16px in and the brand
// arrow's head turned down 16px from the right; it turns up while the list is open (150ms). Open or focused, the line
// is Forest; the placeholder is Slate; invalid turns the line brick; disabled sits on Mist with Slate text.
// The list floats 4px under the trigger in the same frame (no shadow), 4px inside, at least the trigger's width and
// at most 320px tall. Rows are 28px with 12px sides and 13px text in 80% Forest; the highlighted row is a Fog plate
// with the small cut, at once (it follows the keys), and the chosen row is full Forest with a solid diamond before it.
// Group labels are 12px in 72% Forest. The list fades in from 0.98 and out (the shared pop), from the trigger.
function Select(props: React.ComponentProps<typeof SelectPrimitive.Root>) {
  return <SelectPrimitive.Root data-slot="select" {...props} />;
}

function SelectGroup({ className, ...props }: React.ComponentProps<typeof SelectPrimitive.Group>) {
  return <SelectPrimitive.Group data-slot="select-group" className={cn("scroll-my-1", className)} {...props} />;
}

function SelectValue(props: React.ComponentProps<typeof SelectPrimitive.Value>) {
  return <SelectPrimitive.Value data-slot="select-value" {...props} />;
}

function SelectTrigger({ className, size = "default", children, ...props }: React.ComponentProps<typeof SelectPrimitive.Trigger> & { size?: "sm" | "default" }) {
  return (
    <SelectPrimitive.Trigger
      data-slot="select-trigger"
      data-size={size}
      className={cn(
        "ds-cut-frame group/select-trigger flex w-full min-w-0 cursor-pointer items-center justify-between gap-3 font-sans text-body leading-tight font-normal whitespace-nowrap text-fg outline-none data-[size=default]:h-9 data-[size=default]:px-4 data-[size=sm]:h-8 data-[size=sm]:px-3",
        "[--ds-shape-fill:var(--ds-color-bg-default)] [--ds-shape-stroke:var(--ds-color-border-default)] focus-visible:[--ds-shape-stroke:var(--ds-color-border-strong)] data-[state=open]:[--ds-shape-stroke:var(--ds-color-border-strong)]",
        "aria-invalid:[--ds-shape-stroke:var(--ds-color-status-danger)] disabled:cursor-not-allowed disabled:text-fg-subtle disabled:[--ds-shape-fill:var(--ds-color-bg-subtle-hover)] data-placeholder:text-fg-subtle",
        "*:data-[slot=select-value]:flex *:data-[slot=select-value]:min-w-0 *:data-[slot=select-value]:items-center *:data-[slot=select-value]:gap-2 *:data-[slot=select-value]:truncate [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([data-slot]):not([class*='size-'])]:size-4",
        className,
      )}
      {...props}
    >
      {children}
      <SelectPrimitive.Icon asChild>
        <ArrowRightIcon size={16} head className="rotate-90 text-fg transition-transform duration-fast ease-out group-data-[state=open]/select-trigger:-rotate-90 group-disabled/select-trigger:text-fg-subtle motion-reduce:transition-none" />
      </SelectPrimitive.Icon>
    </SelectPrimitive.Trigger>
  );
}

function SelectContent({ className, children, position = "popper", align = "center", sideOffset = 4, ...props }: React.ComponentProps<typeof SelectPrimitive.Content>) {
  const container = usePortalContainer();
  return (
    <SelectPrimitive.Portal container={container}>
      <SelectPrimitive.Content
        data-slot="select-content"
        className={cn(
          "ds-cut-frame relative z-50 max-h-[min(--spacing(80),var(--radix-select-content-available-height))] max-w-90 min-w-36 origin-(--radix-select-content-transform-origin) overflow-hidden text-fg [--ds-shape-fill:var(--ds-color-bg-default)] [--ds-shape-stroke:var(--ds-color-border-default)] data-[state=closed]:animate-pop-out data-[state=open]:animate-pop-in motion-reduce:animate-none",
          position === "popper" && "w-full min-w-(--radix-select-trigger-width)",
          className,
        )}
        position={position}
        align={align}
        sideOffset={position === "popper" ? sideOffset : undefined}
        {...props}
      >
        <SelectScrollUpButton />
        <SelectPrimitive.Viewport data-position={position} className={cn("flex flex-col gap-px p-1 *:data-[slot=select-group]:flex *:data-[slot=select-group]:flex-col *:data-[slot=select-group]:gap-px", position === "popper" && "h-(--radix-select-trigger-height) w-full min-w-(--radix-select-trigger-width) scroll-my-1")}>
          {children}
        </SelectPrimitive.Viewport>
        <SelectScrollDownButton />
      </SelectPrimitive.Content>
    </SelectPrimitive.Portal>
  );
}

function SelectLabel({ className, ...props }: React.ComponentProps<typeof SelectPrimitive.Label>) {
  return <SelectPrimitive.Label data-slot="select-label" className={cn("mt-2 mr-3 mb-1 ml-7 font-sans text-caption leading-line-caption font-normal text-fg-muted", className)} {...props} />;
}

function SelectItem({ className, children, ...props }: React.ComponentProps<typeof SelectPrimitive.Item>) {
  return (
    <SelectPrimitive.Item
      data-slot="select-item"
      className={cn(
        "group/select-item ds-cut relative flex h-7 w-full shrink-0 cursor-default items-center gap-2 px-3 font-sans text-body leading-tight font-normal text-fg-secondary outline-none select-none [--ds-cut:var(--ds-cut-sm)]",
        "data-highlighted:[--ds-shape-fill:var(--ds-color-bg-subtle)] data-[state=checked]:text-fg data-disabled:pointer-events-none data-disabled:text-fg-subtle",
        "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([data-slot]):not([class*='size-'])]:size-4",
        className,
      )}
      {...props}
    >
      <span data-slot="select-item-indicator" className="flex w-2 shrink-0 items-center justify-center">
        <SelectPrimitive.ItemIndicator>
          <Diamond size={8} className="size-1.5" />
        </SelectPrimitive.ItemIndicator>
      </span>
      {/* Radix drops ItemText's className, so the truncating box is a span around it. */}
      <span data-slot="select-item-text" className="min-w-0 flex-1 truncate [&_svg]:me-1.5 [&_svg]:inline-block [&_svg]:align-middle">
        <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
      </span>
    </SelectPrimitive.Item>
  );
}

function SelectSeparator({ className, ...props }: React.ComponentProps<typeof SelectPrimitive.Separator>) {
  return <SelectPrimitive.Separator data-slot="select-separator" className={cn("pointer-events-none -mx-1 my-1 h-px shrink-0 bg-line-subtle", className)} {...props} />;
}

function SelectScrollUpButton({ className, ...props }: React.ComponentProps<typeof SelectPrimitive.ScrollUpButton>) {
  return (
    <SelectPrimitive.ScrollUpButton data-slot="select-scroll-up-button" className={cn("flex h-6 cursor-default items-center justify-center text-fg-muted", className)} {...props}>
      <ArrowRightIcon size={16} head className="-rotate-90" />
    </SelectPrimitive.ScrollUpButton>
  );
}

function SelectScrollDownButton({ className, ...props }: React.ComponentProps<typeof SelectPrimitive.ScrollDownButton>) {
  return (
    <SelectPrimitive.ScrollDownButton data-slot="select-scroll-down-button" className={cn("flex h-6 cursor-default items-center justify-center text-fg-muted", className)} {...props}>
      <ArrowRightIcon size={16} head className="rotate-90" />
    </SelectPrimitive.ScrollDownButton>
  );
}

export { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectScrollDownButton, SelectScrollUpButton, SelectSeparator, SelectTrigger, SelectValue };
