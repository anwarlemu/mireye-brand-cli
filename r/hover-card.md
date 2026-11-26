# Hover Card
The popover's panel (Bone, 6px cut corner, 1px Stone line, no shadow) shown after a 400ms dwell on a link, with a short preview of what it points to.

Install: npx mireye-ds add hover-card
Requires: theme, surface, utils
Packages: radix-ui
Exports: HoverCard, HoverCardContent, HoverCardTrigger
Client boundary: yes
Reference: Not in Figma. Drawn in Mireye's grammar: the popover's panel


## Usage
Use to preview a linked thing in running text (a substation's voltage, owner and distance) without leaving the page. The link still works on click.
- Avoid: The only place a fact appears
- Avoid: Actions or fields inside the card
- Avoid: Rounded corners or a shadow
- Avoid: Opening without a dwell


## Examples
Example components: npx mireye-ds add hover-card
Example packages: @phosphor-icons/react
[Preview](https://mireye-ds.agencidev.com/preview/hover-card/Preview) | [Open](https://mireye-ds.agencidev.com/preview/hover-card/Open)

examples/hover-card.tsx

```tsx
import { LightningIcon, MapPinIcon } from "@phosphor-icons/react/ssr";

import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";

function SubstationCard() {
  return (
    <div className="grid gap-3">
      <div className="grid gap-1">
        <p className="text-body font-medium text-fg">Ault substation</p>
        <p className="text-body text-fg-secondary">230 kV, owned by Acme Transmission. About 40 MW of spare capacity in the last study.</p>
      </div>
      <div className="grid gap-1.5 border-t border-line-subtle pt-3">
        <p className="flex items-center gap-2 text-body text-fg">
          <LightningIcon className="size-4 text-fg-secondary" /> 2.1 mi from Site 14
        </p>
        <p className="flex items-center gap-2 font-mono text-caption text-fg-secondary">
          <MapPinIcon className="size-4" /> 40.5853, −104.7322
        </p>
      </div>
    </div>
  );
}

const LINK = "text-fg underline decoration-line underline-offset-4 transition-[text-decoration-color] duration-150 ease-out hover:decoration-line-strong";

export function Preview() {
  return (
    <p className="max-w-96 text-body text-fg">
      Site 14 ties in at the{" "}
      <HoverCard>
        <HoverCardTrigger href="#ault" className={LINK}>
          Ault substation
        </HoverCardTrigger>
        <HoverCardContent>
          <SubstationCard />
        </HoverCardContent>
      </HoverCard>{" "}
      along an existing county road.
    </p>
  );
}

export function Open() {
  return (
    <div className="flex min-h-60 items-start justify-center">
      <HoverCard defaultOpen>
        <HoverCardTrigger href="#ault" className={LINK}>
          Ault substation
        </HoverCardTrigger>
        <HoverCardContent>
          <SubstationCard />
        </HoverCardContent>
      </HoverCard>
    </div>
  );
}

```

## Source

components/ui/hover-card.tsx

```tsx
"use client";

import * as React from "react";
import { HoverCard as HoverCardPrimitive } from "radix-ui";

import { usePortalContainer } from "@/lib/surface";
import { cn } from "@/lib/utils";

// A preview on hover, drawn as the popover (Figma has none): a white panel with the 6px cut corner and a 1px Stone
// line, no shadow, 8px from its trigger, 16px of padding, 13px Forest text. It waits before opening (so a passing
// pointer does not trigger it), then grows out of its trigger from 98 percent with a fade (150ms in, 120ms out). The
// dwell prevents accidental previews; it never delays the link action.
function HoverCard({ openDelay = 400, closeDelay = 150, ...props }: React.ComponentProps<typeof HoverCardPrimitive.Root>) {
  return <HoverCardPrimitive.Root data-slot="hover-card" openDelay={openDelay} closeDelay={closeDelay} {...props} />;
}

function HoverCardTrigger(props: React.ComponentProps<typeof HoverCardPrimitive.Trigger>) {
  return <HoverCardPrimitive.Trigger data-slot="hover-card-trigger" {...props} />;
}

function HoverCardContent({ className, align = "center", sideOffset = 8, ...props }: React.ComponentProps<typeof HoverCardPrimitive.Content>) {
  const container = usePortalContainer();
  return (
    <HoverCardPrimitive.Portal container={container} data-slot="hover-card-portal">
      <HoverCardPrimitive.Content
        data-slot="hover-card-content"
        align={align}
        sideOffset={sideOffset}
        className={cn(
          "ds-cut-frame z-50 w-72 max-w-[calc(100vw-2rem)] origin-(--radix-hover-card-content-transform-origin) p-4 text-body leading-body text-fg outline-none [--ds-cut:var(--ds-cut-md)] [--ds-shape-fill:var(--ds-color-bg-default)] [--ds-shape-stroke:var(--ds-color-border-default)] data-[state=closed]:animate-pop-out data-[state=open]:animate-pop-in",
          className,
        )}
        {...props}
      />
    </HoverCardPrimitive.Portal>
  );
}

export { HoverCard, HoverCardContent, HoverCardTrigger };

```
