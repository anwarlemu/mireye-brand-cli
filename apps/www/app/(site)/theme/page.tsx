import { readFileSync } from "node:fs";
import path from "node:path";

import { Code, Command, PageBody, PageHead, Section } from "@www/components/chrome";
import { CLI_COMMAND } from "@www/lib/registry";

export const metadata = { title: "Theme" };

type Tokens = { site: Record<string, string> };
const tokens = JSON.parse(readFileSync(path.join(process.cwd(), "../../build/tokens.json"), "utf8")) as Tokens;
const isColor = (v: string) => /^#|^rgb|^hsl|^oklch/.test(v);
const colors = Object.entries(tokens.site).filter(([k, v]) => k.startsWith("--ds-color-") && isColor(v));

// The palette first, then the roles every component reads, by job.
const GROUPS: { title: string; test: RegExp }[] = [
  { title: "Palette", test: /^--ds-color-(forest|moss|fern|lichen|earth|bone|umber|bark|clay|sand|bone-warm|mist|stone|slate|haze|fog|brand|black|white)$/ },
  { title: "Surfaces", test: /^--ds-color-bg-/ },
  { title: "Text and icons", test: /^--ds-color-(text-|icon-)/ },
  { title: "Lines", test: /^--ds-color-(border-|wash-|ring-)/ },
  { title: "Actions, states, tags and charts", test: /^--ds-color-(action-|status-|focus-|tag|chart-)/ },
  { title: "Code", test: /^--ds-color-code-/ },
];

const SCALE = Object.entries(tokens.site).filter(([k]) => /^--ds-text-/.test(k));
const CUTS = Object.entries(tokens.site).filter(([k]) => /^--ds-cut(-|$)/.test(k));
const LINES = [
  { name: "border-line", label: "Every edge", token: "--ds-color-border-default" },
  { name: "border-line-subtle", label: "Rules inside a panel", token: "--ds-color-border-subtle" },
  { name: "border-line-strong", label: "Focus and strong edges", token: "--ds-color-border-strong" },
];

function Swatch({ name, value }: { name: string; value: string }) {
  return (
    <div className="overflow-hidden border border-line bg-surface">
      <div className="h-12 border-b border-line-subtle" style={{ background: `var(${name})` }} />
      <div className="px-3 py-2">
        <p className="truncate font-mono text-caption text-fg">{name.replace("--ds-color-", "")}</p>
        <p className="truncate font-mono text-caption text-fg-muted">{value}</p>
      </div>
    </div>
  );
}

export default function ThemePage() {
  return (
    <>
      <PageHead title="Theme" eyebrow="Guide" description="Use these tokens for colors, type, space, the cut corner, lines and motion. Components already use them; use the same tokens for custom layouts." />
      <PageBody className="max-w-240">
        <Command command={`${CLI_COMMAND} add theme`} />
        <Section title="Color" description="Choose tokens by their role: surface, text, line, action or status.">
          <div className="grid gap-6">
            {GROUPS.map((g) => {
              const list = colors.filter(([k]) => g.test.test(k));
              return (
                <div key={g.title} className="grid gap-2">
                  <p className="w-fit border border-line px-1.5 py-0.5 text-caption leading-none text-fg-secondary">{g.title}</p>
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                    {list.map(([name, value]) => (
                      <Swatch key={name} name={name} value={value} />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </Section>

        <Section title="Type" description="Gilroy for every word, at Regular 400 and Medium 500 only; DM Mono for coordinates, parcel IDs, values and code. Hierarchy comes from size, color and space, never weight.">
          <div className="ds-cut-frame divide-y divide-line-subtle px-4 [--ds-shape-fill:var(--ds-color-bg-default)] [--ds-shape-stroke:var(--ds-color-border-default)]">
            {SCALE.map(([name, value]) => (
              <div key={name} className="grid items-baseline gap-2 py-4 sm:grid-cols-[11rem_1fr]">
                <p className="font-mono text-caption text-fg-muted">
                  {name.replace("--ds-text-", "text-")} {value}
                </p>
                <p className="min-w-0 text-fg" style={{ fontSize: `var(${name})` }}>
                  Ellis County site 14
                </p>
              </div>
            ))}
          </div>
        </Section>

        <Section title="Shape and lines" description="Nothing is rounded and nothing casts a shadow. The one shape is the cut corner, a 45 degree chamfer at the top-left (ds-cut for a fill, ds-cut-frame for a 1px line and a fill); every edge is a 1px line.">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {CUTS.map(([name, value]) => (
              <div key={name} className="grid gap-2">
                <div className="ds-cut-frame h-20 [--ds-shape-fill:var(--ds-color-bg-default)] [--ds-shape-stroke:var(--ds-color-border-default)]" style={{ ["--ds-cut" as string]: `var(${name})` }} />
                <p className="font-mono text-caption text-fg">
                  {name.replace("--ds-", "")} <span className="text-fg-muted">{value}</span>
                </p>
              </div>
            ))}
          </div>
          <div className="mt-2 grid gap-4 sm:grid-cols-3">
            {LINES.map((l) => (
              <div key={l.name} className="grid gap-2">
                <div className="h-20 bg-surface" style={{ boxShadow: `inset 0 0 0 1px var(${l.token})` }} />
                <p className="font-mono text-caption text-fg">
                  {l.name} <span className="font-sans text-fg-muted">{l.label}</span>
                </p>
              </div>
            ))}
          </div>
        </Section>

        <Section title="Import the theme" description="The CLI writes the brand stylesheet and the Tailwind theme beside the main stylesheet and adds these imports.">
          <Code
            title="app/globals.css"
            lang="css"
            code={`@import "tailwindcss";
@import "./_mireye-ds/brand.css";
@import "./_mireye-ds/theme.css";`}
          />
        </Section>
      </PageBody>
    </>
  );
}
