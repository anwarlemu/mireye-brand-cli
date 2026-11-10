# {{brand}} design system: instructions for agents

Use this system to build {{brand}} pages and interfaces from the user's brief. These instructions work with any agent that can read text and edit project files. The CLI is a local Node.js tool; no model account or agent-specific integration is needed for setup, discovery, installation or token checks.

## Start here

1. Run `{{cli}} manifest --json` before anything else. It lists every command, token group, image template, video template, component and rule. `{{cli}} describe --json` is the same document. Do not guess a template, size, component, token or option that is not in it.
2. Read the project instructions and package.json. Identify the framework, package manager, stylesheet and import aliases. Use the user's requirements to decide whether to build new UI or restyle existing UI.
3. Read this guide, then the relevant component references. The library is at {{registry}}/components. Plain text is at {{registry}}/llms.txt; a complete copy is at {{registry}}/llms-full.txt.
4. Reuse the library's components and variants. Do not recreate them from screenshots or guess their props. `{{cli}} component inspect <name> --json` is the props and states. `{{cli}} component emit <name> --json` is markup copied from the registry example.

## Install and prepare a project

Requires Node.js 20 or later. Run commands from the consuming project root, not the design-system repository.

```sh
npm install --save-dev {{source}}
{{cli}} init
```

`npm install` installs the CLI only. `init` installs styles, fonts and agent instructions without converting existing components or creating conversion review tasks. It preserves other instructions already in the project. Inspect its warnings about a missing stylesheet or alias.

React components require React 19 or later, Tailwind CSS 4 and a working build. The installer follows components.json and TypeScript or JavaScript aliases; without aliases, it uses relative imports. Set up that framework first. Other frameworks can use the CSS tokens and styling guidance, but cannot render the React components.

For an existing interface that the user wants restyled, preview the explicit apply command:

```sh
npx -y {{source}} apply --dry-run
npx -y {{source}} apply
```

The apply command can adapt matching components, convert style values, and install agent rules and hooks. Color conversion is scoped to recognized components; unrelated palettes and artwork remain unchanged. The legacy bare command also converts styles; use explicit commands for setup and discovery. Subsequent runs resume review tasks. `--redo` repeats conversion. Review the diff and test existing behavior after conversion; a successful exit is not proof that the visual review is complete.

## Find, inspect and add components

```sh
{{cli}} component list --json
{{cli}} component inspect button --json
{{cli}} component emit button --state Preview --json
{{cli}} list --json
{{cli}} show select --json
{{cli}} add field select button --dry-run --json
{{cli}} add field select button --json
```

The add command above is an example, not the list required for every page. Choose items from `component list` or `list`. `component inspect` reads the registry docs and source in this package and returns the variant props, other props, example states and the source. `component emit` returns one example function and its imports. Pass `--state` with an export name from the inspect result. An unknown component or state is an error. Items with no example file (helpers such as `utils`) cannot be emitted; read the source from inspect and do not invent markup.

`show` is read-only and works offline using the registry bundled with the CLI. `show --json` returns source, examples, usage rules, exports, dependencies and links. Hooks and helper libraries are included in the JSON index.

`add` copies source files and their transitive dependencies, installs missing npm packages, and wires the theme. Existing files are kept. Use `--overwrite` only when intentionally replacing local component changes. Read the returned file list and warnings. Generated imports and target files follow components.json and the project alias configuration. Existing utility files are preserved; brand helpers use their own names.

For HTTP-only agents, fetch `{{registryHost}}/r/index.json`, then `{{registryHost}}/r/<name>.json` or `{{registryHost}}/r/<name>.md`. Follow `requires` recursively. Each `files[].path` is relative to the source root; `files[].content` is the exact source. Each example lists its own `requires` and `packages`; install these too when using that example. Do not copy the example file as the component implementation. The CLI handles dependency ordering and theme installation for you.

The component reference states its source. `{{registryHost}}/r/audit.json` records the reference basis for all components. Many components come straight from Mireye's Figma identity (the product UI boards, 442:2); the rest extend its patterns because the design has no standalone equivalent (menus, dialogs, calendars). Each reference says which. Do not describe extensions as exact copies of the design.

## Compose the interface

