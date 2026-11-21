"use client";

import * as React from "react";
import { Menubar as MenubarPrimitive } from "radix-ui";
import { CaretRightIcon } from "@phosphor-icons/react/ssr";

import { CheckIcon } from "@/components/icons/check";

import { usePortalContainer } from "@/lib/surface";
import { cn } from "@/lib/utils";

// A menu bar. Figma has none, so it is drawn in Mireye's grammar: the bar is a white frame with the 6px cut corner and
// a 1px Stone line, 4px inside it; its triggers are square 32px keys with a 13px regular Forest label, Fog under the
// pointer and while their menu is open, Mist while pressed. Its menus are the dropdown menu's panel (white, 6px cut,
// 1px Stone line, no shadow; square 32px rows, Fog highlight, Mist press, Mireye's check on a chosen row). A panel grows
// out of its trigger from 98 percent with a fade (150ms) and moving between menus along the bar is instant (a closing
// panel that lingered would dismiss the next one, and the move is made by keyboard and pointer many times).
const CONTENT =
  "ds-cut-frame z-50 flex max-h-(--radix-menubar-content-available-height) min-w-48 flex-col p-px text-fg outline-none [--ds-cut:var(--ds-cut-md)] [--ds-shape-fill:var(--ds-color-bg-default)] [--ds-shape-stroke:var(--ds-color-border-default)] data-[state=open]:animate-pop-in";
const SCROLL = "min-h-0 overflow-x-hidden overflow-y-auto overscroll-contain fade-y p-1";
const ITEM =
  "relative flex min-h-8 cursor-default items-center gap-2 px-3 py-1.5 font-sans text-body leading-tight font-normal text-fg outline-none select-none data-[disabled]:pointer-events-none data-[disabled]:text-fg-subtle data-[highlighted]:bg-subtle data-[highlighted]:active:bg-subtle-hover data-[inset]:pl-9 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-']):not([data-slot])]:size-4";
const CHECK = "pointer-events-none ml-auto flex size-4 shrink-0 items-center justify-center pl-1";

function Menubar({ className, ...props }: React.ComponentProps<typeof MenubarPrimitive.Root>) {
  return <MenubarPrimitive.Root data-slot="menubar" className={cn("ds-cut-frame flex h-10 w-fit items-center gap-1 p-1 [--ds-cut:var(--ds-cut-md)] [--ds-shape-fill:var(--ds-color-bg-default)] [--ds-shape-stroke:var(--ds-color-border-default)]", className)} {...props} />;
}

function MenubarMenu(props: React.ComponentProps<typeof MenubarPrimitive.Menu>) {
  return <MenubarPrimitive.Menu data-slot="menubar-menu" {...props} />;
}

function MenubarPortal(props: React.ComponentProps<typeof MenubarPrimitive.Portal>) {
  const container = usePortalContainer();
  return <MenubarPrimitive.Portal data-slot="menubar-portal" container={container} {...props} />;
}

function MenubarTrigger({ className, ...props }: React.ComponentProps<typeof MenubarPrimitive.Trigger>) {
  return (
    <MenubarPrimitive.Trigger
      data-slot="menubar-trigger"
      className={cn(
        "flex h-8 items-center gap-2 px-3 font-sans text-body leading-tight font-normal text-fg outline-none select-none transition-[background-color] duration-150 ease-out hover:bg-subtle active:bg-subtle-hover active:duration-0 focus-visible:outline-solid focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-line-strong data-[state=open]:bg-subtle data-[state=open]:active:bg-subtle-hover motion-reduce:transition-none",
        className,
      )}
      {...props}
    />
  );
}

function MenubarContent({ className, children, align = "start", alignOffset = -5, sideOffset = 8, ...props }: React.ComponentProps<typeof MenubarPrimitive.Content>) {
  return (
    <MenubarPortal>
      <MenubarPrimitive.Content data-slot="menubar-content" align={align} alignOffset={alignOffset} sideOffset={sideOffset} className={cn(CONTENT, "origin-(--radix-menubar-content-transform-origin)", className)} {...props}>
        <div className={SCROLL}>{children}</div>
      </MenubarPrimitive.Content>
    </MenubarPortal>
  );
}

function MenubarGroup(props: React.ComponentProps<typeof MenubarPrimitive.Group>) {
  return <MenubarPrimitive.Group data-slot="menubar-group" {...props} />;
}

