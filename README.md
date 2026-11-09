# Mireye design system

Components, design tokens and a CLI for building Mireye pages and interfaces.

Reference: https://mireye-ds.agencidev.com

## Consistent CLI workflow

```sh
npx mireye-ds info --json
npx mireye-ds search button --json
npx mireye-ds view button --json
npx mireye-ds add button card --dry-run --json
npx mireye-ds add button card --json
npx mireye-ds add button --diff
```

For a new app: `npx -y github:anwarlemu/mireye-brand-cli#release create --template vite --name my-app`.
For an existing app: `init` sets up the theme; `apply --dry-run` previews a requested restyle.
`add` also installs agent instructions and portable Claude/Codex skills, so a separate init is optional.
Use `--cwd <app>` for a different directory. Existing components.json aliases, TS/JS output, local helpers, unrelated registries and local component edits are preserved.

The standard registry works with shadcn 4.22.1:

```sh
npx mireye-ds init
npx mireye-ds shadcn add @mireye-ds/theme @mireye-ds/button
npx mireye-ds mcp init --client claude
```

Include `theme` explicitly when using upstream shadcn to update existing theme aliases. Native `add` handles it automatically. Shared workspace installation, presets, migrations, registry authoring and MCP use the pinned upstream implementation via `shadcn <args...>`. Bundled component discovery works offline; installation needs network access for missing dependencies. Agent hosts must load their MCP configuration before it is available in a session.

## Install the CLI

Run once from the project root:

```sh
npm install --save-dev github:anwarlemu/mireye-brand-cli#release
```

Prepare styles, fonts and agent instructions for new work:

```sh
npx mireye-ds init
npx mireye-ds guide
```

`init` does not convert existing components. The bare command does; see "Update an existing interface" below.

