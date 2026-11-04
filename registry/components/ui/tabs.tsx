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
