"use client";

import * as React from "react";
import { Menu as ChakraMenu, Portal } from "@chakra-ui/react";
import { CaretRightIcon } from "@phosphor-icons/react/ssr";

import { CheckIcon } from "@/components/icons/check";

import { usePortalContainer } from "@/lib/surface";
import { cn } from "@/lib/utils";

// A menu. Figma has no menu, so it is drawn in Mireye's grammar (the review build's list under the combobox and the
// unit select): a white panel with the 6px cut corner and a 1px Stone line, no shadow, 4px inside the line. Rows are
// square, at least 32px (12px sides, 6px above and below), with a 13px regular Forest label after a 16px glyph, 8px
// apart, and touch each other. The highlighted row takes Fog and a pressed one Mist, at once (menus are walked by
// keyboard many times a day, so rows never fade). A chosen checkbox or radio row ends in Mireye's check. Section
// labels are 12px in the secondary ink, separators the Mist rule from line to line, shortcuts 12px muted, destructive
// rows brick, disabled rows Slate. The panel grows out of its trigger from 98 percent with a fade (150ms, the strong
// ease-out) and leaves in 120ms. Its rows scroll inside the line, so the frame stays put on a long menu.
const CONTENT =
  "ds-cut-frame z-50 flex max-h-(--available-height) min-w-48 flex-col p-px text-fg outline-none [--ds-cut:var(--ds-cut-md)] [--ds-shape-fill:var(--ds-color-bg-default)] [--ds-shape-stroke:var(--ds-color-border-default)] data-[state=closed]:animate-pop-out data-[state=open]:animate-pop-in";
const SCROLL = "min-h-0 overflow-x-hidden overflow-y-auto overscroll-contain fade-y p-1";
const ITEM =
  "relative flex min-h-8 cursor-default items-center gap-2 px-3 py-1.5 font-sans text-body leading-tight font-normal text-fg outline-none select-none data-[disabled]:pointer-events-none data-[disabled]:text-fg-subtle data-[highlighted]:bg-subtle data-[highlighted]:active:bg-subtle-hover data-[inset]:pl-9 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-']):not([data-slot])]:size-4";
const CHECK = "pointer-events-none ml-auto flex size-4 shrink-0 items-center justify-center pl-1";

// The trigger, so focus can go back to it when the menu closes.
const TriggerRef = React.createContext<React.RefObject<HTMLElement | null> | null>(null);

type MenuProps = Omit<React.ComponentProps<typeof ChakraMenu.Root>, "onOpenChange"> & { onOpenChange?: (open: boolean) => void };
function DropdownMenu({ onOpenChange, onExitComplete, ...props }: MenuProps) {
  const trigger = React.useRef<HTMLElement | null>(null);
  const restore = React.useCallback(() => {
    if (document.activeElement === document.body || document.activeElement === null) trigger.current?.focus();
  }, []);
  return (
    <TriggerRef.Provider value={trigger}>
      <ChakraMenu.Root
        unstyled
        data-slot="dropdown-menu"
        onOpenChange={(details) => {
          onOpenChange?.(details.open);
          // Closing right after a keyboard open can leave focus on the page body (the menu's own first-item focus lands
          // in the panel as it leaves). Hand it back to the trigger then; focus moved on purpose (a dialog an item opened)
          // is left alone.
          if (!details.open) requestAnimationFrame(() => requestAnimationFrame(restore));
        }}
        // And again once the panel has left: its unmount can drop focus after the close.
        onExitComplete={() => {
          onExitComplete?.();
          restore();
        }}
        {...props}
      />
    </TriggerRef.Provider>
  );
}

function DropdownMenuPortal(props: React.ComponentProps<typeof Portal>) {
  const container = usePortalContainer();
  const portalRef = React.useMemo(() => container ? { current: container } : undefined, [container]);
  return <Portal data-slot="dropdown-menu-portal" container={portalRef} {...props} />;
}

function DropdownMenuTrigger({ ref, ...props }: React.ComponentProps<typeof ChakraMenu.Trigger>) {
  const trigger = React.useContext(TriggerRef);
  const setRef = React.useCallback(
    (node: HTMLButtonElement | null) => {
      if (trigger) trigger.current = node;
      if (typeof ref === "function") ref(node);
      else if (ref) ref.current = node;
    },
    [trigger, ref],
  );
  return <ChakraMenu.Trigger ref={setRef} data-slot="dropdown-menu-trigger" {...props} />;
}

function DropdownMenuContent({ className, sideOffset = 8, align, onFocus, children, ...props }: Omit<React.ComponentProps<typeof ChakraMenu.Content>, "align"> & { sideOffset?: number; align?: "start" | "center" | "end" }) {
  const trigger = React.useContext(TriggerRef);
  return (
    <DropdownMenuPortal>
      <ChakraMenu.Positioner data-align={align}>
        <ChakraMenu.Content
          unstyled
          data-slot="dropdown-menu-content"
          style={{ marginBlockStart: sideOffset }}
          className={cn(CONTENT, "origin-(--transform-origin)", className)}
          onFocus={(event) => {
            onFocus?.(event);
            // A keyboard open focuses the panel a moment later; if the menu closed first (a quick Escape), that focus
            // would land in a panel that is leaving. Send it back to the trigger.
            if (event.currentTarget.getAttribute("data-state") === "closed") trigger?.current?.focus();
          }}
          {...props}
        >
          <div className={SCROLL}>{children}</div>
        </ChakraMenu.Content>
      </ChakraMenu.Positioner>
    </DropdownMenuPortal>
  );
}

