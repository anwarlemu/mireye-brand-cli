# Navigation Menu
Square 36px nav keys with a still caret, Fog under the pointer and while open, and a panel in the dropdown menu's frame (Bone, 6px cut corner, 1px Stone line, no shadow) with square link rows.

Install: npx mireye-ds add navigation-menu
Requires: theme, utils
Packages: radix-ui, @phosphor-icons/react, class-variance-authority
Exports: NavigationMenu, NavigationMenuContent, NavigationMenuIndicator, NavigationMenuItem, NavigationMenuLink, NavigationMenuList, NavigationMenuTrigger, NavigationMenuViewport, navigationMenuTriggerStyle
Client boundary: yes
Reference: Not in Figma. Drawn in Mireye's grammar: the dropdown menu's panel and rows


## Usage
Use for a site's top navigation when a section has several pages worth describing (Tools: site search, grid access, interconnection, fit score). Plain links sit beside the triggers with navigationMenuTriggerStyle.
- Avoid: A caret that turns or moves on hover
- Avoid: More than two columns of links
- Avoid: Rounded keys or a shadow on the panel
- Avoid: Actions in a navigation panel


## Examples
Example components: npx mireye-ds add navigation-menu
Example packages: @phosphor-icons/react
[Preview](https://mireye-ds.agencidev.com/preview/navigation-menu/Preview) | [Open](https://mireye-ds.agencidev.com/preview/navigation-menu/Open)

examples/navigation-menu.tsx

```tsx
"use client";

import { BookOpenTextIcon, ChartLineIcon, LightningIcon, MapTrifoldIcon, PlugsIcon, StackIcon } from "@phosphor-icons/react/ssr";

import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";

const TOOLS = [
  { title: "Site search", body: "Find parcels that fit a project by acreage, slope and zoning.", icon: MapTrifoldIcon },
  { title: "Grid access", body: "Distance to substations and lines by kV, with spare capacity.", icon: LightningIcon },
  { title: "Interconnection", body: "Queue positions and study results for each point of interconnection.", icon: PlugsIcon },
  { title: "Fit score", body: "How well a site meets your requirements, and why.", icon: ChartLineIcon },
];

function Menu({ defaultValue }: { defaultValue?: string }) {
  return (
    <NavigationMenu defaultValue={defaultValue}>
      <NavigationMenuList>
        <NavigationMenuItem value="tools">
          <NavigationMenuTrigger>Tools</NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul className="grid w-[min(34rem,calc(100vw-2rem))] sm:grid-cols-2">
              {TOOLS.map(({ title, body, icon: Icon }) => (
                <li key={title}>
                  <NavigationMenuLink href={`#${title.toLowerCase().replace(/ /g, "-")}`}>
                    <span className="flex items-center gap-2 font-medium">
                      <Icon />
                      {title}
                    </span>
                    <span className="text-fg-secondary">{body}</span>
                  </NavigationMenuLink>
                </li>
              ))}
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>
        <NavigationMenuItem value="data">
          <NavigationMenuTrigger>Data</NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul className="grid w-[min(16rem,calc(100vw-2rem))]">
              <li>
                <NavigationMenuLink href="#layers">
                  <span className="flex items-center gap-2 font-medium">
                    <StackIcon />
                    Layers
                  </span>
                  <span className="text-fg-secondary">Parcels, floodplain, wetlands and land cover.</span>
                </NavigationMenuLink>
              </li>
              <li>
                <NavigationMenuLink href="#sources">
                  <span className="flex items-center gap-2 font-medium">
                    <BookOpenTextIcon />
                    Sources
                  </span>
                  <span className="text-fg-secondary">Where each value comes from, and when it was read.</span>
                </NavigationMenuLink>
              </li>
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuLink href="#docs" className={navigationMenuTriggerStyle()}>
            Docs
          </NavigationMenuLink>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  );
}

export function Preview() {
  return (
    <div className="flex justify-center">
      <Menu />
    </div>
  );
}

export function Open() {
  return (
    <div className="flex min-h-80 items-start justify-center">
      <Menu defaultValue="tools" />
    </div>
  );
}

```

## Source

components/ui/navigation-menu.tsx

```tsx
"use client";

import * as React from "react";
import { NavigationMenu as NavigationMenuPrimitive } from "radix-ui";
import { CaretDownIcon } from "@phosphor-icons/react/ssr";
import { cva } from "class-variance-authority";

import { cn } from "@/lib/utils";

// Site navigation with panels. Figma has none, so it is drawn in Mireye's grammar: triggers and links are square 36px
// keys with 12px sides and a 13px regular Forest label, Fog under the pointer and while open, Mist while pressed, and
// the trigger's 16px caret stays still (icons never move on hover, and Radix opens these panels on hover). The panel
// opens 6px below in the dropdown menu's frame (white, the 6px cut corner, a 1px Stone line, no shadow, 4px inside
// it) and grows out of the trigger from 98 percent with a fade (150ms in, 120ms out), with no animated resizing
// (centered under the menu on phones, at its start from 768px). Moving between panels crossfades them (150ms). Links
// inside are square rows with a 13px medium title over a 13px secondary line, Fog under the pointer.
function NavigationMenu({ className, children, viewport = true, ...props }: React.ComponentProps<typeof NavigationMenuPrimitive.Root> & { viewport?: boolean }) {
  return (
    <NavigationMenuPrimitive.Root data-slot="navigation-menu" data-viewport={viewport} className={cn("group/navigation-menu relative flex max-w-max flex-1 items-center justify-center", className)} {...props}>
      {children}
      {viewport && <NavigationMenuViewport />}
    </NavigationMenuPrimitive.Root>
  );
}

