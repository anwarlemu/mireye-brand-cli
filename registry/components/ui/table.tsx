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
        "relative w-full overflow-x-auto",
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
