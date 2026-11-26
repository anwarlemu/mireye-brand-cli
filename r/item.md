# Item
A row of content: a site with its aerial, name, coordinates and tags; a source; a rail row. Square, Fog under the pointer, Mist when current.

Install: npx mireye-ds add item
Requires: theme, utils, separator
Packages: @chakra-ui/react, class-variance-authority
Exports: Item, ItemActions, ItemContent, ItemDescription, ItemFooter, ItemGroup, ItemHeader, ItemMedia, ItemSeparator, ItemTitle
Client boundary: yes
Reference: LAND data-table (the Leads sites list) and Figma UI · Agent chat (443:433): Sources


## Usage
Use for rows in a list that are not a table: results (a site's image, name and DM Mono coordinates, Fog tags at the end), the sources behind an answer, or rail rows (size sm). Render a link or button with asChild so the row fills on hover; mark the current one with aria-current. Rule rows with ItemSeparator. Use outline for a standalone row, muted inside a Bone panel.
- Avoid: Rounded rows
- Avoid: Coloured descriptions
- Avoid: Hover fills on rows that do nothing
- Avoid: Icons that move on hover
- Avoid: More than two tags per row


## Examples
Example components: npx mireye-ds add item icons badge button
Example packages: @phosphor-icons/react
[Preview](https://mireye-ds.agencidev.com/preview/item/Preview) | [Sources](https://mireye-ds.agencidev.com/preview/item/Sources) | [Rail](https://mireye-ds.agencidev.com/preview/item/Rail) | [Variants](https://mireye-ds.agencidev.com/preview/item/Variants)

examples/item.tsx

```tsx
import { DropIcon, FileTextIcon, LightningIcon, MapTrifoldIcon, MountainsIcon, StackIcon } from "@phosphor-icons/react/ssr";

import { ArrowRightIcon } from "@/components/icons/arrow-right";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Item, ItemActions, ItemContent, ItemDescription, ItemGroup, ItemHeader, ItemMedia, ItemSeparator, ItemTitle } from "@/components/ui/item";

const SITES = [
  { name: "Ellis County site 14", at: "32.4113, -96.8302", acres: "212.6 ac", kv: "345 kV" },
  { name: "Navarro County site 3", at: "32.0954, -96.4689", acres: "305.0 ac", kv: "138 kV" },
  { name: "Kaufman County site 8", at: "32.5890, -96.3087", acres: "198.2 ac", kv: "138 kV" },
];

export function Preview() {
  return (
    <ItemGroup className="w-full max-w-110">
      {SITES.map((site, i) => (
        <div key={site.name}>
          {i > 0 && <ItemSeparator />}
          <Item asChild aria-current={i === 0 ? "true" : undefined}>
            <a href="#site">
              <ItemMedia variant="image">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/examples/farmland-aerial.jpg" alt="" />
              </ItemMedia>
              <ItemContent>
                <ItemTitle>{site.name}</ItemTitle>
                <ItemDescription className="font-mono">{site.at}</ItemDescription>
              </ItemContent>
              <ItemActions className="max-sm:hidden">
                <Badge>{site.acres}</Badge>
                <Badge>{site.kv}</Badge>
              </ItemActions>
            </a>
          </Item>
        </div>
      ))}
    </ItemGroup>
  );
}

export function Sources() {
  return (
    <ItemGroup className="w-full max-w-110">
      {[
        { title: "Flood zone map", meta: "National flood hazard layer, Oct 2026" },
        { title: "Elevation model", meta: "10 m elevation model" },
        { title: "Parcel records", meta: "Ellis County appraisal district" },
      ].map((source, i) => (
        <div key={source.title}>
          {i > 0 && <ItemSeparator />}
          <Item asChild>
            <button type="button" className="w-full text-left">
              <ItemHeader className="justify-start gap-2 text-caption text-fg-muted">
                <span className="tabular-nums">{i + 1}</span>
                <span>Source</span>
              </ItemHeader>
              <ItemContent>
                <ItemTitle>{source.title}</ItemTitle>
                <ItemDescription>{source.meta}</ItemDescription>
              </ItemContent>
            </button>
          </Item>
        </div>
      ))}
    </ItemGroup>
  );
}

export function Rail() {
  const rows = [
    { label: "Map", icon: MapTrifoldIcon, current: true },
    { label: "Saved sites", icon: StackIcon },
    { label: "Reports", icon: FileTextIcon },
    { label: "Power", icon: LightningIcon },
    { label: "Water", icon: DropIcon },
  ];
  return (
    <ItemGroup className="w-full max-w-53 gap-0.5">
      {rows.map(({ label, icon: Icon, current }) => (
        <Item key={label} size="sm" asChild aria-current={current ? "page" : undefined}>
          <a href={`#${label}`}>
            <ItemMedia variant="icon">
              <Icon />
            </ItemMedia>
            <ItemContent>
              <ItemTitle>{label}</ItemTitle>
            </ItemContent>
          </a>
        </Item>
      ))}
    </ItemGroup>
  );
}

