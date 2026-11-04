import Link from "next/link";

import { PageBody, PageHead } from "@www/components/chrome";
import { items } from "@www/lib/registry";

export const metadata = { title: "Components" };

export default function ComponentsPage() {
  return (
    <>
      <PageHead eyebrow="Library" title="Components" description={`${items.length} components, each with its examples, usage rules and source.`} />
      <PageBody>
        <ul className="grid grid-cols-[repeat(auto-fill,minmax(16rem,1fr))] gap-3">
          {items.map((i) => (
            <li key={i.name}>
              <Link href={`/components/${i.name}`} className="ds-cut-frame grid h-full content-start gap-1 p-4 outline-none [--ds-shape-fill:var(--ds-color-bg-default)] [--ds-shape-stroke:var(--ds-color-border-default)] after:transition-[background-color] after:duration-150 after:ease-out before:transition-[background-color] before:duration-150 before:ease-out hover:[--ds-shape-fill:var(--ds-color-bg-subtle)] focus-visible:outline-solid focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-line-strong motion-reduce:after:transition-none motion-reduce:before:transition-none">
                <span className="text-body leading-tight text-fg">{i.title}</span>
                <span className="text-body leading-body text-fg-muted">{i.description}</span>
              </Link>
            </li>
          ))}
        </ul>
      </PageBody>
    </>
  );
}
