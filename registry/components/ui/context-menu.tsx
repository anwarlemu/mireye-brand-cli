"use client";

import * as React from "react";
import { ContextMenu as ContextMenuPrimitive } from "radix-ui";
import { CaretRightIcon } from "@phosphor-icons/react/ssr";

import { CheckIcon } from "@/components/icons/check";

import { usePortalContainer } from "@/lib/surface";
import { cn } from "@/lib/utils";

// A right-click menu, drawn as the dropdown menu (Figma has no menu; this is Mireye's grammar): a white panel with the
// 6px cut corner and a 1px Stone line, no shadow, 4px inside the line; square rows of at least 32px with a 13px Forest
// label after a 16px glyph, Fog under the highlighted row and Mist while pressed, at once; a chosen row ends in
// Mireye's check; section labels 12px in the secondary ink, Mist separators, 12px muted shortcuts, brick destructive
// rows. It grows out of the pointer from 98 percent with a fade (150ms) and leaves in 120ms.
const CONTENT =
  "ds-cut-frame z-50 flex max-h-(--radix-context-menu-content-available-height) min-w-48 flex-col p-px text-fg outline-none [--ds-cut:var(--ds-cut-md)] [--ds-shape-fill:var(--ds-color-bg-default)] [--ds-shape-stroke:var(--ds-color-border-default)] data-[state=closed]:animate-pop-out data-[state=open]:animate-pop-in";
const SCROLL = "min-h-0 overflow-x-hidden overflow-y-auto overscroll-contain fade-y p-1";
const ITEM =
  "relative flex min-h-8 cursor-default items-center gap-2 px-3 py-1.5 font-sans text-body leading-tight font-normal text-fg outline-none select-none data-[disabled]:pointer-events-none data-[disabled]:text-fg-subtle data-[highlighted]:bg-subtle data-[highlighted]:active:bg-subtle-hover data-[inset]:pl-9 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-']):not([data-slot])]:size-4";
const CHECK = "pointer-events-none ml-auto flex size-4 shrink-0 items-center justify-center pl-1";

function ContextMenu(props: React.ComponentProps<typeof ContextMenuPrimitive.Root>) {
  return <ContextMenuPrimitive.Root data-slot="context-menu" {...props} />;
}

function ContextMenuPortal(props: React.ComponentProps<typeof ContextMenuPrimitive.Portal>) {
  const container = usePortalContainer();
  return <ContextMenuPrimitive.Portal data-slot="context-menu-portal" container={container} {...props} />;
}

function ContextMenuTrigger({ className, ...props }: React.ComponentProps<typeof ContextMenuPrimitive.Trigger>) {
  return <ContextMenuPrimitive.Trigger data-slot="context-menu-trigger" className={cn("select-none", className)} {...props} />;
}

function ContextMenuContent({ className, children, ...props }: React.ComponentProps<typeof ContextMenuPrimitive.Content>) {
  return (
    <ContextMenuPortal>
      <ContextMenuPrimitive.Content data-slot="context-menu-content" className={cn(CONTENT, "origin-(--radix-context-menu-content-transform-origin)", className)} {...props}>
        <div className={SCROLL}>{children}</div>
      </ContextMenuPrimitive.Content>
    </ContextMenuPortal>
  );
}

function ContextMenuGroup(props: React.ComponentProps<typeof ContextMenuPrimitive.Group>) {
  return <ContextMenuPrimitive.Group data-slot="context-menu-group" {...props} />;
}

function ContextMenuItem({ className, inset, variant = "default", ...props }: React.ComponentProps<typeof ContextMenuPrimitive.Item> & { inset?: boolean; variant?: "default" | "destructive" }) {
  return (
    <ContextMenuPrimitive.Item
      data-slot="context-menu-item"
      data-inset={inset || undefined}
      data-variant={variant}
      className={cn(ITEM, "data-[variant=destructive]:text-danger", className)}
      {...props}
    />
  );
}

