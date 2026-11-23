---
name: {{bin}}
description: Build or restyle interfaces with the {{brand}} design system. Use when the project uses {{bin}} or the user requests {{brand}} components, tokens, or visual styling.
---

Use the project's configured components and brand tokens. Preserve the user's requested content and behavior.

Read project context with `npx {{bin}} manifest --json`, then `npx {{bin}} info --json`. Manifest lists every command, template, size, component and rule. Info reports the framework, stylesheet, aliases, installed components and registry. If the CLI is missing, use `npx -y {{source}}` in its place. Do not guess a name that manifest does not list.

Find suitable components with `component list --json` or `search <term> --json`, then read `component inspect <name> --json` and `view <names...> --json`. Emit example markup with `component emit <name> --state <State> --json`. The response contains exact source and working examples. Inspect variant names, callback signatures and example dependencies instead of assuming another library's API. An unknown component or state is an error.

Read tokens with `brand tokens --group <color|type|spacing|radii|motion> --json`, fonts with `brand fonts --json`, logos with `brand logos --json`, and voice with `brand voice --json`. Read product and website rules with `principles --json`. Product and website share one look. Radius tokens are 0. The shape is the cut corner.

Install with `add <names...> --dry-run --json`, then `add <names...> --json`. Existing local files are preserved. Use `add <names...> --diff` to compare updates; use `--overwrite` only when replacing those local changes is intended.

For new applications, `create --template vite --name <directory>` scaffolds the framework and installs the brand. Existing applications use `init`. Use `apply --dry-run` only when the user requests conversion of existing styles; package installation and restyling are different operations.

Read `guide` for brand rules and `tokens <term> --json` for custom styling. Keep colors scoped to component roles; preserve artwork, chart data and unrelated palettes. Use `check --json` and the application's build and interaction tests to verify the result.

Make share images and social posts with `npx {{bin}} image --list --json`, then `npx {{bin}} image window --size og --headline "..." --json`. Every template draws at every size (og, square, portrait, story, landscape, x-banner, linkedin, linkedin-banner, linkedin-page, youtube, youtube-thumbnail, email, avatar, custom) and ground (bone, green, brown, black), keeping clear of what each platform covers. Only the words passed are drawn, whole; too many words is an error that says what to shorten. Do not invent a separate social layout.

Revising a design: when the person will want changes, `npx {{bin}} design new <template> -o banner.design.json`, look at the PNG, then `design revise banner.design.json "darker theme, logo top right"` or `design edit` with exact flags, and repeat until they are happy. Every write is checked and an error changes nothing. Never hand-edit the PNG or SVG. `design help --json` lists templates, layers, phrases and rules.

Render a short video with `npx {{bin}} video --list --json`, then `npx {{bin}} video --format square --template social --title "..." --json`. Templates: social, announcement, product, poster (`--poster <layout>`). APNG by default, `--export mp4,webm,still` through ffmpeg. The same inputs write the same bytes. There is no frame-rate flag.

Slides: `npx {{bin}} deck --list --json`, then `deck --input deck.json` (a PNG per slide and one PDF). Merch: `npx {{bin}} merch --list --json`, then `merch <item> --variant <id>` (print files with bleed; sizes are vendor conventions). Illustrations: `npx {{bin}} illustrate --list --json`, then `illustrate <scene>` or `illustrate --image <file>`; rules in `brand/illustration.md`. Figma: `npx {{bin}} figma tokens|push|pull|check`; the CLI writes files and prints the Figma MCP calls, it never calls Figma. Pages, sections and app shells are library items of type block (`component list --json`).

The standard shadcn registry is `{{registryHost}}/r/shadcn/{name}.json`, under `@{{bin}}` in components.json. Use `npx shadcn@4.22.1 add @{{bin}}/theme @{{bin}}/<name>` for shadcn's workspace routing and ecosystem integrations. The same registry works with its MCP server. Component references are at `{{registry}}/components`.

With the upstream installer, include the theme explicitly so existing shadcn font and color aliases are updated. Native add applies it automatically.
