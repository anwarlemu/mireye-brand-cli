# Aspect Ratio
A frame that holds an aerial, a map tile or a site photo at a fixed shape, square-cornered.

Install: npx mireye-ds add aspect-ratio
Requires: theme
Packages: radix-ui
Exports: AspectRatio
Client boundary: yes
Reference: Brand principles: real photos only as accents, where a place needs to be shown; ds-imagery from brand/utilities.css


## Usage
Wrap an aerial or photo in AspectRatio with ratio={16 / 9} (or 4 / 3, 1) so it keeps its shape at every width, and clip it with overflow-hidden. Dim it with ds-imagery when marks or a parcel outline sit on top, so the marks read first.
- Avoid: Rounded media
- Avoid: Stretching an image without object-cover
- Avoid: Stock photos where a place is not shown
- Avoid: Shadows under media


## Examples
Example components: npx mireye-ds add aspect-ratio
[Preview](https://mireye-ds.agencidev.com/preview/aspect-ratio/Preview) | [Square](https://mireye-ds.agencidev.com/preview/aspect-ratio/Square)

examples/aspect-ratio.tsx

```tsx
import { AspectRatio } from "@/components/ui/aspect-ratio";

export function Preview() {
  return (
    <figure className="m-0 grid w-full max-w-120 gap-2">
      <AspectRatio ratio={16 / 9} className="overflow-hidden bg-subtle">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/examples/farmland-aerial.jpg" alt="Aerial of farmland around the parcel" className="size-full object-cover" />
      </AspectRatio>
      <figcaption className="flex justify-between text-caption text-fg-muted">
        Ellis County site 14
        <span className="font-mono">32.4113, -96.8302</span>
      </figcaption>
    </figure>
  );
}

export function Square() {
  return (
    <div className="w-40">
      <AspectRatio ratio={1} className="relative overflow-hidden bg-subtle">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/examples/map-aerial.jpg" alt="" className="ds-imagery size-full object-cover" />
        <span aria-hidden className="absolute inset-[28%] border border-bone" />
      </AspectRatio>
    </div>
  );
}

```

## Source

components/ui/aspect-ratio.tsx

```tsx
"use client";

import * as React from "react";
import { AspectRatio as AspectRatioPrimitive } from "radix-ui";

// Holds media at a fixed shape (an aerial of a parcel, a map tile, a site photo). The frame takes no style of its own;
// media in Mireye is square-cornered, dimmed with ds-imagery when marks sit on it, and framed by a 1px line if needed.
function AspectRatio(props: React.ComponentProps<typeof AspectRatioPrimitive.Root>) {
  return <AspectRatioPrimitive.Root data-slot="aspect-ratio" {...props} />;
}

export { AspectRatio };

```
