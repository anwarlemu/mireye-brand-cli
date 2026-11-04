"use client";

import * as React from "react";
import { AspectRatio as AspectRatioPrimitive } from "radix-ui";

// Holds media at a fixed shape (an aerial of a parcel, a map tile, a site photo). The frame takes no style of its own;
// media in Mireye is square-cornered, dimmed with ds-imagery when marks sit on it, and framed by a 1px line if needed.
function AspectRatio(props: React.ComponentProps<typeof AspectRatioPrimitive.Root>) {
  return <AspectRatioPrimitive.Root data-slot="aspect-ratio" {...props} />;
}

export { AspectRatio };
