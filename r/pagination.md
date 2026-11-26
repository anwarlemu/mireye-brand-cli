# Pagination
Square 32px page keys that fill with Fog under the pointer; the current page sits on Mist; Previous and Next carry Mireye's arrow.

Install: npx mireye-ds add pagination
Requires: theme, icons, utils
Packages: none
Exports: Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious
Client boundary: not required by this entry file
Reference: Not in Figma: built from the rail's Fog hover and Mist current row and the arrow of UI · Buttons (442:3), for a designer's review


## Usage
Use under a long list of sites or records when it is split into pages. Pass bar to sit it under a table. Show the first and last page, the pages around the current one and PaginationEllipsis between. Give Previous aria-disabled on the first page and Next on the last.
- Avoid: Rounded or pill keys
- Avoid: Arrows that move on hover
- Avoid: A Forest current page
- Avoid: Infinite scroll and pages on one list


## Examples
Example components: npx mireye-ds add pagination
[Preview](https://mireye-ds.agencidev.com/preview/pagination/Preview) | [Plain](https://mireye-ds.agencidev.com/preview/pagination/Plain)

examples/pagination.tsx

```tsx
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";

export function Preview() {
  return (
    <Pagination bar>
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious href="#" aria-disabled />
        </PaginationItem>
        <PaginationItem>
          <PaginationLink href="#" isActive>
            1
          </PaginationLink>
        </PaginationItem>
        <PaginationItem>
          <PaginationLink href="#">2</PaginationLink>
        </PaginationItem>
        <PaginationItem>
          <PaginationNext href="#" />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}

export function Plain() {
  return (
    <Pagination>
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious href="#" />
        </PaginationItem>
        <PaginationItem>
          <PaginationLink href="#">1</PaginationLink>
        </PaginationItem>
        <PaginationItem>
          <PaginationEllipsis />
        </PaginationItem>
        <PaginationItem>
          <PaginationLink href="#">7</PaginationLink>
        </PaginationItem>
        <PaginationItem>
          <PaginationLink href="#" isActive>
            8
          </PaginationLink>
        </PaginationItem>
        <PaginationItem>
          <PaginationLink href="#">9</PaginationLink>
        </PaginationItem>
        <PaginationItem>
          <PaginationEllipsis />
        </PaginationItem>
        <PaginationItem>
          <PaginationLink href="#">24</PaginationLink>
        </PaginationItem>
        <PaginationItem>
          <PaginationNext href="#" />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}

```

## Source

components/ui/pagination.tsx

```tsx
import * as React from "react";

import { ArrowRightIcon } from "@/components/icons/arrow-right";
import { cn } from "@/lib/utils";

// Pages of a list, as square keys: 32px tall, at least 32px wide, 13px Forest labels on a clear ground that fills with
// Fog under the pointer (150ms) and Mist when pressed. The current page sits on Mist, the rail's current row, and holds
// still. Previous and Next carry Mireye's arrow (the Figma button arrow at 16px; Previous turns it), which never moves
// on hover. A disabled key fades to Slate. `bar` sets it under a table: a row at least 44px tall.
function Pagination({ className, bar = false, ...props }: React.ComponentProps<"nav"> & { bar?: boolean }) {
  return (
    <nav
      role="navigation"
      aria-label="pagination"
      data-slot="pagination"
      data-bar={bar || undefined}
      className={cn("flex w-full justify-center", bar && "min-h-11 items-center", className)}
      {...props}
    />
  );
}

function PaginationContent({ className, ...props }: React.ComponentProps<"ul">) {
  return <ul data-slot="pagination-content" className={cn("flex flex-row flex-wrap items-center gap-1", className)} {...props} />;
}

function PaginationItem(props: React.ComponentProps<"li">) {
  return <li data-slot="pagination-item" {...props} />;
}

type PaginationLinkProps = { isActive?: boolean; size?: "icon" | "default" } & React.ComponentProps<"a">;

const KEY =
  "inline-flex h-8 shrink-0 items-center justify-center gap-2 bg-transparent font-sans text-body leading-none whitespace-nowrap text-fg tabular-nums outline-none transition-[background-color,color] duration-fast ease-out hover:bg-subtle active:bg-subtle-hover active:transition-none focus-visible:outline-solid focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-line-strong aria-disabled:pointer-events-none aria-disabled:text-fg-subtle motion-reduce:transition-none [&_svg]:pointer-events-none [&_svg]:shrink-0";

function PaginationLink({ className, isActive, size = "icon", ...props }: PaginationLinkProps) {
  return (
    <a
      aria-current={isActive ? "page" : undefined}
      data-slot="pagination-link"
      data-active={isActive || undefined}
      className={cn(KEY, size === "icon" ? "min-w-8 px-2" : "px-3", isActive && "pointer-events-none bg-subtle-hover", className)}
      {...props}
    />
  );
}

function PaginationPrevious({ className, children = "Previous", isActive: _active, size: _size, ...props }: React.ComponentProps<typeof PaginationLink>) {
  return (
    <a aria-label="Go to previous page" data-slot="pagination-link" className={cn(KEY, "px-2.5", className)} {...props}>
      <ArrowRightIcon size={16} aria-hidden className="rotate-180" />
      <span>{children}</span>
    </a>
  );
}

function PaginationNext({ className, children = "Next", isActive: _active, size: _size, ...props }: React.ComponentProps<typeof PaginationLink>) {
  return (
    <a aria-label="Go to next page" data-slot="pagination-link" className={cn(KEY, "px-2.5", className)} {...props}>
      <span>{children}</span>
      <ArrowRightIcon size={16} aria-hidden />
    </a>
  );
}

function PaginationEllipsis({ className, ...props }: React.ComponentProps<"span">) {
  return (
    <span aria-hidden data-slot="pagination-ellipsis" className={cn("flex h-8 min-w-8 items-center justify-center text-body text-fg-muted", className)} {...props}>
      ...
      <span className="sr-only">More pages</span>
    </span>
  );
}

export { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious };

```
