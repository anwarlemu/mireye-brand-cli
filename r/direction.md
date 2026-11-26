# Direction
Sets left-to-right or right-to-left for every component inside it.

Install: npx mireye-ds add direction
Requires: theme
Packages: radix-ui
Exports: DirectionProvider, useDirection
Client boundary: yes
Reference: Radix Direction; no visual of its own


## Usage
Wrap an app or a section in DirectionProvider dir="rtl" when its language reads right to left, and set dir on the element too. Menus, sliders, tabs and carousels then flip their keyboard and layout direction.
- Avoid: Mixing directions inside one menu or form
- Avoid: Mirroring logos or code


## Examples
Example components: npx mireye-ds add direction tabs
[Preview](https://mireye-ds.agencidev.com/preview/direction/Preview)

examples/direction.tsx

```tsx
import { DirectionProvider } from "@/components/ui/direction";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function Preview() {
  return (
    <DirectionProvider dir="rtl">
      <div dir="rtl" className="grid gap-3">
        <p className="text-body text-fg">الموقع ١٤</p>
        <Tabs defaultValue="parcel">
          <TabsList>
            <TabsTrigger value="parcel">القطعة</TabsTrigger>
            <TabsTrigger value="power">الكهرباء</TabsTrigger>
            <TabsTrigger value="water">المياه</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
    </DirectionProvider>
  );
}

```

## Source

components/ui/direction.tsx

```tsx
"use client";

import * as React from "react";
import { Direction } from "radix-ui";

// Sets the reading direction (ltr or rtl) for every Radix-based component inside it, so menus, sliders and tabs flip
// for right-to-left text. It renders nothing of its own; set dir on the element you wrap too.
function DirectionProvider({ dir, direction, children }: React.ComponentProps<typeof Direction.DirectionProvider> & { direction?: React.ComponentProps<typeof Direction.DirectionProvider>["dir"] }) {
  return <Direction.DirectionProvider dir={direction ?? dir}>{children}</Direction.DirectionProvider>;
}

const useDirection = Direction.useDirection;

export { DirectionProvider, useDirection };

```