- Follow the user's brief. For new pages, add the required content and behavior. When only restyling an existing page, preserve its content, links, order and behavior unless the user requests changes.
- Use component props and variants shown in the source. Read the named example functions before composing compound components. Keep client state inside a client component when using Next.js; imports of client components can still be rendered by server pages.
- Apply color tokens by component and state (primary action, field, panel, selected, invalid), using the component reference. The restyle installs the color definitions and Tailwind aliases, then maps identified uses. Preserve shared palette definitions, chart data, artwork, gradients and unrelated colors; do not replace every occurrence of a color or repurpose a shared variable. Leave ambiguous dynamic styling for review.
- `init`, `add` and restyle install the complete token set: colors, typography, spacing, layout, radii, shadows, blur and motion. Tailwind utilities read those variables, including fractional spacing, font weights and transition durations. Keep shared values in these tokens so edits remain consistent across components.
- Use design tokens for custom styles. `{{cli}} brand tokens --json` lists every group. `{{cli}} brand tokens --group color --json` is one group. `{{cli}} brand tokens --name --ds-color-bone --json` is one token and errors if the name is unknown. `{{cli}} tokens <term> --json` searches by substring. `{{cli}} look <element-or-file> --json` explains styling by role. Use `var(--ds-*)` in CSS or the matching Tailwind utilities. Do not invent a token name.
- Every word is Gilroy, Regular or Medium: 13px for body and controls, 12px for labels and chips, 16 to 24px regular for titles. Coordinates, IDs, values and code are DM Mono. Use the Forest cut key for the one main action, Bone cut frames with 1px Stone lines for fields, cards and panels, diamonds and ticks for state, and the Bone ground. Nothing is rounded and nothing casts a shadow. Do not introduce unrelated colors, shadows or type scales.
- Icons are Phosphor at the regular weight (`@phosphor-icons/react`, from `@phosphor-icons/react/ssr` in server components; `phosphor-react-native` in native apps), plus Mireye's own arrow, check, plus and parcel glyphs from the library. Status and progress never get icons: use Diamond and Ticks. Do not add another icon library.
- The installed stylesheet imports `./_{{bin}}/brand.css` and `./_{{bin}}/theme.css` beside the main stylesheet. `brand.css` includes tokens and base styles. Keep both imports after `@import "tailwindcss"`. Let the installer configure fonts; do not add a second font loader.
- Put one control in each Field. Field connects labels, help, errors and required state. Validation and submission belong to your form. For Select use `value` and `onValueChange`, SelectTrigger with SelectValue, and SelectContent with SelectItem; values must be non-empty strings. Give the root a `name` for FormData. Use `defaultValue` only for uncontrolled input.
- Connect every action to its intended behavior. Handle empty, loading, disabled, invalid, success and error states. Preserve keyboard controls, focus return, accessible names and native form semantics. Never present a preview's local demo action as a completed backend operation.
- Use the provided portal behavior. Surface is for an isolated preview or a scoped theme; ordinary pages do not need an extra Surface wrapper. Mount one Toaster per application when using toast notifications.

## Read the brand system

These commands only report what is in the brand files. A missing font file, wordmark or clear-space rule is reported as missing. Do not fill the gap.

```sh
{{cli}} brand --json
{{cli}} brand tokens --group color --json
{{cli}} brand tokens --group type --json
{{cli}} brand tokens --group spacing --json
{{cli}} brand tokens --group radii --json
{{cli}} brand tokens --group motion --json
{{cli}} brand fonts --json
{{cli}} brand logos --json
{{cli}} brand voice --json
```

Groups are `color`, `type`, `spacing`, `radii`, `motion` and `other`. Radius tokens are 0. The cut-corner sizes live in the radii group as `--ds-cut`. Voice includes the banned words. Logos are the files in `brand/logo` plus the sentences in the brand files that mention the mark.

## Read the design rules

Product and website share one look. Query either surface. `site` means the website.

```sh
{{cli}} principles --json
{{cli}} principles product --json
{{cli}} principles website --json
```

Follow the returned `do` and `dont` lists. Do not add a rule that is not in the response.

## Render images

The CLI renders Open Graph and social images from the brand tokens, the brand fonts and the logo. It does not open a browser. Use it for link previews and posts instead of inventing a layout or fetching a different font.

