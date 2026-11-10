# Using this CLI

This package is the Mireye design system. An agent that is handed the CLI, or this repo, builds UI from the CLI. It does not invent tokens, components, templates or sizes.

## First command

```sh
npx mireye-ds manifest --json
```

`describe` prints the same document. It lists every command, token group, image format and template, video format and template, component (with example states) and the principle surfaces. If a template, size, component, token or option is not in that document, it does not exist. `theme` is the one generated item: install it with `add theme`. It is not a component and has no example to emit.

Pass `--json` on agent-facing commands. JSON goes to stdout. A bad name or option exits 1 with `{"ok":false,"error":"..."}`. The CLI does not substitute a nearby name.

## What to run

| Need | Command |
|---|---|
| Tokens | `npx mireye-ds brand tokens --group color --json` (also `type`, `spacing`, `radii`, `motion`, `other`) |
| One token | `npx mireye-ds brand tokens --name --ds-color-bone --json` |
| Fonts | `npx mireye-ds brand fonts --json` |
| Logos and the usage rules that exist | `npx mireye-ds brand logos --json` |
| Voice and banned words | `npx mireye-ds brand voice --json` |
| Product rules | `npx mireye-ds principles product --json` |
| Website rules | `npx mireye-ds principles website --json` |
| Component props and states | `npx mireye-ds component inspect button --json` |
| Example markup | `npx mireye-ds component emit button --state Preview --json` |
| Install a component | `npx mireye-ds add button --dry-run --json` |
| Social or Open Graph image | `npx mireye-ds image --list --json` |
| Short video | `npx mireye-ds video --list --json` |
| Full workflow | `npx mireye-ds guide` |

Product and website share one look. Radius tokens are 0. The only shape is the cut corner. Gilroy is the sans face and DM Mono is the mono face. The only logo file is `brand/logo/mark.svg`. There is no wordmark file and no clear-space rule in the repo. Do not invent either.

Images: `og` 1200 by 630, `square` 1080 by 1080, `portrait` 1080 by 1350, `landscape` 1200 by 675. Templates: `headline`, `subtext`, `frame`, `quote`, `announcement`.

Video: `square` 1080 by 1080, `vertical` 1080 by 1920, `landscape` 1920 by 1080. Templates: `social`, `announcement`, `product`. The file is an APNG rendered from the brand tokens, font files and logo. Timing is fixed. The same inputs write the same bytes.

`component emit` copies an example from `registry/examples`. Helpers with no example, such as `utils`, have nothing to emit. Read `component inspect` and do not write a substitute.

## Working on this repo

`CLAUDE.md` is the harness guide. `npm run ci` must pass. Do not put the brand name or the bin name in `src/`. Sample images and videos live in `samples/`.