function ContextMenuCheckboxItem({ className, children, checked, ...props }: React.ComponentProps<typeof ContextMenuPrimitive.CheckboxItem>) {
  return (
    <ContextMenuPrimitive.CheckboxItem data-slot="context-menu-checkbox-item" checked={checked} className={cn(ITEM, className)} {...props}>
      {children}
      <span className={CHECK}>
        <ContextMenuPrimitive.ItemIndicator>
          <CheckIcon />
        </ContextMenuPrimitive.ItemIndicator>
      </span>
    </ContextMenuPrimitive.CheckboxItem>
  );
}

function ContextMenuRadioGroup(props: React.ComponentProps<typeof ContextMenuPrimitive.RadioGroup>) {
  return <ContextMenuPrimitive.RadioGroup data-slot="context-menu-radio-group" {...props} />;
}

// The chosen option ends in the same check as a checkbox item.
function ContextMenuRadioItem({ className, children, ...props }: React.ComponentProps<typeof ContextMenuPrimitive.RadioItem>) {
  return (
    <ContextMenuPrimitive.RadioItem data-slot="context-menu-radio-item" className={cn(ITEM, className)} {...props}>
      {children}
      <span className={CHECK}>
        <ContextMenuPrimitive.ItemIndicator>
          <CheckIcon />
        </ContextMenuPrimitive.ItemIndicator>
      </span>
    </ContextMenuPrimitive.RadioItem>
  );
}

function ContextMenuLabel({ className, inset, ...props }: React.ComponentProps<typeof ContextMenuPrimitive.Label> & { inset?: boolean }) {
  return <ContextMenuPrimitive.Label data-slot="context-menu-label" data-inset={inset || undefined} className={cn("px-3 pt-2 pb-1 font-sans text-caption leading-tight font-normal text-fg-secondary data-[inset]:pl-9", className)} {...props} />;
}

function ContextMenuSeparator({ className, ...props }: React.ComponentProps<typeof ContextMenuPrimitive.Separator>) {
  return <ContextMenuPrimitive.Separator data-slot="context-menu-separator" className={cn("-mx-1 my-1 h-px border-0 bg-line-subtle", className)} {...props} />;
}

function ContextMenuShortcut({ className, ...props }: React.ComponentProps<"span">) {
  return <span data-slot="context-menu-shortcut" className={cn("ml-auto pl-4 font-sans text-caption leading-tight text-fg-muted", className)} {...props} />;
}

function ContextMenuSub(props: React.ComponentProps<typeof ContextMenuPrimitive.Sub>) {
  return <ContextMenuPrimitive.Sub data-slot="context-menu-sub" {...props} />;
}

function ContextMenuSubTrigger({ className, inset, children, ...props }: React.ComponentProps<typeof ContextMenuPrimitive.SubTrigger> & { inset?: boolean }) {
  return (
    <ContextMenuPrimitive.SubTrigger data-slot="context-menu-sub-trigger" data-inset={inset || undefined} className={cn(ITEM, "data-[state=open]:bg-subtle", className)} {...props}>
      {children}
      <CaretRightIcon className="ml-auto size-4 text-fg-secondary" />
    </ContextMenuPrimitive.SubTrigger>
  );
}

function ContextMenuSubContent({ className, children, ...props }: React.ComponentProps<typeof ContextMenuPrimitive.SubContent>) {
  return (
    <ContextMenuPortal>
      <ContextMenuPrimitive.SubContent data-slot="context-menu-sub-content" className={cn(CONTENT, "origin-(--radix-context-menu-content-transform-origin)", className)} {...props}>
        <div className={SCROLL}>{children}</div>
      </ContextMenuPrimitive.SubContent>
    </ContextMenuPortal>
  );
}

export {
  ContextMenu,
  ContextMenuCheckboxItem,
  ContextMenuContent,
  ContextMenuGroup,
  ContextMenuItem,
  ContextMenuLabel,
  ContextMenuPortal,
  ContextMenuRadioGroup,
  ContextMenuRadioItem,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuTrigger,
};
