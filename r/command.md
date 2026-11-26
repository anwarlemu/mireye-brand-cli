# Command
A Bone panel with the 8px cut corner and a 1px Stone line: a 44px search row over the Mist rule, groups headed in the secondary ink and square 32px rows with Fog under the selection.

Install: npx mireye-ds add command
Requires: theme, surface, utils
Packages: cmdk, radix-ui, @phosphor-icons/react
Exports: Command, CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandSeparator, CommandShortcut
Client boundary: yes
Reference: Not in Figma. Drawn in Mireye's grammar: the review build's combobox (Bone cut frame, Fog highlight)


## Usage
Use for a command menu (open it with Cmd K through CommandDialog) and for searchable lists of sites, layers and pages. Give items a 16px Phosphor glyph and a shortcut where there is one. The list fades at an edge (fade-y) where more items scroll past it.
- Avoid: An open or close animation on the command dialog
- Avoid: Rounded corners or a shadow
- Avoid: Long descriptions in rows


## Examples
Example components: npx mireye-ds add command button
Example packages: @phosphor-icons/react
[Preview](https://mireye-ds.agencidev.com/preview/command/Preview) | [Dialog](https://mireye-ds.agencidev.com/preview/command/Dialog) | [Open](https://mireye-ds.agencidev.com/preview/command/Open)

examples/command.tsx

```tsx
"use client";

import * as React from "react";
import { BookOpenTextIcon, ChartLineIcon, DownloadSimpleIcon, GearSixIcon, LightningIcon, MapPinIcon, MapTrifoldIcon, PlusIcon, StackIcon } from "@phosphor-icons/react/ssr";

import { Button } from "@/components/ui/button";
import { Command, CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandSeparator, CommandShortcut } from "@/components/ui/command";

function Items({ onRun }: { onRun?: () => void }) {
  return (
    <>
      <CommandInput placeholder="Search sites, layers and pages" />
      <CommandList>
        <CommandEmpty>No results.</CommandEmpty>
        <CommandGroup heading="Sites">
          <CommandItem onSelect={onRun}>
            <MapPinIcon />
            Site 14, Weld County
          </CommandItem>
          <CommandItem onSelect={onRun}>
            <MapPinIcon />
            Site 9, Larimer County
          </CommandItem>
          <CommandItem onSelect={onRun}>
            <PlusIcon />
            New site
            <CommandShortcut>⌘N</CommandShortcut>
          </CommandItem>
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="Layers">
          <CommandItem onSelect={onRun}>
            <StackIcon />
            Parcels
          </CommandItem>
          <CommandItem onSelect={onRun}>
            <LightningIcon />
            Substations
          </CommandItem>
          <CommandItem disabled>
            <MapTrifoldIcon />
            Wetlands (coming soon)
          </CommandItem>
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="Project">
          <CommandItem onSelect={onRun}>
            <ChartLineIcon />
            Fit scores
          </CommandItem>
          <CommandItem onSelect={onRun}>
            <DownloadSimpleIcon />
            Export shortlist
            <CommandShortcut>⌘E</CommandShortcut>
          </CommandItem>
          <CommandItem onSelect={onRun}>
            <GearSixIcon />
            Requirements
            <CommandShortcut>⌘,</CommandShortcut>
          </CommandItem>
          <CommandItem onSelect={onRun}>
            <BookOpenTextIcon />
            Read the docs
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </>
  );
}

export function Preview() {
  return (
    <Command className="mx-auto max-w-112">
      <Items />
    </Command>
  );
}

export function Dialog() {
  const [open, setOpen] = React.useState(false);
  React.useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "k" && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        setOpen((o) => !o);
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);
  return (
    <div className="grid justify-items-center gap-3">
      <Button variant="outline" onClick={() => setOpen(true)}>
        Open the command menu
      </Button>
      <p className="text-body text-fg-secondary">
        Or press <kbd className="border border-line bg-surface px-1.5 font-sans text-caption text-fg">⌘K</kbd>
      </p>
      <CommandDialog open={open} onOpenChange={setOpen}>
        <Items onRun={() => setOpen(false)} />
      </CommandDialog>
    </div>
  );
}

export function Open() {
  return (
    <div className="min-h-120">
      <CommandDialog defaultOpen>
        <Items />
      </CommandDialog>
    </div>
  );
}

```

## Source

components/ui/command.tsx

```tsx
"use client";

import * as React from "react";
import { Command as CommandPrimitive } from "cmdk";
import { Dialog as DialogPrimitive } from "radix-ui";
import { MagnifyingGlassIcon } from "@phosphor-icons/react/ssr";

import { usePortalContainer } from "@/lib/surface";
import { cn } from "@/lib/utils";

// A command menu. Figma has none, so it is drawn in Mireye's grammar: a white panel with the 8px cut corner and a 1px
// Stone line, no shadow; the search row is 44px with a 16px magnifying glass in the secondary ink and 13px Forest text
// over the Mist rule; groups open with 12px headings in the secondary ink, and items are the menu's rows: square, at
// least 32px with 12px sides, a 16px glyph 8px from the 13px regular label, touching each other, Fog under the selected
// row and Mist while pressed, with no fade; shortcuts are 12px muted. CommandDialog puts it on the page under Forest at
// 40 percent and opens without motion: it is summoned by keyboard many times a day.
function Command({ className, ...props }: React.ComponentProps<typeof CommandPrimitive>) {
  return <CommandPrimitive data-slot="command" data-ds-motion="instant" className={cn("ds-cut-frame flex size-full flex-col p-px text-fg [--ds-shape-fill:var(--ds-color-bg-default)] [--ds-shape-stroke:var(--ds-color-border-default)]", className)} {...props} />;
}

function CommandDialog({
  title = "Command menu",
  description = "Search for a command to run",
  children,
  className,
  showCloseButton = false,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Root> & { title?: string; description?: string; className?: string; showCloseButton?: boolean }) {
  const container = usePortalContainer();
  return (
    <DialogPrimitive.Root data-slot="command-dialog" {...props}>
      <DialogPrimitive.Portal container={container}>
        <DialogPrimitive.Overlay data-ds-motion="instant" className="fixed inset-0 z-50 bg-scrim" />
        <DialogPrimitive.Content
          data-ds-motion="instant"
          className={cn("fixed top-[18dvh] left-1/2 z-50 w-[calc(100%-2rem)] max-w-140 -translate-x-1/2 text-fg outline-none", className)}
          aria-describedby={undefined}
        >
          <DialogPrimitive.Title className="sr-only">{title}</DialogPrimitive.Title>
          <DialogPrimitive.Description className="sr-only">{description}</DialogPrimitive.Description>
          <Command className="[&_[data-slot=command-list]]:max-h-96">{children}</Command>
          {showCloseButton && <DialogPrimitive.Close className="sr-only">Close</DialogPrimitive.Close>}
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}

function CommandInput({ className, ...props }: React.ComponentProps<typeof CommandPrimitive.Input>) {
  return (
    <div data-slot="command-input-wrapper" className="flex h-11 shrink-0 items-center gap-2 border-b border-line-subtle px-4">
      <MagnifyingGlassIcon aria-hidden className="size-4 shrink-0 text-fg-secondary" />
      <CommandPrimitive.Input
        data-slot="command-input"
        className={cn("h-full w-full min-w-0 bg-transparent font-sans text-body leading-tight text-fg outline-none placeholder:text-fg-muted disabled:cursor-not-allowed disabled:text-fg-subtle", className)}
        {...props}
      />
    </div>
  );
}

function CommandList({ className, ...props }: React.ComponentProps<typeof CommandPrimitive.List>) {
  return <CommandPrimitive.List data-slot="command-list" className={cn("max-h-80 scroll-py-1 overflow-x-hidden overflow-y-auto overscroll-contain fade-y p-1", className)} {...props} />;
}

function CommandEmpty({ className, ...props }: React.ComponentProps<typeof CommandPrimitive.Empty>) {
  return <CommandPrimitive.Empty data-slot="command-empty" className={cn("py-8 text-center text-body text-fg-secondary", className)} {...props} />;
}

function CommandGroup({ className, ...props }: React.ComponentProps<typeof CommandPrimitive.Group>) {
  return (
    <CommandPrimitive.Group
      data-slot="command-group"
      className={cn("overflow-hidden text-fg [&_[cmdk-group-heading]]:px-3 [&_[cmdk-group-heading]]:pt-2 [&_[cmdk-group-heading]]:pb-1 [&_[cmdk-group-heading]]:text-caption [&_[cmdk-group-heading]]:leading-tight [&_[cmdk-group-heading]]:text-fg-secondary", className)}
      {...props}
    />
  );
}

function CommandSeparator({ className, ...props }: React.ComponentProps<typeof CommandPrimitive.Separator>) {
  return <CommandPrimitive.Separator data-slot="command-separator" className={cn("-mx-1 my-1 h-px border-0 bg-line-subtle", className)} {...props} />;
}

function CommandItem({ className, ...props }: React.ComponentProps<typeof CommandPrimitive.Item>) {
  return (
    <CommandPrimitive.Item
      data-slot="command-item"
      className={cn(
        "relative flex min-h-8 cursor-default items-center gap-2 px-3 py-1.5 font-sans text-body leading-tight font-normal text-fg outline-none select-none data-[disabled=true]:pointer-events-none data-[disabled=true]:text-fg-subtle data-[selected=true]:bg-subtle data-[selected=true]:active:bg-subtle-hover [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-']):not([data-slot])]:size-4",
        className,
      )}
      {...props}
    />
  );
}

function CommandShortcut({ className, ...props }: React.ComponentProps<"span">) {
  return <span data-slot="command-shortcut" className={cn("ml-auto pl-4 font-sans text-caption leading-tight text-fg-muted", className)} {...props} />;
}

export { Command, CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandSeparator, CommandShortcut };

```
