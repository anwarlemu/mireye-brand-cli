import * as React from "react";

import { cn } from "@/lib/utils";

// Mireye's type as components. Gilroy throughout, Regular 400 and Medium 500 only, no tracking: hierarchy comes from
// size, colour and space, never weight. H1 is the 24px page title, H2 20px, H3 the 16px section and progress title
// (Figma's largest product text), H4 a 14px medium label. Body copy is 13px Forest on a 1.4 line; Lead is 14px in
// Forest at 80%; Muted is 13px at 72%; Small is the 12px caption. Inline code and coordinates are DM Mono on Fog,
// square. Quotes hang from a 1px Forest rule.
function TypographyH1({ className, ...props }: React.ComponentProps<"h1">) {
  return <h1 data-slot="typography-h1" className={cn("font-sans text-h1 leading-heading font-normal text-balance text-fg", className)} {...props} />;
}

function TypographyH2({ className, ...props }: React.ComponentProps<"h2">) {
  return <h2 data-slot="typography-h2" className={cn("font-sans text-h2 leading-heading font-normal text-balance text-fg", className)} {...props} />;
}

function TypographyH3({ className, ...props }: React.ComponentProps<"h3">) {
  return <h3 data-slot="typography-h3" className={cn("font-sans text-h3 leading-heading font-normal text-fg", className)} {...props} />;
}

function TypographyH4({ className, ...props }: React.ComponentProps<"h4">) {
  return <h4 data-slot="typography-h4" className={cn("font-sans text-h4 leading-heading font-medium text-fg", className)} {...props} />;
}

function TypographyP({ className, ...props }: React.ComponentProps<"p">) {
  return <p data-slot="typography-p" className={cn("font-sans text-body leading-body text-pretty text-fg [&:not(:first-child)]:mt-4", className)} {...props} />;
}

function TypographyLead({ className, ...props }: React.ComponentProps<"p">) {
  return <p data-slot="typography-lead" className={cn("font-sans text-body-lg leading-body text-fg-secondary", className)} {...props} />;
}

function TypographyLarge({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="typography-large" className={cn("font-sans text-body-lg leading-body font-medium text-fg", className)} {...props} />;
}

function TypographySmall({ className, ...props }: React.ComponentProps<"small">) {
  return <small data-slot="typography-small" className={cn("font-sans text-caption leading-tight text-fg", className)} {...props} />;
}

function TypographyMuted({ className, ...props }: React.ComponentProps<"p">) {
  return <p data-slot="typography-muted" className={cn("font-sans text-body leading-body text-fg-muted", className)} {...props} />;
}

/** A quote or a cited passage: indented behind a 1px Forest rule, in Forest at 80%. */
function TypographyBlockquote({ className, ...props }: React.ComponentProps<"blockquote">) {
  return <blockquote data-slot="typography-blockquote" className={cn("mt-4 border-l border-line-strong pl-4 font-sans text-body leading-body text-fg-secondary", className)} {...props} />;
}

function TypographyList({ className, ordered = false, ...props }: Omit<React.ComponentProps<"ul">, "ref"> & { ordered?: boolean }) {
  const classes = cn("my-4 ml-5 grid gap-1.5 font-sans text-body leading-body text-fg marker:text-fg-subtle", ordered ? "list-decimal" : "list-disc", className);
  return ordered ? <ol data-slot="typography-list" className={classes} {...props} /> : <ul data-slot="typography-list" className={classes} {...props} />;
}

/** A parcel ID, coordinate or command inside text: DM Mono on Fog, square. */
function TypographyInlineCode({ className, ...props }: React.ComponentProps<"code">) {
  return <code data-slot="typography-inline-code" className={cn("bg-subtle px-1 py-px font-mono text-caption text-fg [box-decoration-break:clone]", className)} {...props} />;
}

/** A plain table in running text: caption-size head labels over a Stone rule, Mist rules between rows. For data, use Table. */
function TypographyTable({ className, ...props }: React.ComponentProps<"table">) {
  return (
    <div data-slot="typography-table" className="my-4 w-full overflow-x-auto">
      <table
        className={cn(
          "w-full border-collapse font-sans text-body leading-body text-fg [&_td]:border-b [&_td]:border-line-subtle [&_td]:px-3 [&_td]:py-2.5 [&_th]:border-b [&_th]:border-line [&_th]:px-3 [&_th]:py-2 [&_th]:text-left [&_th]:text-caption [&_th]:font-normal [&_th]:text-fg-secondary",
          className,
        )}
        {...props}
      />
    </div>
  );
}

export { TypographyBlockquote, TypographyH1, TypographyH2, TypographyH3, TypographyH4, TypographyInlineCode, TypographyLarge, TypographyLead, TypographyList, TypographyMuted, TypographyP, TypographySmall, TypographyTable };