function MenubarItem({ className, inset, variant = "default", ...props }: React.ComponentProps<typeof MenubarPrimitive.Item> & { inset?: boolean; variant?: "default" | "destructive" }) {
  return (
    <MenubarPrimitive.Item
      data-slot="menubar-item"
      data-inset={inset || undefined}
      data-variant={variant}
      className={cn(ITEM, "data-[variant=destructive]:text-danger", className)}
      {...props}
    />
  );
}

function MenubarCheckboxItem({ className, children, checked, ...props }: React.ComponentProps<typeof MenubarPrimitive.CheckboxItem>) {
  return (
    <MenubarPrimitive.CheckboxItem data-slot="menubar-checkbox-item" checked={checked} className={cn(ITEM, className)} {...props}>
      {children}
      <span className={CHECK}>
        <MenubarPrimitive.ItemIndicator>
          <CheckIcon />
        </MenubarPrimitive.ItemIndicator>
      </span>
    </MenubarPrimitive.CheckboxItem>
  );
}

function MenubarRadioGroup(props: React.ComponentProps<typeof MenubarPrimitive.RadioGroup>) {
  return <MenubarPrimitive.RadioGroup data-slot="menubar-radio-group" {...props} />;
}

// The chosen option ends in the same check as a checkbox item.
function MenubarRadioItem({ className, children, ...props }: React.ComponentProps<typeof MenubarPrimitive.RadioItem>) {
  return (
    <MenubarPrimitive.RadioItem data-slot="menubar-radio-item" className={cn(ITEM, className)} {...props}>
      {children}
      <span className={CHECK}>
        <MenubarPrimitive.ItemIndicator>
          <CheckIcon />
        </MenubarPrimitive.ItemIndicator>
      </span>
    </MenubarPrimitive.RadioItem>
  );
}

function MenubarLabel({ className, inset, ...props }: React.ComponentProps<typeof MenubarPrimitive.Label> & { inset?: boolean }) {
  return <MenubarPrimitive.Label data-slot="menubar-label" data-inset={inset || undefined} className={cn("px-3 pt-2 pb-1 font-sans text-caption leading-tight font-normal text-fg-secondary data-[inset]:pl-9", className)} {...props} />;
}

function MenubarSeparator({ className, ...props }: React.ComponentProps<typeof MenubarPrimitive.Separator>) {
  return <MenubarPrimitive.Separator data-slot="menubar-separator" className={cn("-mx-1 my-1 h-px border-0 bg-line-subtle", className)} {...props} />;
}

function MenubarShortcut({ className, ...props }: React.ComponentProps<"span">) {
  return <span data-slot="menubar-shortcut" className={cn("ml-auto pl-4 font-sans text-caption leading-tight text-fg-muted", className)} {...props} />;
}

function MenubarSub(props: React.ComponentProps<typeof MenubarPrimitive.Sub>) {
  return <MenubarPrimitive.Sub data-slot="menubar-sub" {...props} />;
}

function MenubarSubTrigger({ className, inset, children, ...props }: React.ComponentProps<typeof MenubarPrimitive.SubTrigger> & { inset?: boolean }) {
  return (
    <MenubarPrimitive.SubTrigger data-slot="menubar-sub-trigger" data-inset={inset || undefined} className={cn(ITEM, "data-[state=open]:bg-subtle", className)} {...props}>
      {children}
      <CaretRightIcon className="ml-auto size-4 text-fg-secondary" />
    </MenubarPrimitive.SubTrigger>
  );
}

function MenubarSubContent({ className, children, ...props }: React.ComponentProps<typeof MenubarPrimitive.SubContent>) {
  return (
    <MenubarPortal>
      <MenubarPrimitive.SubContent data-slot="menubar-sub-content" className={cn(CONTENT, "origin-(--radix-menubar-content-transform-origin)", className)} {...props}>
        <div className={SCROLL}>{children}</div>
      </MenubarPrimitive.SubContent>
    </MenubarPortal>
  );
}

export {
  Menubar,
  MenubarCheckboxItem,
  MenubarContent,
  MenubarGroup,
  MenubarItem,
  MenubarLabel,
  MenubarMenu,
  MenubarPortal,
  MenubarRadioGroup,
  MenubarRadioItem,
  MenubarSeparator,
  MenubarShortcut,
  MenubarSub,
  MenubarSubContent,
  MenubarSubTrigger,
  MenubarTrigger,
};
