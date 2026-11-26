# Typography
Mireye's type as components: Gilroy at 400 and 500 only, a 24px page title down to the 12px caption, DM Mono on Fog for IDs and coordinates, quotes on a 1px Forest rule.

Install: npx mireye-ds add typography
Requires: theme, utils
Packages: none
Exports: TypographyBlockquote, TypographyH1, TypographyH2, TypographyH3, TypographyH4, TypographyInlineCode, TypographyLarge, TypographyLead, TypographyList, TypographyMuted, TypographyP, TypographySmall, TypographyTable
Client boundary: not required by this entry file
Reference: Brand type rules (Gilroy Regular and Medium, 1.4 line height) and Figma UI · Progress (442:213): the 24px title, at the product scale


## Usage
Use for running text and document pages (a site report, a method note). H1 is the page title, H3 a section or progress title, Lead the line under a page title, Muted an annotation. Set parcel IDs, coordinates and commands in TypographyInlineCode. For data, use Table.
- Avoid: Bold or semibold weights
- Avoid: Letter spacing
- Avoid: Coloured headings
- Avoid: Rounded inline code
- Avoid: Body text above 14px in the product


## Examples
Example components: npx mireye-ds add typography
[Preview](https://mireye-ds.agencidev.com/preview/typography/Preview) | [Scale](https://mireye-ds.agencidev.com/preview/typography/Scale)

examples/typography.tsx

```tsx
import { TypographyBlockquote, TypographyH1, TypographyH2, TypographyH3, TypographyH4, TypographyInlineCode, TypographyLarge, TypographyLead, TypographyList, TypographyMuted, TypographyP, TypographySmall, TypographyTable } from "@/components/ui/typography";

export function Preview() {
  return (
    <article className="w-full max-w-160">
      <TypographyH3>Ellis County site 14</TypographyH3>
      <TypographyMuted>212.6 ac assembled from three parcels, 0.8 mi from a 345 kV substation.</TypographyMuted>
      <TypographyP>
        The site sits at <TypographyInlineCode>32.4113, -96.8302</TypographyInlineCode>, outside the 100-year flood plain, with municipal water along the north edge.
      </TypographyP>
      <TypographyBlockquote>Zone X: an area of minimal flood hazard, outside the 0.2 percent annual chance flood plain.</TypographyBlockquote>
      <TypographyList>
        <li>Parcel records from the county appraisal district.</li>
        <li>Substations and queue status from the grid operator.</li>
        <li>Elevation and slope from a 10 m elevation model.</li>
      </TypographyList>
      <TypographyTable>
        <thead>
          <tr>
            <th>Field</th>
            <th>Value</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Flood zone</td>
            <td>Zone X</td>
          </tr>
          <tr>
            <td>Elevation</td>
            <td>412 ft</td>
          </tr>
        </tbody>
      </TypographyTable>
    </article>
  );
}

export function Scale() {
  return (
    <div className="grid w-full max-w-160 gap-3">
      <TypographyH1>Sites near Waxahachie</TypographyH1>
      <TypographyH2>Ellis County site 14</TypographyH2>
      <TypographyH3>Loading terrain</TypographyH3>
      <TypographyH4>Power</TypographyH4>
      <TypographyLead>Find land that meets your requirements, with every value cited.</TypographyLead>
      <TypographyLarge>9 of 9 requirements met</TypographyLarge>
      <TypographySmall>Updated Oct 28, 2026 from county records.</TypographySmall>
      <TypographyList ordered>
        <li>Describe the site you need.</li>
        <li>Review the matches and their sources.</li>
      </TypographyList>
    </div>
  );
}

```

## Source

components/ui/typography.tsx

```tsx
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
    <div data-slot="typography-table" className="my-4 w-full overflow-x-auto fade-x">
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

```
