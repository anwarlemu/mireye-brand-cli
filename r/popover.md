# Popover
A Bone panel with the 6px cut corner and a 1px Stone line, no shadow, 16px of padding, a 13px medium title over a line in the secondary ink; it grows from its trigger in 150ms.

Install: npx mireye-ds add popover
Requires: theme, surface, utils
Packages: @chakra-ui/react
Exports: Popover, PopoverAnchor, PopoverContent, PopoverDescription, PopoverHeader, PopoverTitle, PopoverTrigger
Client boundary: yes
Reference: Not in Figma. Drawn in Mireye's grammar: the Bone cut frame of Figma UI · Inputs (442:107)


## Usage
Use for a small form or detail tied to one control (rename a site, set a buffer distance) that keeps the page in view. Use PopoverHeader, PopoverTitle and PopoverDescription for its head.
- Avoid: Long forms or several steps (use Dialog or Sheet)
- Avoid: Rounded corners or a shadow
- Avoid: An arrow on the panel
- Avoid: A popover that opens on hover (use Hover Card)


## Examples
Example components: npx mireye-ds add popover button input label
Example packages: @phosphor-icons/react
[Preview](https://mireye-ds.agencidev.com/preview/popover/Preview) | [Open](https://mireye-ds.agencidev.com/preview/popover/Open)

examples/popover.tsx

```tsx
"use client";

import * as React from "react";
import { PencilSimpleIcon } from "@phosphor-icons/react/ssr";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverDescription, PopoverHeader, PopoverTitle, PopoverTrigger } from "@/components/ui/popover";

function RenameForm({ onDone }: { onDone?: () => void }) {
  const [name, setName] = React.useState("North Ault solar");
  return (
    <form
      className="grid gap-3"
      onSubmit={(event) => {
        event.preventDefault();
        onDone?.();
      }}
    >
      <PopoverHeader>
        <PopoverTitle>Site name</PopoverTitle>
        <PopoverDescription>Shown on the map tag and in exports for Site 14.</PopoverDescription>
      </PopoverHeader>
      <div className="grid gap-1">
        <Label htmlFor="site-name">Name</Label>
        <Input id="site-name" value={name} onChange={(e) => setName(e.target.value)} />
      </div>
      <Button type="submit" className="w-full">
        Save
      </Button>
    </form>
  );
}

export function Preview() {
  const [open, setOpen] = React.useState(false);
  return (
    <div className="flex justify-center">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline">
            <PencilSimpleIcon />
            Rename site
          </Button>
        </PopoverTrigger>
        <PopoverContent align="start">
          <RenameForm onDone={() => setOpen(false)} />
        </PopoverContent>
      </Popover>
    </div>
  );
}

// Opened once the trigger is on the page, so the panel is placed beside it (a popover open on the first render has no
// trigger to measure yet).
export function Open() {
  const [open, setOpen] = React.useState(false);
  React.useEffect(() => setOpen(true), []);
  return (
    <div className="flex min-h-80 items-start justify-center">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline">
            <PencilSimpleIcon />
            Rename site
          </Button>
        </PopoverTrigger>
        <PopoverContent>
          <RenameForm />
        </PopoverContent>
      </Popover>
    </div>
  );
}

```

## Source

components/ui/popover.tsx

```tsx
"use client";

import * as React from "react";
import { Popover as ChakraPopover, Portal } from "@chakra-ui/react";

import { usePortalContainer } from "@/lib/surface";
import { cn } from "@/lib/utils";

// A popover. Figma has none, so it is drawn in Mireye's grammar: a white panel with the 6px cut corner and a 1px Stone
// line, no shadow, 8px from its trigger, 16px of padding and 12px between its parts; the title is 13px medium Forest
// over a 13px line in the secondary ink. It grows out of its trigger from 98 percent with a fade (150ms, the strong
// ease-out) and leaves faster than it came (120ms).
type PopoverProps = Omit<React.ComponentProps<typeof ChakraPopover.Root>, "onOpenChange"> & { onOpenChange?: (open: boolean) => void };
function Popover({ onOpenChange, ...props }: PopoverProps) {
  // Content mounts when it opens (and leaves after its exit), so a closed popover never renders its contents on the
  // server: a date picker's calendar reads today's date, which Next's prerender rejects.
  return <ChakraPopover.Root unstyled lazyMount unmountOnExit data-slot="popover" onOpenChange={(details) => onOpenChange?.(details.open)} {...props} />;
}

function PopoverTrigger(props: React.ComponentProps<typeof ChakraPopover.Trigger>) {
  return <ChakraPopover.Trigger data-slot="popover-trigger" {...props} />;
}

function PopoverAnchor(props: React.ComponentProps<typeof ChakraPopover.Anchor>) {
  return <ChakraPopover.Anchor data-slot="popover-anchor" {...props} />;
}

type PopoverContentProps = Omit<React.ComponentProps<typeof ChakraPopover.Content>, "positioning"> & { align?: "start" | "center" | "end"; sideOffset?: number; onOpenAutoFocus?: (event: { preventDefault(): void }) => void };
function PopoverContent({ className, align = "center", sideOffset = 8, onOpenAutoFocus: _onOpenAutoFocus, ...props }: PopoverContentProps) {
  const container = usePortalContainer();
  const portalRef = React.useMemo(() => container ? { current: container } : undefined, [container]);
  return (
    <Portal container={portalRef}>
      <ChakraPopover.Positioner>
      <ChakraPopover.Content
        unstyled
        data-slot="popover-content"
        className={cn(
          "ds-cut-frame z-50 flex w-72 max-w-[calc(100vw-2rem)] origin-(--transform-origin) flex-col gap-3 p-4 text-body leading-body text-fg outline-none [--ds-cut:var(--ds-cut-md)] [--ds-shape-fill:var(--ds-color-bg-default)] [--ds-shape-stroke:var(--ds-color-border-default)] data-[state=closed]:animate-pop-out data-[state=open]:animate-pop-in",
          className,
        )}
        {...props}
      />
      </ChakraPopover.Positioner>
    </Portal>
  );
}

/** The popover's head: its title over a short muted line. */
function PopoverHeader({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="popover-header" className={cn("flex flex-col gap-1", className)} {...props} />;
}

function PopoverTitle({ className, ...props }: React.ComponentProps<"h2">) {
  return <h2 data-slot="popover-title" className={cn("font-sans text-body leading-body font-medium text-fg", className)} {...props} />;
}

function PopoverDescription({ className, ...props }: React.ComponentProps<"p">) {
  return <p data-slot="popover-description" className={cn("text-body leading-body text-fg-secondary", className)} {...props} />;
}

export { Popover, PopoverAnchor, PopoverContent, PopoverDescription, PopoverHeader, PopoverTitle, PopoverTrigger };

```
