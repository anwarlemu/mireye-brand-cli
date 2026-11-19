import { Code, Command, PageBody, PageHead, Section } from "@www/components/chrome";
import { CLI_COMMAND } from "@www/lib/registry";

export const metadata = { title: "Figma" };

const STEPS = [
  { tool: "create_session", note: "Every Figma task starts here; pass the session to every later call." },
  { tool: "use_figma", note: "Runs a script the CLI wrote: the token variables, or an SVG imported as editable layers." },
  { tool: "upload_assets", note: "For pictures and SVGs too big for one script: they arrive as editable vectors." },
  { tool: "html_to_figma", note: "For a component preview or a page, captured as self-contained HTML." },
  { tool: "get_screenshot", note: "One look to confirm the result." },
];

export default function FigmaPage() {
  return (
    <>
      <PageHead title="Figma" eyebrow="Guide" description="The CLI prepares everything Figma needs and prints the Figma MCP calls in order; it never calls Figma itself. Drawn assets are SVG with the type outlined, so nothing depends on loading Gilroy inside Figma." />
      <PageBody className="max-w-240">
        <Section title="Tokens as variables" description="One collection with a mode per theme (API · Field and Enterprise · Earth), each variable typed, scoped and linked to its CSS variable. On a plan with one mode per collection the script makes one collection per theme. Safe to rerun.">
          <Command command={`${CLI_COMMAND} figma tokens --out figma`} />
        </Section>
        <Section title="Push" description="An illustration, a poster image, a slide, any SVG or picture, a library component or a page, ready for Figma.">
          <Command command={`${CLI_COMMAND} figma push illustration apicore --ground bone`} />
          <Command command={`${CLI_COMMAND} figma push image parcels --size square --ground green`} />
          <Command command={`${CLI_COMMAND} figma push slide cover`} />
          <Command command={`${CLI_COMMAND} figma push component button`} />
        </Section>
        <Section title="Pull and check" description="Read a Figma frame, save what the tools return, and check it against the tokens. Every off-brand color, font, size, radius or gap is named with the nearest token; the check exits 1 when there is any.">
          <Command command={`${CLI_COMMAND} figma pull "https://figma.com/design/<fileKey>/<name>?node-id=1-2"`} />
          <Command command={`${CLI_COMMAND} figma check figma/variables-1-2.json figma/design-1-2.txt`} />
          <Code lang="text" title="Output" code={`3 off-brand values:\n  color   #ff0000 is not a brand color; nearest --ds-color-status-danger\n  font    Inter is not a brand font (gilroy, dm mono)\n  radius  12px rounds a corner, and nothing in the brand is rounded: use 0 (--ds-radius-xs); the only shape is the cut corner (--ds-cut)`} />
        </Section>
        <Section title="The calls, in order" description="Every action prints its own list with the files filled in. These are the tools it uses.">
          <ol className="grid gap-2">
            {STEPS.map((s, i) => (
              <li key={s.tool} className="grid grid-cols-[2rem_9rem_1fr] items-baseline gap-2 border-b border-line-subtle pb-2 text-body leading-body max-sm:grid-cols-[2rem_1fr]">
                <span className="font-mono text-caption text-fg-muted">{String(i + 1).padStart(2, "0")}</span>
                <code className="font-mono text-caption text-fg">{s.tool}</code>
                <span className="text-fg-secondary max-sm:col-start-2">{s.note}</span>
              </li>
            ))}
          </ol>
        </Section>
      </PageBody>
    </>
  );
}