function DropdownMenuGroup(props: React.ComponentProps<typeof ChakraMenu.ItemGroup>) {
  return <ChakraMenu.ItemGroup data-slot="dropdown-menu-group" {...props} />;
}

// An item's value identifies it to the menu (highlight, selection), so items without one each get their own: a label
// when the children are plain text, otherwise a generated id (a shared fallback would highlight every such row at once).
function useItemValue(value: string | undefined, children: React.ReactNode) {
  const id = React.useId();
  return value ?? (typeof children === "string" ? children : id);
}

function DropdownMenuItem({ className, inset, variant = "default", value, children, ...props }: Omit<React.ComponentProps<typeof ChakraMenu.Item>, "value"> & { value?: string; inset?: boolean; variant?: "default" | "destructive" }) {
  const itemValue = useItemValue(value, children);
  return (
    <ChakraMenu.Item unstyled
      data-slot="dropdown-menu-item"
      data-inset={inset || undefined}
      data-variant={variant}
      value={itemValue}
      className={cn(ITEM, "data-[variant=destructive]:text-danger", className)}
      {...props}
    >{children}</ChakraMenu.Item>
  );
}

function DropdownMenuCheckboxItem({ className, children, checked, onCheckedChange, value, ...props }: Omit<React.ComponentProps<typeof ChakraMenu.CheckboxItem>, "onCheckedChange" | "value"> & { value?: string; onCheckedChange?: (checked: boolean) => void }) {
  const itemValue = useItemValue(value, children);
  return (
    <ChakraMenu.CheckboxItem unstyled data-slot="dropdown-menu-checkbox-item" value={itemValue} checked={checked} onCheckedChange={onCheckedChange} className={cn(ITEM, className)} {...props}>
      {children}
      <span className={CHECK}>
        <ChakraMenu.ItemIndicator>
          <CheckIcon />
        </ChakraMenu.ItemIndicator>
      </span>
    </ChakraMenu.CheckboxItem>
  );
}

type RadioMenuProps = Omit<React.ComponentProps<typeof ChakraMenu.RadioItemGroup>, "onValueChange"> & { onValueChange?: (value: string) => void };
function DropdownMenuRadioGroup({ onValueChange, ...props }: RadioMenuProps) {
  return <ChakraMenu.RadioItemGroup data-slot="dropdown-menu-radio-group" onValueChange={(details) => onValueChange?.(details.value)} {...props} />;
}

// The chosen option ends in the same check as a checkbox item.
function DropdownMenuRadioItem({ className, children, value, ...props }: Omit<React.ComponentProps<typeof ChakraMenu.RadioItem>, "value"> & { value?: string }) {
  const itemValue = useItemValue(value, children);
  return (
    <ChakraMenu.RadioItem unstyled data-slot="dropdown-menu-radio-item" value={itemValue} className={cn(ITEM, className)} {...props}>
      {children}
      <span className={CHECK}>
        <ChakraMenu.ItemIndicator>
          <CheckIcon />
        </ChakraMenu.ItemIndicator>
      </span>
    </ChakraMenu.RadioItem>
  );
}

// A heading above items: shadcn's label stands alone, so it is a plain element rather than Chakra's group label (which
// must sit inside a group).
function DropdownMenuLabel({ className, inset, ...props }: React.ComponentProps<"div"> & { inset?: boolean }) {
  return <div data-slot="dropdown-menu-label" data-inset={inset || undefined} className={cn("px-3 pt-2 pb-1 font-sans text-caption leading-tight font-normal text-fg-secondary data-[inset]:pl-9", className)} {...props} />;
}

function DropdownMenuSeparator({ className, ...props }: React.ComponentProps<typeof ChakraMenu.Separator>) {
  return <ChakraMenu.Separator data-slot="dropdown-menu-separator" className={cn("-mx-1 my-1 h-px border-0 bg-line-subtle", className)} {...props} />;
}

function DropdownMenuShortcut({ className, ...props }: React.ComponentProps<"span">) {
  return <span data-slot="dropdown-menu-shortcut" className={cn("ml-auto pl-4 font-sans text-caption leading-tight text-fg-muted", className)} {...props} />;
}

function DropdownMenuSub({ onOpenChange, ...props }: MenuProps) {
  return <ChakraMenu.Root unstyled data-slot="dropdown-menu-sub" onOpenChange={(details) => onOpenChange?.(details.open)} {...props} />;
}

function DropdownMenuSubTrigger({ className, inset, children, ...props }: React.ComponentProps<typeof ChakraMenu.TriggerItem> & { inset?: boolean }) {
  return (
    <ChakraMenu.TriggerItem unstyled data-slot="dropdown-menu-sub-trigger" data-inset={inset || undefined} className={cn(ITEM, "data-[state=open]:bg-subtle", className)} {...props}>
      {children}
      <CaretRightIcon className="ml-auto size-4 text-fg-secondary" />
    </ChakraMenu.TriggerItem>
  );
}

function DropdownMenuSubContent({ className, children, ...props }: React.ComponentProps<typeof ChakraMenu.Content>) {
  return (
    <DropdownMenuPortal>
      <ChakraMenu.Positioner>
        <ChakraMenu.Content unstyled data-slot="dropdown-menu-sub-content" className={cn(CONTENT, "origin-(--transform-origin)", className)} {...props}>
          <div className={SCROLL}>{children}</div>
        </ChakraMenu.Content>
      </ChakraMenu.Positioner>
    </DropdownMenuPortal>
  );
}

export {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
};
