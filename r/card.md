# Card
The Bone cut frame (a 1px Stone line with the 8px chamfer at the top-left), the Fog card with no line and the Forest inverse card. Square everywhere else, no shadow.

Install: npx mireye-ds add card
Requires: theme, utils
Packages: class-variance-authority
Exports: Card, CardAction, CardContent, CardDescription, CardFooter, CardHeader, CardTitle, cardVariants
Client boundary: not required by this entry file
Reference: Figma UI · Agent chat (443:433): the message panel's cut frame, at the product scale


## Usage
Use the default card for a block of facts about one thing (a site, a source, a requirement): a 16px regular title, a muted description, Fog tags or values in CardContent and an action in CardAction or CardFooter. Use muted for a group of values inside a Bone panel, and inverse for the one card that leads (the best fit). Put cards on the canvas; inside a Bone panel prefer rules over nested cards.
- Avoid: Rounded corners
- Avoid: Drop shadows
- Avoid: A cut corner anywhere but the top-left
- Avoid: A coloured header bar
- Avoid: More than one inverse card on a screen
- Avoid: Nesting cards more than one level


## Examples
Example components: npx mireye-ds add card badge button
Example packages: @phosphor-icons/react
[Preview](https://mireye-ds.agencidev.com/preview/card/Preview) | [Site](https://mireye-ds.agencidev.com/preview/card/Site) | [Variants](https://mireye-ds.agencidev.com/preview/card/Variants) | [Small](https://mireye-ds.agencidev.com/preview/card/Small)

examples/card.tsx

```tsx
import { DropIcon, LightningIcon, MountainsIcon } from "@phosphor-icons/react/ssr";

import { Badge, BadgeMark } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardAction, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

export function Preview() {
  return (
    <div className="grid w-full gap-4 sm:grid-cols-3">
      <Card>
        <CardHeader>
          <CardTitle>
            <LightningIcon />
            Power
          </CardTitle>
          <CardDescription>Nearest substation 0.8 mi east, 138 kV, with capacity on the queue.</CardDescription>
        </CardHeader>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>
            <DropIcon />
            Water
          </CardTitle>
          <CardDescription>Municipal main along the north edge. Outside the 100-year flood zone.</CardDescription>
        </CardHeader>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>
            <MountainsIcon />
            Terrain
          </CardTitle>
          <CardDescription>412 ft average elevation, 2.8% slope.</CardDescription>
        </CardHeader>
      </Card>
    </div>
  );
}

export function Site() {
  return (
    <Card className="w-full max-w-110">
      <CardHeader>
        <CardTitle>Ellis County site 14</CardTitle>
        <CardDescription className="font-mono text-caption">32.4113, -96.8302</CardDescription>
        <CardAction>
          <Badge variant="outline">
            <BadgeMark state="verified" />
            Verified
          </Badge>
        </CardAction>
      </CardHeader>
      <CardContent className="flex flex-wrap gap-2">
        <Badge>212.6 ac</Badge>
        <Badge>138 kV</Badge>
        <Badge>Zone X</Badge>
        <Badge>I-2 Industrial</Badge>
      </CardContent>
      <CardFooter className="justify-end">
        <Button variant="outline">Open report</Button>
      </CardFooter>
    </Card>
  );
}

export function Variants() {
  return (
    <div className="grid w-full gap-4 sm:grid-cols-2">
      <Card variant="muted">
        <CardHeader>
          <CardTitle>Buy box</CardTitle>
          <CardDescription>200+ ac, 138 kV within 2 mi, outside flood zones.</CardDescription>
        </CardHeader>
      </Card>
      <Card variant="inverse">
        <CardHeader>
          <CardTitle>Best fit</CardTitle>
          <CardDescription>Parcel 042-117-09 meets 9 of 9 requirements.</CardDescription>
        </CardHeader>
      </Card>
    </div>
  );
}

export function Small() {
  return (
    <Card size="sm" className="w-full max-w-72">
      <CardHeader>
        <CardTitle>Last surveyed</CardTitle>
        <CardDescription>Oct 28, 2026, 4:12 PM</CardDescription>
      </CardHeader>
    </Card>
  );
}

```

## Source

components/ui/card.tsx

```tsx
import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

// Mireye's card: the cut frame of the message panel (Figma "UI · Agent chat", 443:433), a 1px Stone line around white
// with the 8px chamfer at the top-left, 16px in (Figma's 24 to 28px at 0.6). No radius and no shadow.
// - `default` (also `outline`, `raised`, `elevated`): the white cut frame. A card does not lift; a raised card is
//   the same line.
// - `muted` (also `filled`): Fog with no line, for a group of values inside a white panel.
// - `inverse`: Forest with white ink, for the one card that leads (a verdict, a selected site).
// The title is 16px regular, the description 13px in Forest at 72%. Size sm tightens the insides to 12px. Nothing
// moves. The shape is drawn on ::before and ::after (ds-cut-frame), so the card's own background stays transparent.
const cardVariants = cva(
  "group/card flex flex-col gap-4 py-4 font-sans text-body leading-body text-fg data-[size=sm]:gap-3 data-[size=sm]:py-3",
  {
    variants: {
      variant: {
        default: "ds-cut-frame [--ds-shape-fill:var(--ds-color-bg-default)] [--ds-shape-stroke:var(--ds-color-border-default)]",
        outline: "ds-cut-frame [--ds-shape-fill:var(--ds-color-bg-default)] [--ds-shape-stroke:var(--ds-color-border-default)]",
        raised: "ds-cut-frame [--ds-shape-fill:var(--ds-color-bg-default)] [--ds-shape-stroke:var(--ds-color-border-default)]",
        elevated: "ds-cut-frame [--ds-shape-fill:var(--ds-color-bg-default)] [--ds-shape-stroke:var(--ds-color-border-default)]",
        muted: "ds-cut [--ds-shape-fill:var(--ds-color-bg-subtle)]",
        filled: "ds-cut [--ds-shape-fill:var(--ds-color-bg-subtle)]",
        inverse: "ds-cut text-fg-inverse [--ds-shape-fill:var(--ds-color-bg-inverse)]",
      },
    },
    defaultVariants: { variant: "default" },
  },
);

function Card({ className, variant, size = "default", ...props }: React.ComponentProps<"div"> & VariantProps<typeof cardVariants> & { size?: "default" | "sm" }) {
  return <div data-slot="card" data-variant={variant ?? "default"} data-size={size} className={cn(cardVariants({ variant }), className)} {...props} />;
}

function CardHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-header"
      className={cn("grid auto-rows-min items-start gap-x-3 gap-y-1 px-4 group-data-[size=sm]/card:px-3 has-data-[slot=card-action]:grid-cols-[minmax(0,1fr)_auto]", className)}
      {...props}
    />
  );
}

function CardTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-title"
      className={cn("flex min-w-0 items-center gap-2 text-h3 leading-heading font-normal group-data-[size=sm]/card:text-body-lg [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4", className)}
      {...props}
    />
  );
}

function CardDescription({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="card-description" className={cn("text-body leading-body text-fg-muted group-data-[variant=inverse]/card:text-fg-inverse-muted", className)} {...props} />;
}

function CardAction({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="card-action" className={cn("col-start-2 row-span-2 row-start-1 flex self-start justify-self-end", className)} {...props} />;
}

function CardContent({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="card-content" className={cn("px-4 group-data-[size=sm]/card:px-3", className)} {...props} />;
}

/** The card's last row: actions at the end. */
function CardFooter({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="card-footer" className={cn("flex items-center gap-2 px-4 group-data-[size=sm]/card:px-3", className)} {...props} />;
}

export { Card, CardAction, CardContent, CardDescription, CardFooter, CardHeader, CardTitle, cardVariants };

```
