# Icons
Mireye's own glyphs from Figma: the arrow (and its head alone), the check, the plus and the parcel.

Install: npx mireye-ds add icons
Requires: theme, utils
Packages: none
Exports: ArrowRightIcon, CheckIcon, ParcelIcon, PlusIcon
Client boundary: not required by this entry file
Reference: Figma UI boards: buttons 442:3, checkbox 442:161, search field 442:141


## Usage
Use these where Figma draws them: ArrowRightIcon after a key's label (its `head` turned 90 degrees is the select chevron), CheckIcon in the checkbox, PlusIcon for add (turned 45 degrees it closes), ParcelIcon before coordinates. For everything else use Phosphor at regular weight. Sizes are Figma's; they render at the product scale.
- Avoid: Moving an icon on hover
- Avoid: Mixing these with a filled Phosphor weight
- Avoid: A chevron icon where the arrow head serves


## Examples
Example components: npx mireye-ds add icons
[Preview](https://mireye-ds.agencidev.com/preview/icons/Preview) | [InText](https://mireye-ds.agencidev.com/preview/icons/InText)

examples/icons.tsx

```tsx
import { ArrowRightIcon } from "@/components/icons/arrow-right";
import { CheckIcon } from "@/components/icons/check";
import { ParcelIcon } from "@/components/icons/parcel-icon";
import { PlusIcon } from "@/components/icons/plus";

// Mireye's own glyphs, drawn from Figma: the button arrow and its head alone (the select's chevron), the check, the
// plus (turned 45 degrees it closes things) and the parcel. They take the text color.
export function Preview() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-6 text-fg">
      <ArrowRightIcon />
      <ArrowRightIcon head className="rotate-90" />
      <CheckIcon />
      <PlusIcon />
      <PlusIcon className="rotate-45" />
      <ParcelIcon />
    </div>
  );
}

// In use: the parcel before a coordinate, the arrow after a label.
export function InText() {
  return (
    <div className="mx-auto flex w-fit flex-col gap-3 text-body text-fg">
      <span className="flex items-center gap-2">
        <ParcelIcon size={14} />
        <span className="ds-trim tabular-nums">32.1745, -96.8921</span>
      </span>
      <span className="flex items-center gap-3">
        <span className="ds-trim font-medium">Open the parcel record</span>
        <ArrowRightIcon size={16} />
      </span>
    </div>
  );
}

```

## Source

components/icons/arrow-right.tsx

```tsx
import * as React from "react";
import { cn, svgBox, svgSize } from "@/lib/utils";

/** Arrow from the Figma buttons: 1.5px stroke, square caps. 20px on every UI board; the 16px
 * version comes from the identity boards (3.3).
 * `head` draws the arrowhead alone, centered in the box: turned 90° it is the chevron of the
 * UnitSelect, so the system keeps one arrow shape instead of adding a chevron icon. */
export function ArrowRightIcon({
  size = 20,
  head = false,
  className,
  style,
  ...props
}: React.SVGProps<SVGSVGElement> & { size?: 16 | 20; head?: boolean }) {
  const d =
    size === 16
      ? head
        ? "M4.75 14.5L11.25 8L4.75 1.5"
        : "M0 8H15M8.5 14.5L15 8L8.5 1.5"
      : head
        ? "M5.75 18.5L14.25 10L5.75 1.5"
        : "M0 10H19M10.5 18.5L19 10L10.5 1.5";
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} fill="none" aria-hidden data-slot="icon" className={cn(svgBox, className)} style={svgSize(size, size, style)} {...props}>
      <path d={d} stroke="currentColor" strokeWidth={1.5} />
    </svg>
  );
}

```

components/icons/check.tsx

```tsx
import * as React from "react";
import { cn, svgBox, svgSize } from "@/lib/utils";

/** Check from the Figma checkbox (442:161): 16×12 box, 1.75px stroke, path M1 6 L6 11 L15 1. */
export function CheckIcon({ className, style, ...props }: React.SVGProps<SVGSVGElement>) {
  // Scales with the spacing scale; a width/height prop sets its Figma-scale size.
  const w = Number(props.width ?? 16);
  const h = Number(props.height ?? 12);
  return (
    <svg width={16} height={12} viewBox="0 0 16 12" fill="none" aria-hidden data-slot="icon" className={cn(svgBox, className)} style={svgSize(w, h, style)} {...props}>
      <path d="M1 6L6 11L15 1" stroke="currentColor" strokeWidth={1.75} />
    </svg>
  );
}

```

components/icons/parcel-icon.tsx

```tsx
import * as React from "react";
import { cn, svgBox, svgSize } from "@/lib/utils";

/**
 * Parcel icon: a 1px square with a solid diamond inside. Figma "Parcel icon" (16px in the
 * search field 442:141; 14px and 12px versions exist on other boards).
 * Every size uses the same geometry: the square's stroke is inset 0.5px (Figma's centered 1px
 * stroke), and the diamond spans the middle half, e.g. 16px is M8 4 L12 8 L8 12 L4 8 Z.
 */
export function ParcelIcon({ size = 16, className, style, ...props }: React.SVGProps<SVGSVGElement> & { size?: number }) {
  const m = size / 2;
  const q = size / 4;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} fill="none" aria-hidden data-slot="icon" className={cn(svgBox, className)} style={svgSize(size, size, style)} {...props}>
      <path d={`M0.5 0.5H${size - 0.5}V${size - 0.5}H0.5V0.5Z`} stroke="currentColor" vectorEffect="non-scaling-stroke" />
      <path d={`M${m} ${q}L${3 * q} ${m}L${m} ${3 * q}L${q} ${m}Z`} fill="currentColor" />
    </svg>
  );
}

```

components/icons/plus.tsx

```tsx
import * as React from "react";
import { cn, svgBox, svgSize } from "@/lib/utils";

/** Plus from the Figma icon button: 18px cross in a 20px box, 1.5px stroke. */
export function PlusIcon({ size = 20, className, style, ...props }: React.SVGProps<SVGSVGElement> & { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none" aria-hidden data-slot="icon" className={cn(svgBox, className)} style={svgSize(size, size, style)} {...props}>
      <path d="M10 1V10M10 10V19M10 10H1M10 10H19" stroke="currentColor" strokeWidth={1.5} />
    </svg>
  );
}

```
