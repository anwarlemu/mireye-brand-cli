import * as React from "react";

import { Dial, DIALS } from "@/components/ui/dial";

// Mireye's spinner is the Dial (Figma: the icon button's loading state, 442:76, and the Loaders board, 443:2): ticks
// around a circle, the head tick in Forest and the tail fading to Mist, turning one tick per step. Sizes: default is the
// 24px Figma dial (about 14px, beside 13px text), lg the 36px one (about 22px), xl the 140px hero (84px). A width or height class still
// wins. Under reduced motion it holds still with its tail drawn, so it still reads as a dial.
const SIZES = { default: 24, lg: 36, xl: 140 } as const satisfies Record<string, keyof typeof DIALS>;

function Spinner({ size = "default", "aria-label": label = "Loading", ...props }: Omit<React.ComponentProps<typeof Dial>, "size"> & { size?: keyof typeof SIZES }) {
  return <Dial size={SIZES[size]} aria-label={label} data-slot="spinner" {...props} />;
}

export { Spinner };
