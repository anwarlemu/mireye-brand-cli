# Logo strip
Customer names between two section rules: a mono label, then quiet wordmarks (an outlined node and the name in Forest at 72%) in cells split by Mist rules.

Install: npx mireye-ds add logo-strip
Requires: theme, page-section, diamond
Packages: none
Exports: LogoStripProps, LogoStrip
Client boundary: not required by this entry file
Reference: Mireye website (mireye-website, read-only): CustomerLogoStrip layout (names in ruled cells); names are placeholders


## Usage
Use under the hero to show who builds on the product. The defaults are placeholder names (Acme, Acme Labs...); pass real customer names only with their permission.
- Avoid: Real company names or logos without permission
- Avoid: Coloured logos
- Avoid: A moving marquee
- Avoid: More than eight names


## Examples
Example components: npx mireye-ds add logo-strip
[Preview](https://mireye-ds.agencidev.com/preview/logo-strip/Preview)

examples/logo-strip.tsx

```tsx
import { LogoStrip } from "@/components/blocks/logo-strip";

export function Preview() {
  return <LogoStrip closing />;
}

```

## Source

components/blocks/logo-strip.tsx

```tsx
import * as React from "react";

import { PageSection, type PageSectionProps } from "@/components/blocks/page-section";
import { Diamond } from "@/components/ui/diamond";

// A strip of customer names between two section rules: a label, then the names as quiet wordmarks (an outlined node and
// the name in Forest at 72%) in cells split by 1px Stone rules. Placeholder names only; a product passes its own
// customers' names (or logos as children of each cell) once it has permission to show them.

const NAMES = ["Acme", "Acme Labs", "Acme Land", "Acme Energy", "Acme Grid", "Acme Survey"];

export type LogoStripProps = Omit<PageSectionProps, "children" | "title" | "intro"> & {
  names?: string[];
};

export function LogoStrip({ label = "Teams that build on Mireye", names = NAMES, space = "compact", ...props }: LogoStripProps) {
  return (
    <PageSection space={space} {...props}>
      <div className="grid gap-5 lg:grid-cols-4 lg:items-center lg:gap-8">
        <p className="font-mono text-caption leading-tight text-fg-muted">{label}</p>
        <ul className="grid grid-cols-2 border-t border-l border-line-subtle sm:grid-cols-3 lg:col-span-3">
          {names.map((n) => (
            <li key={n} className="flex h-16 items-center justify-center gap-2 border-r border-b border-line-subtle px-3 text-body-lg leading-none text-fg-muted">
              <Diamond size={12} variant="outline" />
              <span className="truncate">{n}</span>
            </li>
          ))}
        </ul>
      </div>
    </PageSection>
  );
}

```
