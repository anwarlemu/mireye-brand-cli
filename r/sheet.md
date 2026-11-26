# Sheet
A Bone panel flush with an edge of the screen, square, with a 1px Stone line on its inner edge and no shadow, on the page under Forest at 40 percent; it slides on the drawer curve.

Install: npx mireye-ds add sheet
Requires: theme, surface, utils
Packages: radix-ui, @phosphor-icons/react
Exports: Sheet, SheetClose, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetOverlay, SheetPortal, SheetTitle, SheetTrigger
Client boundary: yes
Reference: Not in Figma. Drawn in Mireye's grammar: the dialog's panel and close key


## Usage
Use for editing or reading something beside the page without losing it (a site's requirements, a parcel's details). Side sheets are 384px wide; top and bottom sheets take their content's height. A sheet taller than the screen fades at an edge (fade-y) where more content scrolls past it.
- Avoid: Rounded corners or a shadow
- Avoid: A sheet for a quick confirmation (use Alert Dialog)
- Avoid: Sheets on top of sheets
- Avoid: Slower than 300ms


## Examples
Example components: npx mireye-ds add sheet button input label
[Preview](https://mireye-ds.agencidev.com/preview/sheet/Preview) | [Sides](https://mireye-ds.agencidev.com/preview/sheet/Sides) | [Open](https://mireye-ds.agencidev.com/preview/sheet/Open)

examples/sheet.tsx

```tsx
"use client";

import * as React from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

function EditRequirements() {
  return (
    <>
      <SheetHeader>
        <SheetTitle>Edit requirements</SheetTitle>
        <SheetDescription>Every site in the project is scored against these.</SheetDescription>
      </SheetHeader>
      <div className="grid gap-4 px-5">
        <div className="grid gap-1">
          <Label htmlFor="sheet-acres">Minimum acres</Label>
          <Input id="sheet-acres" inputMode="numeric" defaultValue="200" />
        </div>
        <div className="grid gap-1">
          <Label htmlFor="sheet-kv">Substation within (miles)</Label>
          <Input id="sheet-kv" inputMode="decimal" defaultValue="3" />
        </div>
      </div>
      <SheetFooter>
        <Button className="w-full">Save requirements</Button>
      </SheetFooter>
    </>
  );
}

export function Preview() {
  return (
    <div className="flex justify-center">
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline">Edit requirements</Button>
        </SheetTrigger>
        <SheetContent>
          <EditRequirements />
        </SheetContent>
      </Sheet>
    </div>
  );
}

export function Sides() {
  const sides = ["top", "right", "bottom", "left"] as const;
  return (
    <div className="flex flex-wrap justify-center gap-3">
      {sides.map((side) => (
        <Sheet key={side}>
          <SheetTrigger asChild>
            <Button variant="outline" className="capitalize">
              {side}
            </Button>
          </SheetTrigger>
          <SheetContent side={side}>
            <SheetHeader>
              <SheetTitle>Sheet from the {side}</SheetTitle>
              <SheetDescription>Slides from its edge on the drawer curve.</SheetDescription>
            </SheetHeader>
          </SheetContent>
        </Sheet>
      ))}
    </div>
  );
}

export function Open() {
  return (
    <div className="min-h-120">
      <Sheet defaultOpen>
        <SheetContent>
          <EditRequirements />
        </SheetContent>
      </Sheet>
    </div>
  );
}

```

## Source

components/ui/sheet.tsx

```tsx
"use client";

import * as React from "react";
import { Dialog as SheetPrimitive } from "radix-ui";
import { XIcon } from "@phosphor-icons/react/ssr";

import { usePortalContainer } from "@/lib/surface";
import { cn } from "@/lib/utils";

// A panel from the edge of the screen. Figma has none, so it is drawn as the dialog in Mireye's grammar: white, square
// and flush with its edge, with a 1px Stone line on its inner edge and no shadow, on the page under Forest at 40
// percent. The head holds the 16px regular title 20px in, over a 13px line in the secondary ink; the close key is the
// dialog's (a square 32px key 12px from the corner with a 16px X, Fog under the pointer, Mist while pressed); the sides
// are 20px. It travels its own size from its edge on the drawer curve (300ms in, 200ms out). Side panels are 384px wide
// (the full width on phones); top and bottom panels take their content's height.
function Sheet(props: React.ComponentProps<typeof SheetPrimitive.Root>) {
  return <SheetPrimitive.Root data-slot="sheet" {...props} />;
}

function SheetTrigger(props: React.ComponentProps<typeof SheetPrimitive.Trigger>) {
  return <SheetPrimitive.Trigger data-slot="sheet-trigger" {...props} />;
}

function SheetClose(props: React.ComponentProps<typeof SheetPrimitive.Close>) {
  return <SheetPrimitive.Close data-slot="sheet-close" {...props} />;
}

function SheetPortal(props: React.ComponentProps<typeof SheetPrimitive.Portal>) {
  const container = usePortalContainer();
  return <SheetPrimitive.Portal data-slot="sheet-portal" container={container} {...props} />;
}

function SheetOverlay({ className, ...props }: React.ComponentProps<typeof SheetPrimitive.Overlay>) {
  return (
    <SheetPrimitive.Overlay
      data-slot="sheet-overlay"
      className={cn("fixed inset-0 z-50 bg-scrim data-[state=closed]:animate-fade-out data-[state=open]:animate-fade-in", className)}
      {...props}
    />
  );
}

const SIDES = {
  right: "inset-y-0 right-0 h-full w-full border-l border-line sm:max-w-96 data-[state=closed]:animate-sheet-out-right data-[state=open]:animate-sheet-in-right",
  left: "inset-y-0 left-0 h-full w-full border-r border-line sm:max-w-96 data-[state=closed]:animate-sheet-out-left data-[state=open]:animate-sheet-in-left",
  top: "inset-x-0 top-0 h-auto max-h-[85dvh] border-b border-line data-[state=closed]:animate-sheet-out-top data-[state=open]:animate-sheet-in-top",
  bottom: "inset-x-0 bottom-0 h-auto max-h-[85dvh] border-t border-line data-[state=closed]:animate-sheet-out-bottom data-[state=open]:animate-sheet-in-bottom",
} as const;

function SheetContent({ className, children, side = "right", showCloseButton = true, instant = false, ...props }: React.ComponentProps<typeof SheetPrimitive.Content> & { side?: keyof typeof SIDES; showCloseButton?: boolean; instant?: boolean }) {
  return (
    <SheetPortal>
      <SheetOverlay data-ds-motion={instant ? "instant" : undefined} />
      <SheetPrimitive.Content
        data-slot="sheet-content"
        data-ds-motion={instant ? "instant" : undefined}
        data-side={side}
        className={cn("fixed z-50 flex flex-col overflow-hidden bg-surface text-fg outline-none", SIDES[side], className)}
        {...props}
      >
        {/* The scrolling box sits inside the panel: its edges fade where more scrolls past them, the close button stays
            put, and the panel's own slide animations stay on the panel. */}
        <div data-slot="sheet-body" className="flex min-h-0 flex-1 flex-col overflow-y-auto fade-y">
          {children}
        </div>
        {showCloseButton && (
          <SheetPrimitive.Close
            data-slot="sheet-close"
            className="absolute top-3 right-3 inline-flex size-8 items-center justify-center text-fg outline-none transition-[background-color] duration-150 ease-out hover:bg-subtle active:bg-subtle-hover active:duration-0 focus-visible:outline-solid focus-visible:outline-1 focus-visible:-outline-offset-1 focus-visible:outline-line-strong motion-reduce:transition-none"
          >
            <XIcon className="size-4" />
            <span className="sr-only">Close</span>
          </SheetPrimitive.Close>
        )}
      </SheetPrimitive.Content>
    </SheetPortal>
  );
}

function SheetHeader({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="sheet-header" className={cn("flex shrink-0 flex-col justify-center gap-1 pt-5 pr-13 pb-4 pl-5", className)} {...props} />;
}

function SheetFooter({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="sheet-footer" className={cn("mt-auto flex shrink-0 flex-col gap-2 p-5", className)} {...props} />;
}

function SheetTitle({ className, ...props }: React.ComponentProps<typeof SheetPrimitive.Title>) {
  return <SheetPrimitive.Title data-slot="sheet-title" className={cn("font-sans text-h3 leading-tight font-normal text-fg", className)} {...props} />;
}

function SheetDescription({ className, ...props }: React.ComponentProps<typeof SheetPrimitive.Description>) {
  return <SheetPrimitive.Description data-slot="sheet-description" className={cn("text-body leading-body text-fg-secondary", className)} {...props} />;
}

export { Sheet, SheetClose, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetOverlay, SheetPortal, SheetTitle, SheetTrigger };

```
