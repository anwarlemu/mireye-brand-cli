"use client";

import * as React from "react";
import { chakra } from "@chakra-ui/react";

import { cn } from "@/lib/utils";

// A trail of places (Texas, Ellis County, Site 14). 13px links in Forest at 72% that step to Forest on hover (150ms,
// color only), the current place in Forest, and a Slate slash between, like a path. Three dots stand for the levels
// folded away. Focus is the 1px Forest outline, 2px out.
function Breadcrumb(props: React.ComponentProps<"nav">) {
  return <nav aria-label="breadcrumb" data-slot="breadcrumb" {...props} />;
}

function BreadcrumbList({ className, ...props }: React.ComponentProps<"ol">) {
  return <ol data-slot="breadcrumb-list" className={cn("flex flex-wrap items-center gap-2 font-sans text-body leading-tight break-words text-fg-muted", className)} {...props} />;
}

function BreadcrumbItem({ className, ...props }: React.ComponentProps<"li">) {
  return <li data-slot="breadcrumb-item" className={cn("inline-flex items-center gap-1.5", className)} {...props} />;
}

function BreadcrumbLink({ asChild, className, ...props }: React.ComponentProps<"a"> & { asChild?: boolean }) {
  const Comp = asChild ? chakra.a : "a";
  // Chakra's factory renders its child in its place only when told to.
  const slotProps = asChild ? { asChild: true } : {};
  return (
    <Comp {...slotProps}
      data-slot="breadcrumb-link"
      className={cn("text-fg-muted outline-none transition-colors duration-fast ease-out hover:text-fg focus-visible:outline-solid focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-line-strong motion-reduce:transition-none", className)}
      {...props}
    />
  );
}

function BreadcrumbPage({ className, ...props }: React.ComponentProps<"span">) {
  return <span data-slot="breadcrumb-page" role="link" aria-disabled="true" aria-current="page" className={cn("font-normal text-fg", className)} {...props} />;
}

function BreadcrumbSeparator({ children, className, ...props }: React.ComponentProps<"li">) {
  return (
    <li data-slot="breadcrumb-separator" role="presentation" aria-hidden="true" className={cn("text-fg-subtle [&>svg]:size-3", className)} {...props}>
      {children ?? "/"}
    </li>
  );
}

function BreadcrumbEllipsis({ className, ...props }: React.ComponentProps<"span">) {
  return (
    <span data-slot="breadcrumb-ellipsis" role="presentation" aria-hidden="true" className={cn("flex h-5 items-center justify-center", className)} {...props}>
      ...
      <span className="sr-only">More</span>
    </span>
  );
}

export { Breadcrumb, BreadcrumbEllipsis, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator };
