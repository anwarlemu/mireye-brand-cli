# Empty value
Words for values that are not there ("Not screened", "Not recorded", "None on record"), in 72 percent Forest.

Install: npx mireye-ds add empty-value
Requires: utils
Packages: none
Exports: NOT_SCREENED, NOT_RECORDED, NONE_ON_RECORD, NO_SOURCE_RECORDED, EmptyValue
Client boundary: not required by this entry file

## Usage
Use `EmptyValue` (and the constants) wherever data components show a missing value, so the wording never drifts. Never a dash or a blank.


## Source

lib/empty-value.tsx

```tsx
import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * Words for values that are not there, shared by the data components so the wording and the
 * color never drift. Always real text in 72% Forest (about 6:1 on white), never Slate, a dash or
 * a blank.
 */
export const NOT_SCREENED = "Not screened"; // the screen has not read this field
export const NOT_RECORDED = "Not recorded"; // a record attribute with no data (owner, zoning)
export const NONE_ON_RECORD = "None on record"; // a list that was checked and is empty
export const NO_SOURCE_RECORDED = "No source recorded"; // a reading with no source

export function EmptyValue({ children = NOT_SCREENED, className }: { children?: React.ReactNode; className?: string }) {
  return (
    <span data-slot="empty-value" className={cn("text-fg-muted", className)}>
      {children}
    </span>
  );
}

```
