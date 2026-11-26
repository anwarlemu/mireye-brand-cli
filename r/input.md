# Input
Mireye's field: 36px, Bone inside a 1px Stone line with the 8px cut corner, 13px Forest text and a Slate placeholder 16px in. Focus turns the line Forest (no ring); invalid turns it brick; read-only is Fog, disabled Mist. `unit` puts a unit after the value (ac, kV) or a Unit Select.

Install: npx mireye-ds add input
Requires: theme, utils
Packages: @chakra-ui/react
Exports: Input, inputClassName, fieldFrameClassName
Client boundary: yes
Reference: Figma "UI · Inputs" (442:107): Default, Focused, Filled and Search rows


## Usage
Use for one line of text or a number: a site name, a parcel number, a size. Put a Label 8px above it (or use Field). Pass `unit` when the value has one, and a Unit Select when the reader can change it. Set aria-invalid when the value is rejected and say why below it. For search, use Input Group with the parcel glyph.
- Avoid: A placeholder as the only label
- Avoid: Rounded corners or a shadow
- Avoid: A focus ring around the field (the line turns Forest instead)
- Avoid: A hover effect on the field
- Avoid: A unit typed into the value


## Examples
Example components: npx mireye-ds add input label
[Preview](https://mireye-ds.agencidev.com/preview/input/Preview) | [States](https://mireye-ds.agencidev.com/preview/input/States)

examples/input.tsx

```tsx
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function Preview() {
  return (
    <div className="grid w-full max-w-96 gap-2">
      <Label htmlFor="parcel-size">Parcel size</Label>
      <Input id="parcel-size" placeholder="e.g. 40" inputMode="decimal" unit="ac" />
    </div>
  );
}

export function States() {
  return (
    <div className="grid w-full max-w-96 gap-4">
      <Input aria-label="Site name" placeholder="Site name" />
      <Input aria-label="Parcel ID" defaultValue="041-220-17" />
      <Input aria-label="Voltage" defaultValue="345" unit="kV" />
      <Input aria-label="County" defaultValue="Marion County" readOnly />
      <Input aria-label="Distance to substation" placeholder="Distance" disabled />
      <Input aria-label="Acreage" defaultValue="-4" aria-invalid />
    </div>
  );
}

```

## Source

components/ui/input.tsx

```tsx
"use client";

import * as React from "react";
import { Input as ChakraInput } from "@chakra-ui/react";

import { cn } from "@/lib/utils";

// Mireye's field (Figma "UI · Inputs", 442:107) at the product scale: 36px tall (Figma's 72px), white inside a 1px
// Stone line with the 8px cut corner, 13px Forest text and a Slate placeholder 16px in. Focus turns the line Forest,
// at once, and draws no ring: the line is the focus. aria-invalid turns it brick. Read-only sits on Fog and disabled
// on Mist, both with Slate text. Nothing changes on hover.
// An <input> has no ::before or ::after, so the cut is drawn on the input itself: clip-path cuts the corner and a
// 135° gradient paints the 1px diagonal on the same line ds-cut-frame uses (the stroke's outer edge at x + y = cut −
// 0.2071px, its inner edge at cut + 1.2071px), so the field matches a framed key or card exactly.
// `unit` puts a unit after the value, as in Figma ("ac"): the field becomes a frame around a borderless input and the
// unit, and a click anywhere in it focuses the input. Pass a UnitSelect as `unit` to let the reader change it.
const FRAME_VARS =
  "[--ds-shape-stroke:var(--ds-color-border-default)] [--ds-shape-fill:var(--ds-color-bg-default)] aria-invalid:[--ds-shape-stroke:var(--ds-color-status-danger)]";
const FIELD = cn(
  "h-9 w-full min-w-0 border border-(--ds-shape-stroke) px-4 font-sans text-body leading-tight text-fg caret-fg outline-none",
  FRAME_VARS,
  "[clip-path:polygon(calc(var(--ds-cut)_-_0.2071px)_0,100%_0,100%_100%,0_100%,0_calc(var(--ds-cut)_-_0.2071px))]",
  "[background:linear-gradient(135deg,transparent_calc((var(--ds-cut)_-_0.2071px)_*_0.7071),var(--ds-shape-stroke)_0_calc((var(--ds-cut)_+_1.2071px)_*_0.7071),var(--ds-shape-fill)_0)_border-box]",
  "placeholder:text-fg-subtle selection:bg-subtle-hover",
  "focus:[--ds-shape-stroke:var(--ds-color-border-strong)] aria-invalid:focus:[--ds-shape-stroke:var(--ds-color-status-danger)]",
  "[&:is(input,textarea):read-only:not(:disabled)]:[--ds-shape-fill:var(--ds-color-bg-subtle)] [&:is(input,textarea):read-only]:text-fg-subtle disabled:cursor-not-allowed disabled:[--ds-shape-fill:var(--ds-color-bg-subtle-hover)] disabled:text-fg-subtle",
  "file:mr-3 file:h-full file:border-0 file:bg-transparent file:font-sans file:text-body file:font-medium file:text-fg",
);

/** The same frame for an element that can draw on ::before and ::after (a group, a trigger): ds-cut-frame. */
const FRAME = cn(
  "ds-cut-frame",
  FRAME_VARS,
  "has-[input:focus,textarea:focus,[data-slot=input-group-control]:focus]:[--ds-shape-stroke:var(--ds-color-border-strong)]",
  "has-[[aria-invalid=true]]:[--ds-shape-stroke:var(--ds-color-status-danger)]",
  "has-[input:disabled,textarea:disabled]:cursor-not-allowed has-[input:disabled,textarea:disabled]:[--ds-shape-fill:var(--ds-color-bg-subtle-hover)] has-[[data-slot=input]:read-only:not(:disabled),[data-slot=input-group-control]:read-only:not(:disabled)]:[--ds-shape-fill:var(--ds-color-bg-subtle)]",
);

type InputProps = Omit<React.ComponentProps<"input">, "size"> & {
  size?: number;
  /** A unit after the value ("ac", "kV"), or a UnitSelect. `className` then styles the frame. */
  unit?: React.ReactNode;
};

function Input({ className, type = "text", size, unit, ...props }: InputProps) {
  if (unit == null) return <ChakraInput unstyled type={type} htmlSize={size} data-slot="input" className={cn(FIELD, className)} {...props} />;
  return (
    <div
      data-slot="input-frame"
      className={cn(FRAME, "flex h-9 w-full min-w-0 cursor-text items-center gap-3 px-4", className)}
      // A click on the padding or the unit focuses the input, except on a control of the unit's own (a UnitSelect).
      onMouseDown={(e) => {
        const input = e.currentTarget.querySelector("input");
        if (input && e.target !== input && !(e.target as Element).closest("button, [role=listbox]")) {
          e.preventDefault();
          input.focus();
        }
      }}
    >
      <ChakraInput
        unstyled
        type={type}
        htmlSize={size}
        data-slot="input"
        className="h-full w-full min-w-0 flex-1 bg-transparent p-0 pl-px font-sans text-body leading-tight text-fg caret-fg outline-none placeholder:text-fg-subtle selection:bg-subtle-hover read-only:text-fg-subtle disabled:cursor-not-allowed disabled:text-fg-subtle"
        {...props}
      />
      <span data-slot="input-unit" className="shrink-0 font-sans text-body leading-tight text-fg">
        {unit}
      </span>
    </div>
  );
}

export { Input, FIELD as inputClassName, FRAME as fieldFrameClassName };

```
