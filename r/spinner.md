# Spinner
The Dial: ticks around a circle, the head in Forest and the tail fading to Mist, turning one tick per step.

Install: npx mireye-ds add spinner
Requires: theme, dial
Packages: none
Exports: Spinner
Client boundary: not required by this entry file
Reference: Figma UI · Buttons (442:3): icon button Loading (442:76); UI · Loaders (443:2): the 36px frames 443:103 to 443:207 and the hero 443:77


## Usage
Use inside what is working, beside a word that says what is happening (Matching the parcel), or on an icon key that is loading. Default is about 14px for text and keys; lg (22px) sits beside a panel title; xl (84px) is the one loader on an empty screen. For a known amount, use Progress; in a labelled button, prefer its tick walk.
- Avoid: A smooth spinning circle
- Avoid: A coloured spinner
- Avoid: A spinner with no words beside it
- Avoid: Two spinners on one screen
- Avoid: A full-page spinner for a short wait


## Examples
Example components: npx mireye-ds add spinner button
[Preview](https://mireye-ds.agencidev.com/preview/spinner/Preview) | [Sizes](https://mireye-ds.agencidev.com/preview/spinner/Sizes) | [InButton](https://mireye-ds.agencidev.com/preview/spinner/InButton)

examples/spinner.tsx

```tsx
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";

export function Preview() {
  return (
    <div className="flex items-center gap-3 text-body text-fg-secondary">
      <Spinner />
      Matching the parcel
    </div>
  );
}

export function Sizes() {
  return (
    <div className="flex items-center gap-6">
      <Spinner />
      <Spinner size="lg" />
      <Spinner size="xl" />
    </div>
  );
}

export function InButton() {
  return (
    <Button variant="outline" disabled>
      <Spinner aria-hidden />
      Sampling elevation
    </Button>
  );
}

```

## Source

components/ui/spinner.tsx

```tsx
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

```
