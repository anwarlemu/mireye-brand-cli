# Tabs
Line tabs on a 1px Mist rule with a 1px Forest line under the selected one, and segmented tabs in a Stone-lined Bone track with the selected tab on Mist.

Install: npx mireye-ds add tabs
Requires: theme, utils
Packages: @chakra-ui/react
Exports: Tabs, TabsList, TabsTrigger, TabsContent
Client boundary: yes
Reference: Not in Figma: built from the system's 1px lines and the rail's Mist current row, for a designer's review


## Usage
Use line tabs to switch between views of one thing (Parcel, Power, Water, Terrain on a site). Use variant="segmented" for two to four short choices that change how the same data is shown (Map, List, Compare); pass full to share the width. Labels are words, one or two each.
- Avoid: Rounded or pill tabs
- Avoid: A thick or coloured underline
- Avoid: Bold or medium labels
- Avoid: A mark that animates on first paint or on resize
- Avoid: Icons that move on hover


## Examples
Example components: npx mireye-ds add tabs
[Preview](https://mireye-ds.agencidev.com/preview/tabs/Preview) | [Segmented](https://mireye-ds.agencidev.com/preview/tabs/Segmented) | [Full](https://mireye-ds.agencidev.com/preview/tabs/Full)

examples/tabs.tsx

```tsx
"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function Preview() {
  return (
    <Tabs defaultValue="parcel" className="w-full">
      <TabsList>
        <TabsTrigger value="parcel">Parcel</TabsTrigger>
        <TabsTrigger value="power">Power</TabsTrigger>
        <TabsTrigger value="water">Water</TabsTrigger>
        <TabsTrigger value="terrain">Terrain</TabsTrigger>
      </TabsList>
      <TabsContent value="parcel" className="text-body text-fg-secondary">212.6 ac, zoned I-2 Industrial, one owner of record.</TabsContent>
      <TabsContent value="power" className="text-body text-fg-secondary">138 kV substation 0.8 mi east of the parcel.</TabsContent>
      <TabsContent value="water" className="text-body text-fg-secondary">Municipal main along the north edge.</TabsContent>
      <TabsContent value="terrain" className="text-body text-fg-secondary">412 ft average elevation, 2.8% slope.</TabsContent>
    </Tabs>
  );
}

export function Segmented() {
  return (
    <Tabs defaultValue="map" className="w-full max-w-86">
      <TabsList variant="segmented">
        <TabsTrigger value="map">Map</TabsTrigger>
        <TabsTrigger value="list">List</TabsTrigger>
        <TabsTrigger value="compare">Compare</TabsTrigger>
      </TabsList>
    </Tabs>
  );
}

export function Full() {
  return (
    <Tabs defaultValue="api" className="w-full max-w-86">
      <TabsList variant="segmented" full>
        <TabsTrigger value="api">API</TabsTrigger>
        <TabsTrigger value="enterprise">Enterprise</TabsTrigger>
      </TabsList>
    </Tabs>
  );
}

```

## Source

components/ui/tabs.tsx

```tsx
"use client";

import * as React from "react";
import { Tabs as ChakraTabs, useTabsContext } from "@chakra-ui/react";

import { cn } from "@/lib/utils";

// Mireye's tabs. Figma has no tabs, so they are built from the system's lines (for a designer's review).
// - `line` (default): 13px regular labels in Forest at 72% on a 1px Mist rule; the selected label is Forest and a 1px
//   Forest line sits under it, on the rule. Tabs are 36px tall with 12px sides; hover darkens the label (150ms).
// - `segmented`: a white track with the 1px Stone line and 2px inside; each tab is 28px tall with a 12px label, and the
//   selected one sits on Mist (the rail's current row). For two to four short choices (Desktop, Phone).
// The selected mark (the line or the Mist key) slides to the next tab: transform and width, 200ms, ease-out. It is
// placed without motion the first time and whenever the list resizes, and holds still under reduced motion. Square
// throughout. `full` stretches the tabs to share the width.
type TabsProps = Omit<React.ComponentProps<typeof ChakraTabs.Root>, "onValueChange"> & { onValueChange?: (value: string) => void };
function Tabs({ className, onValueChange, ...props }: TabsProps) {
  return <ChakraTabs.Root unstyled data-slot="tabs" className={cn("flex flex-col gap-4", className)} onValueChange={(details) => onValueChange?.(details.value)} {...props} />;
}

const KEY_MOVE = ["transform", "width", "height"].map((property) => `${property} var(--ds-duration-base) var(--ds-easing-out)`).join(", ");

/** Puts the key under the selected tab. It slides only once it has been placed, and never under reduced motion. */
function placeKey(box: HTMLElement | null, key: HTMLElement | null, animate: boolean) {
  if (!box || !key) return;
  const tab = box.querySelector<HTMLElement>('[role="tab"][aria-selected="true"]');
  if (!tab?.offsetWidth) {
    key.style.visibility = "hidden";
    delete box.dataset.sliding;
    return;
  }
  const still = typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
  key.style.transition = animate && !still && "sliding" in box.dataset ? KEY_MOVE : "none";
  key.style.width = `${tab.offsetWidth}px`;
  const line = box.dataset.variant === "line";
  key.style.height = line ? "1px" : `${tab.offsetHeight}px`;
  key.style.transform = `translate(${tab.offsetLeft}px, ${line ? tab.offsetTop + tab.offsetHeight - 1 : tab.offsetTop}px)`;
  key.style.visibility = "visible";
  box.dataset.sliding = "";
}

function TabsList({ className, full = false, variant = "line", children, ref, ...props }: React.ComponentProps<typeof ChakraTabs.List> & { full?: boolean; variant?: "line" | "segmented" }) {
  const { value } = useTabsContext();
  const list = React.useRef<HTMLDivElement | null>(null);
  const key = React.useRef<HTMLSpanElement>(null);
  const setRef = React.useCallback(
    (node: HTMLDivElement | null) => {
      list.current = node;
      if (typeof ref === "function") ref(node);
      else if (ref) ref.current = node;
    },
    [ref],
  );

  React.useLayoutEffect(() => placeKey(list.current, key.current, true), [value]);
  React.useLayoutEffect(() => {
    const box = list.current;
    if (!box || typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(() => placeKey(box, key.current, false));
    observer.observe(box);
    return () => observer.disconnect();
  }, []);

  return (
    <ChakraTabs.List
      unstyled
      ref={setRef}
      data-slot="tabs-list"
      data-variant={variant}
      data-full={full ? "true" : undefined}
      className={cn(
        "group/tabs-list relative inline-flex w-fit max-w-full flex-wrap items-center",
        variant === "line" ? "gap-1 shadow-[inset_0_-1px_0_var(--ds-color-border-subtle)]" : "gap-0.5 border border-line bg-surface p-0.5",
        full && "flex w-full",
        className,
      )}
      {...props}
    >
      <span ref={key} aria-hidden data-slot="tabs-key" className={cn("pointer-events-none invisible absolute top-0 left-0", variant === "line" ? "bg-line-strong" : "bg-subtle-hover")} />
      {children}
    </ChakraTabs.List>
  );
}

function TabsTrigger({ className, ...props }: React.ComponentProps<typeof ChakraTabs.Trigger>) {
  return (
    <ChakraTabs.Trigger
      unstyled
      data-slot="tabs-trigger"
      className={cn(
        "relative z-1 inline-flex shrink-0 cursor-pointer items-center justify-center gap-1.5 bg-transparent font-sans leading-none font-normal whitespace-nowrap text-fg-muted outline-none transition-[background-color,color] duration-fast ease-out hover:text-fg focus-visible:outline-solid focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-line-strong disabled:pointer-events-none disabled:text-fg-subtle data-[selected]:text-fg motion-reduce:transition-none in-data-[full=true]:flex-1 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        "group-data-[variant=line]/tabs-list:h-9 group-data-[variant=line]/tabs-list:px-3 group-data-[variant=line]/tabs-list:text-body",
        // Before the key is placed (first paint, no script), the selected tab draws its own mark.
        "group-data-[variant=line]/tabs-list:data-[selected]:shadow-[inset_0_-1px_0_var(--ds-color-border-strong)] in-data-[sliding]:data-[selected]:shadow-none",
        "group-data-[variant=segmented]/tabs-list:h-7 group-data-[variant=segmented]/tabs-list:px-3 group-data-[variant=segmented]/tabs-list:text-caption group-data-[variant=segmented]/tabs-list:hover:bg-subtle group-data-[variant=segmented]/tabs-list:data-[selected]:bg-subtle-hover in-data-[sliding]:data-[selected]:bg-transparent in-data-[sliding]:hover:data-[selected]:bg-transparent",
        className,
      )}
      {...props}
    />
  );
}

function TabsContent({ className, ...props }: React.ComponentProps<typeof ChakraTabs.Content>) {
  return <ChakraTabs.Content unstyled data-slot="tabs-content" className={cn("min-w-0 outline-none focus-visible:outline-solid focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-line-strong", className)} {...props} />;
}

export { Tabs, TabsList, TabsTrigger, TabsContent };

```