`init` and `add` install what the library's components need: brand tokens, the Tailwind theme, the Gilroy fonts and
the Chakra provider they render in. The components render fully styled (Gilroy, the cut corners and the brand colors
inside them), and the app's existing pages keep their look. The base layer (the page's type, colors, headings, links
and focus on every element) comes only with a decision to brand the whole app: `apply` with no targets, `create`, or
`init` in an app with no pages yet. An app set up with the base layer keeps it on every later `add` or selection.
Requires Node.js 20 or later. Read [the agent guide](https://mireye-ds.agencidev.com/agents.md) with any coding agent.
The same guide is installed at `.ds/agent-guide.md`. Agents that do not auto-load project instructions should read it explicitly.

## Add components

Run `add` from the target app root. Components require React 19.2+, Tailwind CSS 4, and valid project configuration. For other frameworks, run the bare CLI command to apply the brand instead. In a React and Tailwind 4 app, add the components the page needs:

```sh
npx mireye-ds add button card field input
```

The CLI copies component source, installs dependencies and adds the theme. It uses the project’s `src` folder and
configured aliases and components.json paths. Read each component’s examples and usage notes before changing it.

```sh
npx mireye-ds list --json
npx mireye-ds show select --json
npx mireye-ds tokens border
```

## Instructions for coding agents

Include this with the page requirements:

```text
Build this page using the Mireye design system at https://mireye-ds.agencidev.com.
Read https://mireye-ds.agencidev.com/agents.md first.
Run npx mireye-ds show <name> --json for exact exports, usage rules, examples and source.
Add existing components with the CLI. Use design tokens for custom layout and styling.
Render Open Graph and social images with npx mireye-ds image. Run image --list --json for formats and templates.
Connect every control to its intended behavior. Include validation, loading, empty and error states where needed.
Run the project checks and the CLI token check. Test keyboard interaction and desktop and phone layouts.
```

## Check the implementation

```sh
npx mireye-ds check --changed
npx mireye-ds review http://localhost:3000 --any
```

Start the development server before running `review`. It captures desktop and phone screenshots and compares the
page with the Mireye reference. It requires `playwright-core` and Chromium (`npx playwright install chromium`).
Review uses the available Codex or Claude Code session, or the Anthropic API when configured. When no reviewer is
available, it saves screenshots for the coding agent to review. Visual review does not test form validation or
control behavior; test those separately.

## Commands

Run these commands with `npx mireye-ds` after installing the CLI.

| Command | Purpose |
|---|---|
| `init` | Install styles, fonts and agent instructions without converting existing components. |
| `guide` | Read the portable agent workflow, including setup and verification. |
| `show <item>` | Read usage rules, exports, examples and source. Use `--json` for structured output. |
| `add <items...>` | Copy components, dependencies and the theme into a React and Tailwind 4 project. |
| `list` | List the available components. |
| `look <file\|element>` | Show component and token guidance for a file or element type. |
| `tokens [term]` | Find a token by name or role. |
| `image` | Render an Open Graph or social image (PNG and SVG) from the brand tokens, type and logo. |
| `check [files...]` | Check style values. Use `--changed` for Git changes or `--fix` for exact token replacements. |
| `review <url> --any` | Review a page that is not part of an existing conversion task list. |
| `review <url>` | Review a tracked screen and mark its task complete when it passes. |
| `approve` | Approve a `ds-override` comment in a human-operated terminal. |
| `done <screen>` | Mark a native screen task complete. Web screen tasks use `review`. |
| `skip <screen> --reason "..."` | Record why a tracked screen was left unchanged. |

## Render images

`image` draws a brand sheet at a social size. It uses the tokens, Gilroy, DM Mono and the logomark. No browser.

```sh
npx mireye-ds image --list --json
npx mireye-ds image --format og --template headline --title "Parcel survey" --json
npx mireye-ds image --format square --template subtext --title "Site survey" --subtitle "Boundaries and access."
npx mireye-ds image --format landscape --template frame --title "Parcel 18" --image ./screen.png
npx mireye-ds image --format portrait --template quote --quote "Read the sheet first." --attribution "Field review"
```

Formats are `og` (1200 by 630), `square` (1080 by 1080), `portrait` (1080 by 1350) and `landscape` (1200 by 675). Templates are `headline`, `subtext`, `frame`, `quote` and `announcement`. `--theme enterprise` uses the earth palette. `--export png,svg` is the default. `--json` lists the files and their pixel size. Output goes to `.ds/images` unless `--out` is set. `frame` takes a PNG or JPEG; without one it draws a survey plate. `--content` reads a JSON file, and an `image` path in it is relative to that file. Long copy shrinks so the type stays above the footer rule.

## Update an existing interface

The `apply` command restyles existing code, with color changes scoped to recognized components. It can replace matching React
components, convert style values, install styles and fonts, and add agent rules and checks. Review the diff before
continuing. This conversion preserves existing copy and behavior. It installs color tokens and applies them at
identified component usage sites, including supported variants and states. Shared palette definitions, chart data,
artwork, gradients and unrelated colors stay intact. Unknown or dynamic color roles are left for review. The
installed checks follow the same color scope, including `check --fix`.

```sh
npx mireye-ds apply --dry-run
npx mireye-ds apply
```

To restyle only part of an app, name it. Each target is a route, a file or glob, a library component (any case:
`Button`, `alert-dialog`) or one of the app's own components (`PrimaryButton`):

```sh
npx mireye-ds apply button card dialog          # those components, wherever the app uses them
npx mireye-ds apply /settings /billing          # those pages and the components only they use
npx mireye-ds apply "app/(dashboard)/**/page.tsx"
npx mireye-ds apply button --pages /settings    # buttons on the settings page only
npx mireye-ds apply /settings --with-shared     # also the layout and shell files it shares
npx mireye-ds apply button --dry-run --json     # each file it would change, with the reason
```

A named page renders in the brand: its root element takes the `ds-page` class (Gilroy, the brand's text color and
ground on that page), its values convert to tokens, and its uses of components other pages share take the library's
look at the use site (`className` with important classes), while the shared components stay as they are. A page can
be a route, a file, or, in an app that routes without a router, its page component by name (`Settings`). Naming a
library component also restyles a component the app built on its own cva (shadcn's `button.tsx`), in its own file.

Nothing outside the selection changes apart from the shared setup (brand tokens, theme and the Gilroy fonts, without
the base layer, and the Chakra provider the library's components render in): pages outside it render as before. A name
that matches nothing stops the run with the closest names. The selection is recorded in `.ds/state.json`:
`apply --redo` repeats it, a later `apply <more>` adds to it, and a bare `apply` takes the whole app. The checks, hooks
and pre-commit enforce the brand only inside the selection; `check --all` checks every file.

Subsequent runs report the next screen to review. `--redo` repeats conversion after an update. Component decisions
are recorded in `.ds/components.json`. The conversion also installs checks for Claude Code, Codex, Cursor and Git
commits. Adding individual components with `add` does not run this conversion.

## Text and structured references

- `/agents.md`: the agent workflow.
- `/llms.txt`: short catalog with links to every component.
- `/llms-full.txt`: complete guide, examples and source.
- `/r/index.json`: all items, including hooks, helpers and theme.
- `/r/<name>.md` and `/r/<name>.json`: usage rules, exports, dependencies, examples and exact source.

All references are generated from the same registry the CLI installs. Prefer individual component references to
the complete file. `guide`, `list`, `show`, `look`, `tokens` and `check` without `--fix` are read-only. `init` and
`add` accept `--dry-run`; add `--json` for structured results. JSON goes to stdout; progress goes to stderr.

## Source

- `registry/components/`: the components.
- `registry/examples/`: working examples shown in the docs.
- `registry/docs/`: component descriptions, usage notes and constraints.
- `brand/tokens.css`: design tokens.
- `brand/elements.json`: styles for each element type and their source references.
- `brand/reference/`: reference screenshots used for review.
- `apps/www/`: the design system site.

Run `npm run ci` for the CLI tests and registry checks, `npm run build --workspace www` for the docs build,
and `DOCS_URL=http://localhost:3000 npm run test:docs` for the browser checks against a running production build.

The explicit `apply` command scopes color conversion to recognized components and preserves unrelated artwork and shared palette data. The legacy bare-command conversion remains for compatibility; use `apply` for new restyling tasks.
