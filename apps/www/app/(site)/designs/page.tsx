import { Command, PageBody, PageHead, Section } from "@www/components/chrome";
import { ShotGrid } from "@www/components/gallery";
import { inGroup, shown } from "@www/lib/gallery";
import { CLI_COMMAND } from "@www/lib/registry";

export const metadata = { title: "Designs" };

// A real session (scripts/build-gallery.mjs): an X banner made, then revised step by step, each picture as the CLI drew it.
export default function DesignsPage() {
  const refused = inGroup("design-refused")[0];
  return (
    <>
      <PageHead title="Designs" eyebrow="Guide" description="Make a picture as a small design file, look at it, and change it in plain words or exact edits until it is right. Every change is drawn by the brand's own layouts and checked: words whole, nothing invented, contrast, the logo's clear space, overlap, the platform's covered areas. A change that breaks a rule changes nothing." />
      <PageBody className="max-w-300">
        <Command command={`${CLI_COMMAND} design new post --size x-banner --headline "..." -o banner.design.json`} />
        <Section title="One session" description="An X banner, then five revisions. The words re-wrap, the drawing takes the room that is left, and the logo keeps its clear space; the profile picture's corner stays empty at every step.">
          <ShotGrid entries={inGroup("design")} cols="sm:grid-cols-2" />
        </Section>
        {refused && (
          <Section title="Off brand is refused" description="Colors, type and the logo come from the brand. A request outside it changes nothing and says what can be done instead.">
            <Command command={shown(refused.command, CLI_COMMAND)} />
            <p className="max-w-180 font-mono text-caption leading-body text-fg-muted">{refused.label}</p>
          </Section>
        )}
        <Section title="The same design at other sizes" description="Laid out again for each size, not stretched.">
          <ShotGrid entries={inGroup("design-sizes")} cols="grid-cols-1" />
        </Section>
        <Section title="For agents" description="Make it, look at the PNG, change it, check it, repeat. Never edit the PNG or SVG by hand. design help --json lists every template, layer, what each layer can do, the phrases it understands and the rules.">
          <Command command={`${CLI_COMMAND} design help --json`} />
        </Section>
      </PageBody>
    </>
  );
}
