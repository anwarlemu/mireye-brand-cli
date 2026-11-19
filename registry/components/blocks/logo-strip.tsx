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
