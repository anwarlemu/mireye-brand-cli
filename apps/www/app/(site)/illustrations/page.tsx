import { readFileSync } from "node:fs";
import path from "node:path";

import { Command, PageBody, PageHead, Section } from "@www/components/chrome";
import { ShotGrid } from "@www/components/gallery";
import { inGroup } from "@www/lib/gallery";
import { CLI_COMMAND } from "@www/lib/registry";

export const metadata = { title: "Illustrations" };

// The numbered rules from brand/illustration.md, so the page and the agents read the same text.
const rules = (heading: string) => {
  const md = readFileSync(path.join(process.cwd(), "../../brand/illustration.md"), "utf8");
  const part = md.split(`## ${heading}`)[1]?.split("\n## ")[0] ?? "";
  const items: string[] = [];
  for (const line of part.split("\n")) {
    if (/^\d+\. /.test(line)) items.push(line.replace(/^\d+\. /, ""));
    else if (/^\s+\S/.test(line) && items.length) items[items.length - 1] += ` ${line.trim()}`;
    else if (!line.trim() && items.length) break;
  }
  return items.map((r) => r.replace(/`/g, ""));
};

function Rules({ items }: { items: string[] }) {
  return (
    <ol className="grid max-w-180 gap-2">
      {items.map((r, i) => (
        <li key={i} className="grid grid-cols-[2rem_1fr] text-body leading-body text-fg">
          <span className="font-mono text-caption leading-body text-fg-muted">{String(i + 1).padStart(2, "0")}</span>
          <span>{r}</span>
        </li>
      ))}
    </ol>
  );
}

export default function IllustrationsPage() {
  return (
    <>
      <PageHead title="Illustrations" eyebrow="Guide" description="The brand draws the physical world as a survey would: thin lines on a solid ground, nothing shaded, nothing rounded. Every style writes SVG of real vector shapes and PNG; the same input writes the same bytes." />
      <PageBody className="max-w-300">
        <Command command={`${CLI_COMMAND} illustrate --list --json`} />
        <Section title="Wireframe scenes" description="Hidden-line isometric drawings from the brand illustration skill: filled line bands, faint x-ray lines for hidden edges, one spacing scale. The skill's toolkit runs unchanged, so the SVG matches the skill's own export. Green is the default ground; brown for Enterprise, bone for light posts.">
          <ShotGrid entries={inGroup("wire")} />
          <Rules items={rules("Wireframe rules (from the skill)")} />
        </Section>
        <Section title="Isometric scenes" description="Quick line drawings from the share-image tool: faces in the ground color hide what is behind them, one parcel is picked out. Presets print a scene text you can edit and pass back with --spec.">
          <ShotGrid entries={inGroup("iso")} />
        </Section>
        <Section title="Contours and traced pictures" description="The website's topographic fields, and any picture traced into that same line: brightness read as height, smoothed and cut into isolines.">
          <ShotGrid entries={[...inGroup("contours"), ...inGroup("trace")]} />
          <Rules items={rules("Isometric and contour rules (from the playground and site)")} />
        </Section>
      </PageBody>
    </>
  );
}
