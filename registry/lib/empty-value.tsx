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
