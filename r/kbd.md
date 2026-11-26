# Kbd
A key: a square 20px cap with a 1px Stone line on Bone and the key in 12px DM Mono in 80% Forest. On Forest (a tooltip) its line turns Haze and its text Bone.

Install: npx mireye-ds add kbd
Requires: theme, utils
Packages: none
Exports: Kbd, KbdGroup
Client boundary: not required by this entry file
Reference: Not in Figma; drawn in the brand's data face


## Usage
Use to show a keyboard shortcut beside an action or in a tooltip, and inside a field for a search key. Group keys with KbdGroup.
- Avoid: A pressable key
- Avoid: Rounded or shadowed caps
- Avoid: Sans keys


## Examples
Example components: npx mireye-ds add kbd
[Preview](https://mireye-ds.agencidev.com/preview/kbd/Preview)

examples/kbd.tsx

```tsx
import { Kbd, KbdGroup } from "@/components/ui/kbd";

export function Preview() {
  return (
    <div className="grid gap-3 text-body text-fg-secondary">
      <p className="m-0 flex items-center gap-2">
        Search sites
        <KbdGroup>
          <Kbd>⌘</Kbd>
          <Kbd>K</Kbd>
        </KbdGroup>
      </p>
      <p className="m-0 flex items-center gap-2">
        Next parcel <Kbd>J</Kbd> Previous parcel <Kbd>K</Kbd>
      </p>
    </div>
  );
}

```

## Source

components/ui/kbd.tsx

```tsx
import * as React from "react";

import { cn } from "@/lib/utils";

// A key, as Mireye writes data: a square 20px cap with no cut (small things are square), a 1px Stone line on white and
// the key in 12px DM Mono in 80% Forest; glyphs inside are 12px. In a tooltip (on Forest) the line turns Haze and the
// text white. Keys are labels, never pressable.
function Kbd({ className, ...props }: React.ComponentProps<"kbd">) {
  return (
    <kbd
      data-slot="kbd"
      className={cn(
        "pointer-events-none inline-flex h-5 w-fit min-w-5 items-center justify-center gap-1 border border-line bg-surface px-1 font-mono text-caption leading-none font-normal text-fg-secondary select-none",
        "in-data-[slot=tooltip-content]:border-fg-inverse-muted in-data-[slot=tooltip-content]:bg-transparent in-data-[slot=tooltip-content]:text-fg-inverse [&_svg:not([class*='size-'])]:size-3",
        className,
      )}
      {...props}
    />
  );
}

function KbdGroup({ className, ...props }: React.ComponentProps<"kbd">) {
  return <kbd data-slot="kbd-group" className={cn("inline-flex items-center gap-1", className)} {...props} />;
}

export { Kbd, KbdGroup };

```
