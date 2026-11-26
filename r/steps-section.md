# Steps section
How it works: numbered steps along a 1px Stone line, a solid diamond at each, a mono index, a title and one line.

Install: npx mireye-ds add steps-section
Requires: theme, page-section, diamond
Packages: none
Exports: SectionStep, StepsSectionProps, StepsSection
Client boundary: not required by this entry file
Reference: Mireye website (mireye-website, read-only): HowItWorks and how-it-works.css (the step line and its nodes)


## Usage
Use for three to five steps of a process. Across on wide screens, down on a phone.
- Avoid: Arrows between steps
- Avoid: Icons in circles
- Avoid: More than five steps
- Avoid: Moving connectors


## Examples
Example components: npx mireye-ds add steps-section
[Preview](https://mireye-ds.agencidev.com/preview/steps-section/Preview)

examples/steps-section.tsx

```tsx
import { StepsSection } from "@/components/blocks/steps-section";

export function Preview() {
  return <StepsSection closing />;
}

```

## Source

components/blocks/steps-section.tsx

```tsx
import * as React from "react";

import { PageSection, type PageSectionProps } from "@/components/blocks/page-section";
import { Diamond } from "@/components/ui/diamond";

// How it works: numbered steps along a 1px Stone line with a solid diamond at each step, as on the website's
// how-it-works page. Across on wide screens, down on a phone. Each step is a mono index, a title and one line.

export type SectionStep = { title: string; description?: string };

const STEPS: SectionStep[] = [
  { title: "Ask about a place", description: "An address, a parcel or coordinates." },
  { title: "We find the records", description: "County, utility and federal sources." },
  { title: "Every field is cited", description: "Each value names where it came from." },
  { title: "Your agent answers", description: "In one request, as plain JSON." },
];

export type StepsSectionProps = Omit<PageSectionProps, "children"> & { steps?: SectionStep[] };

export function StepsSection({ steps = STEPS, label = "How it works", title = "From a question to a cited answer.", ...props }: StepsSectionProps) {
  return (
    <PageSection label={label} title={title} {...props}>
      <ol data-slot="steps-section" className="grid gap-8 md:grid-cols-2 lg:grid-cols-4 lg:gap-0">
        {steps.map((s, i) => (
          <li key={s.title} className="relative grid content-start gap-3 border-l border-line pl-6 lg:border-t lg:border-l-0 lg:pt-8 lg:pr-8 lg:pl-0">
            <span aria-hidden className="absolute top-0 -left-1.5 lg:-top-1.5 lg:left-0">
              <Diamond size={12} className="text-fg" />
            </span>
            <span className="font-mono text-caption leading-tight text-fg-muted">{String(i + 1).padStart(2, "0")}</span>
            <h3 className="text-h3 leading-heading font-normal text-fg">{s.title}</h3>
            {s.description != null && <p className="text-body leading-body text-fg-secondary">{s.description}</p>}
          </li>
        ))}
      </ol>
    </PageSection>
  );
}

```
