# Mireye mark
The Mireye logomark, two cut blocks, in the color of the text around it.

Install: npx mireye-ds add mireye-mark
Requires: theme, utils
Packages: none
Exports: MireyeMark
Client boundary: not required by this entry file
Reference: Figma "Mireye mark" (27.17 by 20 on the UI boards)


## Usage
Use in a header or beside "Ask Mireye". It takes the text color: ink on light grounds, `text-fg-inverse` on Forest. Size it with a width and `h-auto`.
- Avoid: Recoloring it with a palette color
- Avoid: Stretching it out of proportion
- Avoid: Placing it on imagery without a solid ground


## Examples
Example components: npx mireye-ds add mireye-mark
[Preview](https://mireye-ds.agencidev.com/preview/mireye-mark/Preview) | [Lockup](https://mireye-ds.agencidev.com/preview/mireye-mark/Lockup)

examples/mireye-mark.tsx

```tsx
import { MireyeMark } from "@/components/ui/mireye-mark";

// The logomark takes the text color, so it follows its ground.
export function Preview() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-6">
      <MireyeMark className="h-auto w-12" />
      <span className="flex size-24 items-center justify-center bg-inverse">
        <MireyeMark className="h-auto w-12 text-fg-inverse" />
      </span>
      <span data-brand="enterprise" className="flex size-24 items-center justify-center bg-page">
        <MireyeMark className="h-auto w-12" />
      </span>
    </div>
  );
}

// Beside a product name, as in a panel header.
export function Lockup() {
  return (
    <span className="mx-auto flex w-fit items-center gap-2 text-fg">
      <MireyeMark className="h-auto w-4" />
      <span className="ds-trim text-body">Ask Mireye</span>
    </span>
  );
}

```

## Source

components/ui/mireye-mark.tsx

```tsx
import * as React from "react";
import { cn, svgBox, svgSize } from "@/lib/utils";

/**
 * The Mireye logomark: two cut blocks. Path copied from Figma ("Mireye mark", 27.17×20 on the
 * UI boards). It uses `text-fg`, so it follows the theme ink; pass a text color in className to change it.
 */
export function MireyeMark({ className, style, ...props }: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 27.1667 20"
      width="27.1667"
      height="20"
      fill="currentColor"
      aria-label="Mireye"
      role="img"
      data-slot="mark"
      className={cn("block shrink-0 text-fg", svgBox, className)}
      style={svgSize(27.1667, 20, style)}
      {...props}
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M8.84329 0C11.3929 0 13.9424 0 16.4921 0C16.4903 3.21956 16.4921 6.43914 16.4972 9.65868C17.6796 8.31596 18.8583 6.97033 20.0332 5.6217C22.3433 5.61668 24.6536 5.61498 26.9637 5.61668C26.9654 8.98668 26.9637 12.3567 26.9586 15.7267C25.766 17.0794 24.5773 18.4351 23.3922 19.7937C21.0821 19.7988 18.7719 19.8005 16.4617 19.7988C16.4634 16.4489 16.4617 13.0989 16.4567 9.74898C13.5245 13.1 10.5887 16.4483 7.64944 19.7937C5.09983 19.7988 2.55023 19.8005 0.000633646 19.7988C-0.00105569 16.5625 0.000633646 13.3263 0.00569231 10.09C2.95368 6.72789 5.89955 3.36461 8.84329 0Z"
      />
    </svg>
  );
}

```
