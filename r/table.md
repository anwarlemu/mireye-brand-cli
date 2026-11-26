# Table
A table ruled like a survey sheet: 12px head labels over a 1px Stone rule, 44px rows ruled in Mist, no frame and no head fill; framed puts it in the Bone cut frame.

Install: npx mireye-ds add table
Requires: theme, utils
Packages: none
Exports: Table, TableBody, TableCaption, TableCell, TableFooter, TableHead, TableHeader, TableRow
Client boundary: not required by this entry file
Reference: LAND data-table (the Leads sites table) and Figma UI · Agent chat (443:433): Cited fields rules


## Usage
Use for a short, fixed list of records to read (substations near a parcel, the parcels in an assembled site). Align numbers right with tabular-nums and units in the cell (138 kV, 0.8 mi); set parcel IDs and coordinates in DM Mono. Mark a selected row with data-state="selected" and a row that opens a record with data-interactive. For sorting, filtering, selection or paging, use Data Table. A table wider than its container fades at the side (fade-x) where more columns scroll past it.
- Avoid: Zebra stripes
- Avoid: A filled head
- Avoid: Rounded corners
- Avoid: Hover fills on read-only rows
- Avoid: Vertical rules between columns


## Examples
Example components: npx mireye-ds add table badge
[Preview](https://mireye-ds.agencidev.com/preview/table/Preview) | [WithFooter](https://mireye-ds.agencidev.com/preview/table/WithFooter) | [Interactive](https://mireye-ds.agencidev.com/preview/table/Interactive)

examples/table.tsx

```tsx
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCaption, TableCell, TableFooter, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const SUBSTATIONS = [
  { name: "Waxahachie North", county: "Ellis", kv: 345, distance: 0.8, queue: "Open" },
  { name: "Ennis East", county: "Ellis", kv: 138, distance: 2.4, queue: "Open" },
  { name: "Corsicana", county: "Navarro", kv: 138, distance: 6.1, queue: "Full" },
  { name: "Kaufman South", county: "Kaufman", kv: 69, distance: 9.7, queue: "Open" },
];

export function Preview() {
  return (
    <Table>
      <TableCaption>Substations within 10 mi of parcel 042-117-09.</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead>Substation</TableHead>
          <TableHead>County</TableHead>
          <TableHead className="text-right">Voltage</TableHead>
          <TableHead className="text-right">Distance</TableHead>
          <TableHead>Queue</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {SUBSTATIONS.map((s) => (
          <TableRow key={s.name}>
            <TableCell>{s.name}</TableCell>
            <TableCell className="text-fg-secondary">{s.county}</TableCell>
            <TableCell className="text-right tabular-nums">{s.kv} kV</TableCell>
            <TableCell className="text-right tabular-nums">{s.distance.toFixed(1)} mi</TableCell>
            <TableCell>
              <Badge variant={s.queue === "Open" ? "default" : "secondary"}>{s.queue}</Badge>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

export function WithFooter() {
  return (
    <Table variant="framed">
      <TableHeader>
        <TableRow>
          <TableHead>Parcel</TableHead>
          <TableHead>Zoning</TableHead>
          <TableHead className="text-right">Acres</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow>
          <TableCell className="font-mono text-caption">042-117-09</TableCell>
          <TableCell>I-2 Industrial</TableCell>
          <TableCell className="text-right tabular-nums">141.3</TableCell>
        </TableRow>
        <TableRow data-state="selected">
          <TableCell className="font-mono text-caption">042-117-10</TableCell>
          <TableCell>I-2 Industrial</TableCell>
          <TableCell className="text-right tabular-nums">48.9</TableCell>
        </TableRow>
        <TableRow>
          <TableCell className="font-mono text-caption">042-118-02</TableCell>
          <TableCell>Agricultural</TableCell>
          <TableCell className="text-right tabular-nums">22.4</TableCell>
        </TableRow>
      </TableBody>
      <TableFooter>
        <TableRow>
          <TableCell colSpan={2}>Assembled site</TableCell>
          <TableCell className="text-right tabular-nums">212.6</TableCell>
        </TableRow>
      </TableFooter>
    </Table>
  );
}

export function Interactive() {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Site</TableHead>
          <TableHead className="text-right">Acres</TableHead>
          <TableHead className="text-right">Fit</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {[
          ["Ellis County site 14", "212.6", "9 of 9"],
          ["Navarro County site 3", "305.0", "7 of 9"],
          ["Kaufman County site 8", "198.2", "6 of 9"],
        ].map(([site, acres, fit]) => (
          <TableRow key={site} data-interactive="">
            <TableCell>
              <a href="#site" className="outline-none focus-visible:outline-solid focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-line-strong">
                {site}
              </a>
            </TableCell>
            <TableCell className="text-right tabular-nums">{acres}</TableCell>
            <TableCell className="text-right tabular-nums">{fit}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

```

## Source

components/ui/table.tsx

```tsx
import * as React from "react";

import { cn } from "@/lib/utils";

// Mireye's table, ruled like a survey sheet (the Leads table and Cited fields, Figma 443:433): no frame and no head
// fill. A 36px head of 12px labels in Forest at 80% over a 1px Stone rule; 44px rows of 13px Forest ruled by 1px Mist
// lines. Numbers align right in tabular figures. Cells keep 12px sides, so a table lines up with a panel's 16px edge
// when it sits inside one (put it in a Card or pass `variant="framed"` for the white cut frame). A selected row
// (data-state=selected) sits on Fog; a row that opens a record (data-interactive) fills with Fog under the pointer
// (150ms). Read-only rows have no hover. It scrolls sideways inside its container on a narrow screen.
function Table({ className, variant = "default", ...props }: React.ComponentProps<"table"> & { variant?: "default" | "framed" | "open" }) {
  return (
    <div
      data-slot="table-container"
      data-variant={variant}
      className={cn(
        "relative w-full overflow-x-auto fade-x",
        variant === "framed" && "ds-cut-frame px-2 pt-1 pb-2 [--ds-shape-fill:var(--ds-color-bg-default)] [--ds-shape-stroke:var(--ds-color-border-default)]",
      )}
    >
      <table data-slot="table" className={cn("w-full caption-bottom border-collapse font-sans text-body leading-tight text-fg", className)} {...props} />
    </div>
  );
}

function TableHeader({ className, ...props }: React.ComponentProps<"thead">) {
  return <thead data-slot="table-header" className={cn("[&_tr]:border-b [&_tr]:border-line", className)} {...props} />;
}

function TableBody({ className, ...props }: React.ComponentProps<"tbody">) {
  return <tbody data-slot="table-body" className={cn("[&_tr:last-child]:border-0", className)} {...props} />;
}

function TableFooter({ className, ...props }: React.ComponentProps<"tfoot">) {
  return <tfoot data-slot="table-footer" className={cn("border-t border-line font-medium [&>tr]:border-b-0", className)} {...props} />;
}

function TableRow({ className, ...props }: React.ComponentProps<"tr">) {
  return (
    <tr
      data-slot="table-row"
      className={cn(
        "border-b border-line-subtle transition-[background-color] duration-fast ease-out data-[interactive]:cursor-pointer data-[interactive]:hover:bg-subtle data-[state=selected]:bg-subtle motion-reduce:transition-none",
        className,
      )}
      {...props}
    />
  );
}

function TableHead({ className, ...props }: React.ComponentProps<"th">) {
  return (
    <th
      data-slot="table-head"
      className={cn("h-9 px-3 text-left align-middle text-caption leading-tight font-normal whitespace-nowrap text-fg-secondary [&:has([role=checkbox])]:w-8 [&:has([role=checkbox])]:pr-0", className)}
      {...props}
    />
  );
}

function TableCell({ className, ...props }: React.ComponentProps<"td">) {
  return <td data-slot="table-cell" className={cn("h-11 px-3 align-middle whitespace-nowrap [&:has([role=checkbox])]:w-8 [&:has([role=checkbox])]:pr-0", className)} {...props} />;
}

function TableCaption({ className, ...props }: React.ComponentProps<"caption">) {
  return <caption data-slot="table-caption" className={cn("mt-3 text-left text-caption leading-body text-fg-muted", className)} {...props} />;
}

export { Table, TableBody, TableCaption, TableCell, TableFooter, TableHead, TableHeader, TableRow };

```
