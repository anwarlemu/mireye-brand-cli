# Native select
The browser's own select dressed as Mireye's: the field's frame (36px, the cut) with the value 16px in and the brand arrow's head turned down at the right.

Install: npx mireye-ds add native-select
Requires: theme, icons, input, utils
Packages: none
Exports: NativeSelect, NativeSelectOptGroup, NativeSelectOption
Client boundary: yes
Reference: Drawn from Figma "UI · Inputs" (442:107)


## Usage
Use where the platform picker is better: phones, very long lists, forms without script. Otherwise use Select.
- Avoid: A native select for a choice that needs search
- Avoid: A custom chevron other than the brand arrow


## Examples
Example components: npx mireye-ds add native-select label
[Preview](https://mireye-ds.agencidev.com/preview/native-select/Preview) | [States](https://mireye-ds.agencidev.com/preview/native-select/States)

examples/native-select.tsx

```tsx
import { Label } from "@/components/ui/label";
import { NativeSelect, NativeSelectOptGroup, NativeSelectOption } from "@/components/ui/native-select";

export function Preview() {
  return (
    <div className="grid gap-2">
      <Label htmlFor="ns-state">State</Label>
      <NativeSelect id="ns-state" defaultValue="or" className="w-60">
        <NativeSelectOptGroup label="West">
          <NativeSelectOption value="or">Oregon</NativeSelectOption>
          <NativeSelectOption value="wa">Washington</NativeSelectOption>
        </NativeSelectOptGroup>
        <NativeSelectOptGroup label="South">
          <NativeSelectOption value="tx">Texas</NativeSelectOption>
          <NativeSelectOption value="ga">Georgia</NativeSelectOption>
        </NativeSelectOptGroup>
      </NativeSelect>
    </div>
  );
}

export function States() {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <NativeSelect size="sm" aria-label="Sort parcels" defaultValue="fit" className="w-48">
        <NativeSelectOption value="fit">Best fit</NativeSelectOption>
        <NativeSelectOption value="size">Largest first</NativeSelectOption>
      </NativeSelect>
      <NativeSelect aria-label="Locked state" disabled className="w-48">
        <NativeSelectOption>Oregon</NativeSelectOption>
      </NativeSelect>
      <NativeSelect aria-label="Zoning" aria-invalid className="w-48">
        <NativeSelectOption value="">Choose a zoning</NativeSelectOption>
        <NativeSelectOption value="i2">I-2 Industrial</NativeSelectOption>
      </NativeSelect>
    </div>
  );
}

```

## Source

components/ui/native-select.tsx

```tsx
"use client";

import * as React from "react";

import { ArrowRightIcon } from "@/components/icons/arrow-right";
import { inputClassName } from "@/components/ui/input";
import { cn } from "@/lib/utils";

// The browser's own select dressed as Mireye's select: Input's frame (white, 1px Stone line, the 8px cut, 36px;
// `size="sm"` 32px) with the value in 13px Forest 16px in and the brand arrow's head turned down 16px from the right.
// Focus turns the line Forest; invalid turns it brick; disabled sits on Mist with Slate text. Use it where the
// platform picker is better (phones, long lists, forms without script).
type NativeSelectProps = Omit<React.ComponentProps<"select">, "size"> & { size?: "sm" | "default" };

function NativeSelect({ className, size = "default", ...props }: NativeSelectProps) {
  return (
    <div data-slot="native-select-wrapper" data-size={size} className={cn("group/native-select relative w-fit", className)}>
      <select
        data-slot="native-select"
        data-size={size}
        className={cn(inputClassName, "cursor-pointer appearance-none py-0 pr-10 data-[size=sm]:h-8 data-[size=sm]:pl-3")}
        {...props}
      />
      <ArrowRightIcon
        size={16}
        head
        data-slot="native-select-icon"
        className="pointer-events-none absolute top-1/2 right-4 -translate-y-1/2 rotate-90 text-fg group-data-[size=sm]/native-select:right-3 group-has-[select:disabled]/native-select:text-fg-subtle"
      />
    </div>
  );
}

function NativeSelectOption({ className, ...props }: React.ComponentProps<"option">) {
  return <option data-slot="native-select-option" className={cn("bg-surface text-fg", className)} {...props} />;
}

function NativeSelectOptGroup({ className, ...props }: React.ComponentProps<"optgroup">) {
  return <optgroup data-slot="native-select-optgroup" className={cn("bg-surface text-fg", className)} {...props} />;
}

export { NativeSelect, NativeSelectOptGroup, NativeSelectOption };

```
