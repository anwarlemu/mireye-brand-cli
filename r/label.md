# Label
A field's label: 12px regular in 80% Forest, 8px above its field. Beside a checkbox, radio or switch it becomes the control's own 13px Forest label. A required mark inside it is brick.

Install: npx mireye-ds add label
Requires: theme, utils
Packages: @chakra-ui/react
Exports: Label
Client boundary: yes
Reference: Figma "UI · Inputs" (442:107): Parcel size, Location


## Usage
Use above every field, tied to it with htmlFor (or aria-labelledby for a Select or Combobox). Keep labels short nouns (Parcel size, Location). Beside a checkbox, radio or switch, prefer the control's own children as its label.
- Avoid: Bold or uppercase labels
- Avoid: A label after its field
- Avoid: A colon at the end


## Examples
Example components: npx mireye-ds add label checkbox input
[Preview](https://mireye-ds.agencidev.com/preview/label/Preview)

examples/label.tsx

```tsx
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function Preview() {
  return (
    <div className="grid w-full max-w-80 gap-6">
      <div className="grid gap-2">
        <Label htmlFor="location">
          Location <span data-slot="label-required" aria-hidden>*</span>
        </Label>
        <Input id="location" placeholder="Search any U.S. location" />
      </div>
      <div className="flex items-center gap-3">
        <Checkbox id="floodplain" defaultChecked />
        <Label htmlFor="floodplain">Exclude floodplain</Label>
      </div>
    </div>
  );
}

```

## Source

components/ui/label.tsx

```tsx
"use client";

import * as React from "react";
import { chakra } from "@chakra-ui/react";

import { cn } from "@/lib/utils";

// A field's label (Figma "UI · Inputs": Parcel size, Location): 12px regular in 80% Forest on a 16px line, 8px above its
// field. Beside a checkbox, radio or switch (a horizontal Field) it is the control's own label instead: 13px Forest.
// A required mark inside it (`<span aria-hidden>*</span>` with data-slot="label-required") is brick. A disabled field's
// label turns Slate with it.
function Label({ className, ...props }: React.ComponentProps<"label">) {
  return (
    <chakra.label
      data-slot="label"
      className={cn(
        "flex items-center gap-2 font-sans text-caption leading-line-caption font-normal text-fg-secondary select-none",
        "*:data-[slot=label-required]:-ms-1 *:data-[slot=label-required]:text-danger",
        "group-data-[orientation=horizontal]/field:text-body group-data-[orientation=horizontal]/field:leading-line-body group-data-[orientation=horizontal]/field:text-fg",
        "peer-data-[slot=checkbox]:text-body peer-data-[slot=checkbox]:text-fg peer-data-[slot=switch]:text-body peer-data-[slot=switch]:text-fg peer-data-[slot=radio-group-item]:text-body peer-data-[slot=radio-group-item]:text-fg",
        "group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:text-fg-subtle peer-disabled:cursor-not-allowed peer-disabled:text-fg-subtle",
        className,
      )}
      {...props}
    />
  );
}

export { Label };

```