```sh
{{cli}} image --list --json
{{cli}} image --format og --template headline --title "Parcel survey" --json
{{cli}} image --format square --template subtext --title "Site survey" --subtitle "Boundaries and access." --out ./images --json
{{cli}} image --format landscape --template frame --title "Parcel 18" --image ./screen.png --json
{{cli}} image --format portrait --template quote --quote "Read the sheet first." --attribution "Field review" --json
{{cli}} image --format og --template announcement --kicker "Field note" --title "The sheet is ready." --theme enterprise --export png,svg --json
```

`--list` is read-only. A render writes files, PNG and SVG by default, under `.ds/images` unless `--out` is set. `--json` lists each file with its pixel size. Pass copy with flags or a JSON file (`--content <file>`, or `--content -` for stdin). Flags override the file. An `image` path in that file is read relative to the file. Unknown fields in that file are an error. Long copy shrinks so it stays above the footer rule.

Formats: `og` 1200 by 630, `square` 1080 by 1080, `portrait` 1080 by 1350, `landscape` 1200 by 675. Templates: `headline`, `subtext`, `frame`, `quote`, `announcement`. Themes are the brand's own palettes (`--theme`, default on `--list`). An unknown format, template or theme is an error. `frame` places a PNG or JPEG in the cut frame; without `--image` it draws a survey plate. Keep the words plain and short. The sheet uses the brand ground, ink, type, mark and cut corner, so do not restyle the export.

## Render video

`video` renders a short clip from the same tokens, font files and logo. It does not open a browser. Each frame is an SVG, rasterized with resvg, then muxed into an APNG. The same inputs write the same bytes. There is no frame-rate flag. Timing is ten times `--ds-duration-base`, at 12 frames a second, and the clip plays once.

```sh
{{cli}} video --list --json
{{cli}} video --format square --template social --title "Parcel survey" --json
{{cli}} video --format vertical --template announcement --kicker "Field note" --title "The sheet is ready." --subtitle "Same marks, new note." --json
{{cli}} video --format landscape --template product --title "Parcel 18" --subtitle "Boundaries and access." --json
```

Formats: `square` 1080 by 1080, `vertical` 1080 by 1920 (9:16), `landscape` 1920 by 1080 (16:9). Templates: `social`, `announcement`, `product`. `--export apng` is the default. `png` writes the frames and `svg` writes the frame sources. Output goes to `.ds/videos` unless `--out` is set. Unknown formats, templates, themes and content fields are errors.

## Interaction and motion rules

- Rare triggers (onboarding, occasional feedback, celebrations) may use expressive animation. Keep it interruptible and respect reduced motion; never make an action wait for it. Repeated feedback is a frequent interaction, even if it is called a celebration.
- Tens of uses per day (hover effects, list navigation) get only subtle color, background, border-color, shadow or opacity changes, normally 100ms (the fast step). Reuse one component variant and interaction treatment for each role.
- Hundreds of uses per day, keyboard shortcuts and command palette toggles have no animation, transition or smooth-scroll wait. Use `data-ds-motion="instant"` on custom high-frequency surfaces, including portaled content. The command components already do this.
- Show press feedback on pointer-down with `:active` (or `onPointerDown` for custom drawing), never after click/touch-up. Keep the actual action on accessible click/keyboard activation. Use `touch-action: manipulation` on ordinary controls to avoid the tap delay while preserving zoom.
- Keep dimensions, padding, gaps and font metrics identical across hover, focus and pressed states. Never scale a button or change font weight from 400 to 500/600 on interaction. Change visual styling instead.
- Nothing is rounded. Every `--ds-radius-*` token is 0. The only shape is the cut corner (`ds-cut`, `ds-cut-frame`) at `--ds-cut`, `--ds-cut-sm`, `--ds-cut-md` and `--ds-cut-lg`. Small parts (checks, rows, tags, avatars) are square. Do not use a pill, a circle or a nonzero border radius.
- Panels, menus, dialogs, sheets and drawers use the cut corner and a 1px line. They do not use a shadow.
- Use shared components, size variants and spacing tokens. Equivalent sections share a gutter; equivalent controls share padding. Do not invent separate hover treatments or per-instance spacing for the same component role.
- Audit every debounce, timeout, transition wait and artificial latency. Update controlled inputs and local filtering immediately. Debounce only necessary network/background work, with immediate local feedback and stale-result cancellation. Never wait for an exit animation before accepting input or opening the next view.
- `check` reports UI timers for review. Remove artificial waits. For an essential nonblocking timer, put `// ds-latency: <specific reason>` immediately above the call, explaining what it delays and why typing/actions remain immediate. This documents an audit, not a general exemption for delayed input.
- Verify in a browser with motion enabled and reduced motion: hold a pointer down before release, type rapidly, toggle the command palette and shortcuts repeatedly, compare bounds and font weight before/after hover and press, and check consistent section/component padding. Static checks cannot establish actual usage frequency or timing by themselves.

