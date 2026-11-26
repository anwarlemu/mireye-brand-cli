# Drawer
A square Bone panel pulled from an edge with a 1px Stone line on its inner edge, a square Stone handle, and a drag that follows the finger; it slides on the drawer curve.

Install: npx mireye-ds add drawer
Requires: theme, surface, utils
Packages: radix-ui
Exports: Drawer, DrawerClose, DrawerContent, DrawerDescription, DrawerFooter, DrawerHeader, DrawerOverlay, DrawerPortal, DrawerTitle, DrawerTrigger
Client boundary: yes
Reference: Not in Figma. Drawn in Mireye's grammar: the sheet


## Usage
Use on phones for a choice or short task that comes from the bottom of the screen (choose a basemap). People can drag or flick it away. The body fades at an edge (fade-xy) where more content scrolls past it, either way.
- Avoid: Rounded corners or a shadow
- Avoid: Long forms
- Avoid: A drawer that cannot be dismissed by dragging
- Avoid: Bouncing on release


## Examples
Example components: npx mireye-ds add drawer icons button
[Preview](https://mireye-ds.agencidev.com/preview/drawer/Preview) | [Directions](https://mireye-ds.agencidev.com/preview/drawer/Directions) | [Open](https://mireye-ds.agencidev.com/preview/drawer/Open)

examples/drawer.tsx

```tsx
"use client";

import * as React from "react";

import { CheckIcon } from "@/components/icons/check";
import { Button } from "@/components/ui/button";
import { Drawer, DrawerClose, DrawerContent, DrawerDescription, DrawerFooter, DrawerHeader, DrawerTitle, DrawerTrigger } from "@/components/ui/drawer";

const BASEMAPS = [
  { id: "survey", title: "Survey", body: "Parcel lines and survey nodes on the canvas ground." },
  { id: "aerial", title: "Aerial", body: "Recent imagery, dimmed so parcels and tags read first." },
];

function ChooseBasemap({ onChoose }: { onChoose?: () => void }) {
  const [basemap, setBasemap] = React.useState("survey");
  return (
    <>
      <DrawerHeader>
        <DrawerTitle>Basemap</DrawerTitle>
        <DrawerDescription>Choose what the map shows under Site 14.</DrawerDescription>
      </DrawerHeader>
      <div role="radiogroup" aria-label="Basemap" className="grid gap-2 px-5">
        {BASEMAPS.map((b) => (
          <button
            key={b.id}
            type="button"
            role="radio"
            aria-checked={basemap === b.id}
            onClick={() => setBasemap(b.id)}
            className="flex items-center gap-3 border border-line bg-surface p-3 text-left outline-none transition-[background-color,border-color] duration-150 ease-out hover:bg-subtle active:bg-subtle-hover active:duration-0 focus-visible:outline-solid focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-line-strong aria-checked:border-line-strong motion-reduce:transition-none"
          >
            <span className="grid flex-1 gap-1">
              <span className="text-body font-medium text-fg">{b.title}</span>
              <span className="text-body text-fg-secondary">{b.body}</span>
            </span>
            {basemap === b.id && <CheckIcon className="text-fg" />}
          </button>
        ))}
      </div>
      <DrawerFooter>
        <Button className="w-full" onClick={onChoose}>
          Use {basemap} basemap
        </Button>
        <DrawerClose asChild>
          <Button variant="ghost" className="w-full">
            Cancel
          </Button>
        </DrawerClose>
      </DrawerFooter>
    </>
  );
}

export function Preview() {
  const [open, setOpen] = React.useState(false);
  return (
    <div className="flex justify-center">
      <Drawer open={open} onOpenChange={setOpen}>
        <DrawerTrigger asChild>
          <Button variant="outline">Choose a basemap</Button>
        </DrawerTrigger>
        <DrawerContent>
          <div className="mx-auto w-full max-w-md">
            <ChooseBasemap onChoose={() => setOpen(false)} />
          </div>
        </DrawerContent>
      </Drawer>
    </div>
  );
}

export function Directions() {
  const directions = ["bottom", "top", "right", "left"] as const;
  return (
    <div className="flex flex-wrap justify-center gap-3">
      {directions.map((direction) => (
        <Drawer key={direction} direction={direction}>
          <DrawerTrigger asChild>
            <Button variant="outline" className="capitalize">
              {direction}
            </Button>
          </DrawerTrigger>
          <DrawerContent>
            <DrawerHeader>
              <DrawerTitle>Drawer from the {direction}</DrawerTitle>
              <DrawerDescription>Drag it back toward its edge, or flick it, to close.</DrawerDescription>
            </DrawerHeader>
            <DrawerFooter>
              <DrawerClose asChild>
                <Button variant="outline">Close</Button>
              </DrawerClose>
            </DrawerFooter>
          </DrawerContent>
        </Drawer>
      ))}
    </div>
  );
}

export function Open() {
  return (
    <div className="min-h-120">
      <Drawer defaultOpen>
        <DrawerContent>
          <div className="mx-auto w-full max-w-md">
            <ChooseBasemap />
          </div>
        </DrawerContent>
      </Drawer>
    </div>
  );
}

```

## Source

components/ui/drawer.tsx

```tsx
"use client";

import * as React from "react";
import { Dialog as DrawerPrimitive } from "radix-ui";

import { usePortalContainer } from "@/lib/surface";
import { cn } from "@/lib/utils";

// A drawer, drawn as the sheet in Mireye's grammar (Figma has none) and pulled from an edge: white, square and flush
// with its edge, a 1px Stone line on its inner edge and no shadow, on the page under Forest at 40 percent; a square 40
// by 4px handle in Stone, the 16px regular title over a 13px line in the secondary ink, and 20px sides. It slides in on
// the drawer curve (300ms in, 200ms out) and can be dragged away: a flick (faster than 0.11px per ms) or a pull past a
// third of its size closes it, a shorter pull springs back on the same curve, and pulling the other way meets growing
// resistance instead of a wall. The drag follows the pointer even off the panel (pointer capture) and ignores a
// second finger.
type Direction = "bottom" | "top" | "left" | "right";

const DrawerContext = React.createContext<{ direction: Direction; setOpen: (open: boolean) => void }>({ direction: "bottom", setOpen: () => {} });

function Drawer({ open: openProp, defaultOpen = false, onOpenChange, direction = "bottom", ...props }: React.ComponentProps<typeof DrawerPrimitive.Root> & { direction?: Direction }) {
  const [uncontrolled, setUncontrolled] = React.useState(defaultOpen);
  const open = openProp ?? uncontrolled;
  const setOpen = React.useCallback(
    (next: boolean) => {
      if (openProp === undefined) setUncontrolled(next);
      onOpenChange?.(next);
    },
    [openProp, onOpenChange],
  );
  return (
    <DrawerContext.Provider value={{ direction, setOpen }}>
      <DrawerPrimitive.Root data-slot="drawer" open={open} onOpenChange={setOpen} {...props} />
    </DrawerContext.Provider>
  );
}

function DrawerTrigger(props: React.ComponentProps<typeof DrawerPrimitive.Trigger>) {
  return <DrawerPrimitive.Trigger data-slot="drawer-trigger" {...props} />;
}

function DrawerPortal(props: React.ComponentProps<typeof DrawerPrimitive.Portal>) {
  const container = usePortalContainer();
  return <DrawerPrimitive.Portal data-slot="drawer-portal" container={container} {...props} />;
}

function DrawerClose(props: React.ComponentProps<typeof DrawerPrimitive.Close>) {
  return <DrawerPrimitive.Close data-slot="drawer-close" {...props} />;
}

function DrawerOverlay({ className, ...props }: React.ComponentProps<typeof DrawerPrimitive.Overlay>) {
  return (
    <DrawerPrimitive.Overlay
      data-slot="drawer-overlay"
      className={cn("fixed inset-0 z-50 bg-scrim data-[state=closed]:animate-fade-out data-[state=open]:animate-fade-in", className)}
      {...props}
    />
  );
}

const PLACE: Record<Direction, string> = {
  bottom: "inset-x-0 bottom-0 max-h-[85dvh] border-t border-line data-[state=closed]:animate-sheet-out-bottom data-[state=open]:animate-sheet-in-bottom",
  top: "inset-x-0 top-0 max-h-[85dvh] flex-col-reverse border-b border-line data-[state=closed]:animate-sheet-out-top data-[state=open]:animate-sheet-in-top",
  right: "inset-y-0 right-0 w-3/4 flex-row-reverse border-l border-line sm:max-w-96 data-[state=closed]:animate-sheet-out-right data-[state=open]:animate-sheet-in-right",
  left: "inset-y-0 left-0 w-3/4 flex-row border-r border-line sm:max-w-96 data-[state=closed]:animate-sheet-out-left data-[state=open]:animate-sheet-in-left",
};

// Where a pull closes the drawer: toward its own edge (positive for bottom and right).
const AXIS: Record<Direction, { axis: "x" | "y"; sign: 1 | -1 }> = { bottom: { axis: "y", sign: 1 }, top: { axis: "y", sign: -1 }, right: { axis: "x", sign: 1 }, left: { axis: "x", sign: -1 } };
const VELOCITY = 0.11;
const SKIP = "button, a, input, textarea, select, [role=slider], [contenteditable=true], [data-drawer-no-drag]";

function useDrag(direction: Direction, close: () => void) {
  const panel = React.useRef<HTMLDivElement>(null);
  const drag = React.useRef<{ id: number; start: number; at: number; time: number } | null>(null);
  const { axis, sign } = AXIS[direction];
  const translate = (px: number) => (axis === "y" ? `translateY(${px}px)` : `translateX(${px}px)`);

  const onPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (drag.current || event.button !== 0) return; // one pointer only
    if ((event.target as Element).closest(SKIP)) return;
    if (window.getSelection()?.toString()) return;
    const start = axis === "y" ? event.clientY : event.clientX;
    drag.current = { id: event.pointerId, start, at: 0, time: performance.now() };
    event.currentTarget.setPointerCapture(event.pointerId);
    if (panel.current) panel.current.style.transition = "none";
  };

  const onPointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    if (!d || d.id !== event.pointerId || !panel.current) return;
    const raw = (axis === "y" ? event.clientY : event.clientX) - d.start;
    const toward = raw * sign;
    // Toward the edge it follows the pointer; away from it, resistance grows with distance.
    const moved = toward >= 0 ? toward : -Math.sqrt(-toward) * 2;
    d.at = moved;
    panel.current.style.transform = translate(moved * sign);
  };

  const end = (event: React.PointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    if (!d || d.id !== event.pointerId || !panel.current) return;
    drag.current = null;
    const el = panel.current;
    const size = axis === "y" ? el.offsetHeight : el.offsetWidth;
    const velocity = Math.abs(d.at) / Math.max(1, performance.now() - d.time);
    if (d.at > 0 && (d.at > size / 3 || velocity > VELOCITY)) {
      el.style.transition = "";
      close();
      return;
    }
    el.style.transition = "transform var(--ds-duration-slow) var(--ds-easing-drawer)";
    el.style.transform = "";
    const reset = () => {
      el.style.transition = "";
      el.removeEventListener("transitionend", reset);
    };
    el.addEventListener("transitionend", reset);
  };

  return { panel, handlers: { onPointerDown, onPointerMove, onPointerUp: end, onPointerCancel: end } };
}

function DrawerContent({ className, children, ...props }: React.ComponentProps<typeof DrawerPrimitive.Content>) {
  const { direction, setOpen } = React.useContext(DrawerContext);
  const { panel, handlers } = useDrag(direction, () => setOpen(false));
  const vertical = direction === "bottom" || direction === "top";
  return (
    <DrawerPortal>
      <DrawerOverlay />
      <DrawerPrimitive.Content
        ref={panel}
        data-slot="drawer-content"
        data-direction={direction}
        className={cn("group/drawer fixed z-50 flex touch-none bg-surface text-fg outline-none", vertical ? "flex-col" : "", PLACE[direction], className)}
        {...handlers}
        {...props}
      >
        <div aria-hidden data-slot="drawer-handle" className={cn("shrink-0 bg-line", vertical ? "mx-auto my-3 h-1 w-10" : "my-auto mx-3 h-10 w-1")} />
        <div className="flex min-h-0 min-w-0 flex-1 touch-auto flex-col overflow-auto fade-xy">{children}</div>
      </DrawerPrimitive.Content>
    </DrawerPortal>
  );
}

function DrawerHeader({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="drawer-header" className={cn("flex flex-col gap-1 px-5 pt-2 pb-4 group-data-[direction=bottom]/drawer:text-center group-data-[direction=top]/drawer:text-center md:text-left md:group-data-[direction=bottom]/drawer:text-left", className)} {...props} />;
}

function DrawerFooter({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="drawer-footer" className={cn("mt-auto flex flex-col gap-2 p-5", className)} {...props} />;
}

function DrawerTitle({ className, ...props }: React.ComponentProps<typeof DrawerPrimitive.Title>) {
  return <DrawerPrimitive.Title data-slot="drawer-title" className={cn("font-sans text-h3 leading-tight font-normal text-fg", className)} {...props} />;
}

function DrawerDescription({ className, ...props }: React.ComponentProps<typeof DrawerPrimitive.Description>) {
  return <DrawerPrimitive.Description data-slot="drawer-description" className={cn("text-body leading-body text-fg-secondary", className)} {...props} />;
}

export { Drawer, DrawerClose, DrawerContent, DrawerDescription, DrawerFooter, DrawerHeader, DrawerOverlay, DrawerPortal, DrawerTitle, DrawerTrigger };

```