function NavigationMenuList({ className, ...props }: React.ComponentProps<typeof NavigationMenuPrimitive.List>) {
  return <NavigationMenuPrimitive.List data-slot="navigation-menu-list" className={cn("group flex flex-1 list-none items-center justify-center gap-1", className)} {...props} />;
}

function NavigationMenuItem({ className, ...props }: React.ComponentProps<typeof NavigationMenuPrimitive.Item>) {
  return <NavigationMenuPrimitive.Item data-slot="navigation-menu-item" className={cn("relative", className)} {...props} />;
}

const navigationMenuTriggerStyle = cva(
  "group inline-flex h-9 w-max items-center justify-center gap-2 px-3 font-sans text-body leading-tight font-normal text-fg outline-none transition-[background-color] duration-150 ease-out hover:bg-subtle data-[active]:bg-subtle data-[state=open]:bg-subtle active:bg-subtle-hover data-[state=open]:active:bg-subtle-hover active:duration-0 focus-visible:outline-solid focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-line-strong disabled:pointer-events-none disabled:text-fg-subtle motion-reduce:transition-none [&_svg:not([class*='size-'])]:size-4",
);

function NavigationMenuTrigger({ className, children, ...props }: React.ComponentProps<typeof NavigationMenuPrimitive.Trigger>) {
  return (
    <NavigationMenuPrimitive.Trigger data-slot="navigation-menu-trigger" className={cn(navigationMenuTriggerStyle(), className)} {...props}>
      {children}
      <CaretDownIcon aria-hidden className="size-4 text-fg-secondary" />
    </NavigationMenuPrimitive.Trigger>
  );
}

function NavigationMenuContent({ className, ...props }: React.ComponentProps<typeof NavigationMenuPrimitive.Content>) {
  return (
    <NavigationMenuPrimitive.Content
      data-slot="navigation-menu-content"
      className={cn(
        "top-0 left-0 w-full p-1 md:absolute md:w-auto",
        "group-data-[viewport=false]/navigation-menu:ds-cut-frame group-data-[viewport=false]/navigation-menu:top-full group-data-[viewport=false]/navigation-menu:mt-1.5 group-data-[viewport=false]/navigation-menu:[--ds-cut:var(--ds-cut-md)] group-data-[viewport=false]/navigation-menu:[--ds-shape-fill:var(--ds-color-bg-default)] group-data-[viewport=false]/navigation-menu:[--ds-shape-stroke:var(--ds-color-border-default)] group-data-[viewport=false]/navigation-menu:origin-top-left group-data-[viewport=false]/navigation-menu:data-[state=closed]:animate-pop-out group-data-[viewport=false]/navigation-menu:data-[state=open]:animate-pop-in",
        "data-[motion^=from-]:animate-fade-in data-[motion^=to-]:animate-fade-out",
        className,
      )}
      {...props}
    />
  );
}

function NavigationMenuViewport({ className, ...props }: React.ComponentProps<typeof NavigationMenuPrimitive.Viewport>) {
  return (
    <div className="absolute top-full left-1/2 isolate z-50 flex -translate-x-1/2 justify-center md:left-0 md:translate-x-0">
      <NavigationMenuPrimitive.Viewport
        data-slot="navigation-menu-viewport"
        className={cn(
          "ds-cut-frame relative mt-1.5 h-(--radix-navigation-menu-viewport-height) w-(--radix-navigation-menu-viewport-width) max-w-[calc(100vw-2rem)] origin-top overflow-hidden text-fg [--ds-cut:var(--ds-cut-md)] [--ds-shape-fill:var(--ds-color-bg-default)] [--ds-shape-stroke:var(--ds-color-border-default)] data-[state=closed]:animate-pop-out data-[state=open]:animate-pop-in md:origin-top-left",
          className,
        )}
        {...props}
      />
    </div>
  );
}

function NavigationMenuLink({ className, ...props }: React.ComponentProps<typeof NavigationMenuPrimitive.Link>) {
  return (
    <NavigationMenuPrimitive.Link
      data-slot="navigation-menu-link"
      className={cn(
        "flex flex-col gap-1 p-3 text-body leading-tight text-fg outline-none transition-[background-color] duration-150 ease-out hover:bg-subtle active:bg-subtle-hover active:duration-0 focus-visible:outline-solid focus-visible:outline-1 focus-visible:-outline-offset-1 focus-visible:outline-line-strong data-[active=true]:bg-subtle motion-reduce:transition-none [&_svg:not([class*='size-'])]:size-4 [&_svg:not([class*='text-'])]:text-fg-secondary",
        className,
      )}
      {...props}
    />
  );
}

function NavigationMenuIndicator({ className, ...props }: React.ComponentProps<typeof NavigationMenuPrimitive.Indicator>) {
  return (
    <NavigationMenuPrimitive.Indicator
      data-slot="navigation-menu-indicator"
      className={cn("top-full z-10 flex h-1.5 items-end justify-center overflow-hidden data-[state=hidden]:animate-fade-out data-[state=visible]:animate-fade-in", className)}
      {...props}
    >
      <div className="relative top-[60%] size-2.5 rotate-45 border-t border-l border-line bg-surface" />
    </NavigationMenuPrimitive.Indicator>
  );
}

export {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuIndicator,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  NavigationMenuViewport,
  navigationMenuTriggerStyle,
};

```
