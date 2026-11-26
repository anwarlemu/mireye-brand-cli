# Textarea
The field for more than a line: the field's frame and states with 13px Forest text on 18px lines, 8px above and below. It grows with its content from 72px and is not resized by hand.

Install: npx mireye-ds add textarea
Requires: theme, input, utils
Packages: @chakra-ui/react
Exports: Textarea
Client boundary: yes
Reference: Drawn from Figma "UI · Inputs" (442:107)


## Usage
Use for notes and questions to the agent: site notes, criteria in words. Put a Label above it. For a box with a caption or actions inside, use Input Group with a textarea.
- Avoid: A resize handle
- Avoid: A fixed height that scrolls a short note
- Avoid: Rounded corners


## Examples
Example components: npx mireye-ds add textarea label
[Preview](https://mireye-ds.agencidev.com/preview/textarea/Preview) | [States](https://mireye-ds.agencidev.com/preview/textarea/States)

examples/textarea.tsx

```tsx
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export function Preview() {
  return (
    <div className="grid w-full max-w-96 gap-2">
      <Label htmlFor="site-notes">Site notes</Label>
      <Textarea id="site-notes" placeholder="What should the agent look for?" />
    </div>
  );
}

export function States() {
  return (
    <div className="grid w-full max-w-96 gap-4">
      <Textarea aria-label="Notes" defaultValue="Flat, cleared land within 2 miles of a 345 kV line. Avoid the floodplain along the river." />
      <Textarea aria-label="Locked notes" defaultValue="Criteria are locked while the scan runs." readOnly />
      <Textarea aria-label="Disabled notes" placeholder="Notes" disabled />
      <Textarea aria-label="Invalid notes" defaultValue="?" aria-invalid />
    </div>
  );
}

```

## Source

components/ui/textarea.tsx

```tsx
"use client";

import * as React from "react";
import { Textarea as ChakraTextarea } from "@chakra-ui/react";

import { inputClassName } from "@/components/ui/input";
import { cn } from "@/lib/utils";

// The field for more than a line: Input's frame (white, 1px Stone line, the 8px cut, Forest line on focus, brick when
// invalid, Fog read-only, Mist disabled) with 13px Forest text on 18px lines, 8px above and below and 16px at the sides.
// It grows with its content (field-sizing) from 72px, two field heights, and is not resized by hand.
function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <ChakraTextarea
      unstyled
      data-slot="textarea"
      className={cn(inputClassName, "field-sizing-content flex h-auto min-h-18 resize-none py-2 leading-line-body", className)}
      {...props}
    />
  );
}

export { Textarea };

```