export function Variants() {
  return (
    <div className="grid w-full max-w-120 gap-3">
      <Item variant="outline">
        <ItemMedia variant="icon">
          <MountainsIcon />
        </ItemMedia>
        <ItemContent>
          <ItemTitle>Terrain</ItemTitle>
          <ItemDescription>412 ft average elevation, 2.8% slope</ItemDescription>
        </ItemContent>
        <ItemActions>
          <Button variant="ghost" size="icon" aria-label="Open terrain details">
            <ArrowRightIcon size={16} />
          </Button>
        </ItemActions>
      </Item>
      <Item variant="muted" size="sm">
        <ItemMedia variant="icon">
          <LightningIcon />
        </ItemMedia>
        <ItemContent>
          <ItemTitle>345 kV substation, 0.8 mi east</ItemTitle>
        </ItemContent>
      </Item>
      <Item size="xs">
        <ItemContent>
          <ItemTitle>Queue position: open</ItemTitle>
        </ItemContent>
      </Item>
    </div>
  );
}

```

## Source

components/ui/item.tsx

```tsx
"use client";

import * as React from "react";
import { chakra } from "@chakra-ui/react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";

// A row of content: a site in a result list (name and coordinates over its tags), a source behind an answer, a row in
// a rail. `default` is bare; a row that is a link or button fills with Fog under the pointer and Mist when pressed
// (150ms), and a current one (aria-current or data-selected) sits on Mist, the rail's current row. `outline` is a
// white row in the 1px Stone line; `muted` is Fog. Square throughout; nothing moves.
function ItemGroup({ className, ...props }: React.ComponentProps<"div">) {
  return <div role="list" data-slot="item-group" className={cn("group/item-group flex flex-col", className)} {...props} />;
}

function ItemSeparator({ className, ...props }: React.ComponentProps<typeof Separator>) {
  return <Separator data-slot="item-separator" orientation="horizontal" className={cn("my-0.5", className)} {...props} />;
}

const itemVariants = cva(
  "group/item flex flex-wrap items-center border border-transparent font-sans text-body leading-body text-fg outline-none transition-[background-color] duration-fast ease-out focus-visible:outline-solid focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-line-strong motion-reduce:transition-none [a]:hover:bg-subtle [button]:hover:bg-subtle [a]:active:bg-subtle-hover [button]:active:bg-subtle-hover aria-[current=page]:bg-subtle-hover aria-[current=true]:bg-subtle-hover data-[selected=true]:bg-subtle-hover aria-[current=page]:hover:bg-subtle-hover aria-[current=true]:hover:bg-subtle-hover data-[selected=true]:hover:bg-subtle-hover",
  {
    variants: {
      variant: {
        default: "bg-transparent",
        outline: "border-line bg-surface",
        muted: "bg-subtle [a]:hover:bg-subtle-hover [button]:hover:bg-subtle-hover",
      },
      size: {
        default: "gap-3 p-3",
        sm: "min-h-9 gap-2.5 px-3 py-1.5",
        xs: "gap-2 px-2 py-1",
      },
    },
    defaultVariants: { variant: "default", size: "default" },
  },
);

function Item({ className, variant = "default", size = "default", asChild = false, ...props }: React.ComponentProps<"div"> & VariantProps<typeof itemVariants> & { asChild?: boolean }) {
  const Comp = asChild ? chakra.div : "div";
  // Chakra's factory renders its child in its place only when told to.
  const slotProps = asChild ? { asChild: true } : {};
  return <Comp {...slotProps} data-slot="item" data-variant={variant} data-size={size} className={cn(itemVariants({ variant, size, className }))} {...props} />;
}

const itemMediaVariants = cva("flex shrink-0 items-center justify-center gap-2 group-has-data-[slot=item-description]/item:self-start [&_svg]:pointer-events-none", {
  variants: {
    variant: {
      default: "bg-transparent",
      icon: "text-fg [&_svg:not([class*='size-'])]:size-4",
      image: "h-9 w-12 overflow-hidden bg-subtle [&_img]:size-full [&_img]:object-cover",
    },
  },
  defaultVariants: { variant: "default" },
});

function ItemMedia({ className, variant = "default", ...props }: React.ComponentProps<"div"> & VariantProps<typeof itemMediaVariants>) {
  return <div data-slot="item-media" data-variant={variant} className={cn(itemMediaVariants({ variant, className }))} {...props} />;
}

function ItemContent({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="item-content" className={cn("flex min-w-0 flex-1 flex-col gap-1 [&+[data-slot=item-content]]:flex-none", className)} {...props} />;
}

function ItemTitle({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="item-title" className={cn("flex w-fit min-w-0 items-center gap-2 text-body leading-tight text-fg", className)} {...props} />;
}

/** The muted line under a title (coordinates, a count, a source), clamped to two lines. */
function ItemDescription({ className, ...props }: React.ComponentProps<"p">) {
  return <p data-slot="item-description" className={cn("line-clamp-2 text-caption leading-tight font-normal text-balance text-fg-muted [&>a]:underline [&>a]:underline-offset-4", className)} {...props} />;
}

function ItemActions({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="item-actions" className={cn("flex items-center gap-1", className)} {...props} />;
}

/** The top line of an item: what it is at the left (a tag, a county), when or where at the right (a date, a distance). */
function ItemHeader({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="item-header" className={cn("flex basis-full items-center justify-between gap-2 text-body leading-tight", className)} {...props} />;
}

function ItemFooter({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="item-footer" className={cn("flex basis-full items-center justify-between gap-2", className)} {...props} />;
}

export { Item, ItemActions, ItemContent, ItemDescription, ItemFooter, ItemGroup, ItemHeader, ItemMedia, ItemSeparator, ItemTitle };

```