## Verify before finishing

1. Run the consuming project's type checks, tests and production build.
2. Run `{{cli}} check --json`. Exit 0 means no detected token or interaction violations; exit 1 means unresolved violations or a command error. Read the JSON result, fix the findings and rerun. Static checks do not replace accessibility and interaction testing.
3. Test every interaction with mouse and keyboard. Submit invalid and valid forms, choose options, open and close overlays, and test loading/error paths. Check desktop and phone widths, focus visibility, overflow and reduced-motion behavior.
4. Compare screenshots against the relevant library previews and reference. `{{cli}} review http://localhost:3000 --any` can capture and review a running page. It requires playwright-core and Chromium. Automated scoring uses an available supported reviewer; if none is available, read the saved screenshots and report a manual review. Never claim an independent score that was not produced.
5. Report what changed, which checks passed, and any remaining limitations. If conversion left follow-up tasks, complete or report them explicitly.

## Instructions and hooks

`init` and conversion install AGENTS.md and a local `.ds/agent-guide.md`, plus supported agent instruction files and hook configuration. Agents that do not load those files automatically should read them explicitly. Hooks support Claude Code, Codex and Cursor when enabled by that tool; other agents run the CLI checks directly. Codex hook activation may require the user's `/hooks` trust step. No hook integration is required to use the components correctly.

Read-only commands: `manifest`, `describe`, `guide`, `brand` and its subcommands, `principles`, `component list`, `component inspect`, `component emit`, `list`, `show`, `look`, `tokens`, `check` without `--fix`, `image --list` and `video --list`.
Commands that write project files: `init`, `add`, `apply`, the legacy bare conversion command, `check --fix`, `image` (PNG and SVG), `video` (APNG, and frame PNG or SVG when asked), and review/snapshot state updates. Use `--dry-run` with `init`, `add` or conversion to inspect planned writes. JSON goes to stdout and progress goes to stderr. A validation error with `--json` is `{"ok":false,"error":"..."}` and a nonzero exit. Installation/build failures return a nonzero exit code.

## Project configuration and agent handoff

Start with `{{cli}} manifest --json`, then `{{cli}} info --json`, `search <term> --json` and `view <names...> --json`. These commands are read-only. `show` and `inspect` remain aliases of `view`. `component inspect` is the props and states view and does not install anything.

`add` respects components.json, inherited TypeScript or JavaScript aliases, the target stylesheet and the package manager. It emits JSX/JS when `tsx` is false, installs the theme and agent guidance, and preserves differing local files. Use `add <names...> --diff` to review changes before `--overwrite`. Use `--cwd <app>` from a repository root. For shared workspace packages, use the upstream installer described below.

`create --template vite --name <directory>` scaffolds a new app and installs brand components. `init` configures an existing app; `init button card` also adds components. `apply --dry-run --json` previews a requested conversion of existing styles. Do not run conversion to discover or install the library.

Portable skills are installed in `.agents/skills/{{bin}}/SKILL.md` and `.claude/skills/{{bin}}/SKILL.md`; the full guide is `.ds/agent-guide.md`. Read `add --view` or the installed source for imports resolved to this project's paths. The installed brand utility is separate from the application's existing `lib/utils` exports.

The standard shadcn registry is configured under `@{{bin}}` in components.json. For workspace routing, install with `{{cli}} shadcn add @{{bin}}/theme @{{bin}}/button`. Include the theme explicitly with upstream shadcn so existing font and color aliases are updated. Native `add` applies it automatically.

Advanced operations use pinned shadcn 4.22.1: `shadcn <args...>`, `mcp`, `registry`, `preset`, `migrate`, `eject`, and `build`. These need network access on first use and preserve upstream output formats. Native brand commands accept `--json`. Preset/base changes are upstream operations that may change the brand; use them only when requested. MCP configuration alone does not prove the agent host has loaded its server.

The explicit `apply` command scopes color conversion to recognized components and preserves unrelated artwork and shared palette data. The legacy bare-command conversion remains for compatibility; use `apply` for new restyling tasks.
