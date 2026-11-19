import { appendFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { Command } from 'commander';
import { review, snapshot } from './commands/review.js';
import { run } from './commands/run.js';
import { guide } from './commands/guide.js';
import { workflow } from './commands/workflow.js';
import { imageCommand } from './commands/image.js';
import { brandCommand } from './commands/brand.js';
import { principlesCommand } from './commands/principles.js';
import { componentCommand } from './commands/component.js';
import { videoCommand } from './commands/video.js';
import { manifestCommand } from './commands/manifest.js';
import { registerIllustrate } from './commands/illustrate.js';
import { registerDeck } from './commands/deck.js';
import { approve, check, done, look, skip, tokensCommand } from './commands/small.js';
import { type HookResult, cursorPreToolUse, cursorStop, preToolUse, sessionStart, stop, userPromptSubmit } from './hooks/handlers.js';
import { readHookInput } from './hooks/payload.js';
import { brand, cli, hasProduct } from './lib/brand.js';
import { findProjectRoot } from './lib/paths.js';

const program = new Command();
// Subcommands copy these at creation, so they have to be set before any .command().
program.exitOverride();
if (process.argv.includes('--json')) program.configureOutput({ outputError: () => {} });
const b = brand();

program.name(b.bin).description(`Build ${b.name} pages and interfaces with the component library and design tokens. Use add, look, check and review during implementation.`);
// A brand with a site only styles every project as a site: no surface or theme to choose.
if (hasProduct())
	program
		.option('--surface <surface>', 'site (pages people read) or product (an app people work in); default: read from the project')
		.option('--theme <theme>', 'product only: light (default) or dark');
program
	.option('--redo', 'convert the project again (after an update, or after reverting)')
	.option('--dry-run', 'show what would change, write nothing')
	.option('--no-install', 'do not add the package to the project when run through npx')
	.option('--json', 'JSON output')
	.action((opts) => run(opts));

program.command('guide').description('Read the portable agent workflow').action((_opts, command) => guide(command.optsWithGlobals()));
program.command('manifest').description('List every capability, template, size, component and rule').option('--json', 'JSON output').action((_opts, command) => manifestCommand(command.optsWithGlobals()));
program.command('describe').description('Alias of manifest').option('--json', 'JSON output').action((_opts, command) => manifestCommand(command.optsWithGlobals()));
program.command('principles [surface]').description('Read product and website design rules').option('--surface <surface>', 'product or website (site is the website)').option('--json', 'JSON output').action((surface: string | undefined, _opts, command) => principlesCommand(surface ?? command.optsWithGlobals().surface, command.optsWithGlobals()));

program.command('review [url]').description('Screenshot a page at desktop and phone width and score it against the brand; a task is done when it passes').option('--threshold <n>', 'minimum score').option('--submit <dir>', 'record the scorecard an agent wrote itself (when no separate reviewer is available)').option('--all', 'review every task screen that is not done yet, at once (pass the app\'s address)').option('--any', 'review a page that is not a task').option('--json', 'JSON output').action((url, _opts, command) => review(url, command.optsWithGlobals()));
program.command('look [target]').description('The brand styling (CSS, Tailwind, states) for every element in a file, or for one element kind').option('--surface <surface>', 'site or product').option('--json', 'JSON output').action((target, _opts, command) => look(target, command.optsWithGlobals()));
program.command('check [files...]').description('Check component colors and style tokens (used by hooks, pre-commit and CI)').option('--fix', 'apply safe token fixes').option('--changed', 'only files changed in git').option('--all', 'also check files outside the applied selection').option('--json', 'JSON output').action((files, _opts, command) => check(files ?? [], command.optsWithGlobals()));
program.command('tokens [term]').description('Find a brand token by name or value').option('--json', 'JSON output').action((term, _opts, command) => tokensCommand(term, command.optsWithGlobals()));
program
	.command('image')
	.description('Render a share image or social post (PNG and SVG) from the brand layouts, tokens, type and logo')
	.option('--list', 'list sizes, templates, grounds and themes')
	.option('--size <id>', 'og, square, portrait, landscape, story, x-banner, linkedin-banner, ... (see --list)')
	.option('--format <id>', 'same as --size')
	.option('--template <id>', 'a poster (window, post, parcels, ...) or a sheet (headline, quote, ...)')
	.option('--ground <id>', 'posters: bone (default), green, brown or black')
	.option('--theme <id>', 'a brand theme (see --list)')
	.option('--title <text>', 'headline')
	.option('--subtitle <text>', 'the line under it')
	.option('--kicker <text>', 'short label above an announcement')
	.option('--quote <text>', 'quotation')
	.option('--attribution <text>', 'who said the quotation')
	.option('--image <path>', 'your PNG or JPEG (frame and photo)')
	.option('--callout <text>', 'parcels and photo: the tag, two lines (what, then where)')
	.option('--chart <rows>', 'chart: one row a line, "label | number"')
	.option('--partner <name>', 'partner: the partner\'s name')
	.option('--scene <id>', 'post and panel: a wireframe scene; scene: an isometric preset')
	.option('--footer <text>', 'sheet footer line (defaults to the brand site)')
	.option('--sample', 'posters: fill unset words with the sample copy (replace it)')
	.option('--content <file>', 'JSON file of the same fields, or - for stdin; flags override it')
	.option('--out <dir>', 'output directory (default: .ds/images in the project)')
	.option('--name <base>', 'file name without an extension')
	.option('--export <kinds>', 'png, svg, or png,svg', 'png,svg')
	.option('--json', 'JSON output listing the files written')
	.addHelpText('after', () => `\nExamples:\n  ${cli()} image --list --json\n  ${cli()} image --size og --template window --title "Physical world context for AI agents." --json\n  ${cli()} image --size portrait --template post --title "Residential land" --subtitle "Every field cited." --scene residential\n  ${cli()} image --size story --template parcels --ground green --sample\n  ${cli()} image --size x-banner --template identity\n  ${cli()} image --size landscape --template photo --title "Central Iowa" --image ./aerial.jpg\n  ${cli()} image --size og --template headline --title "Parcel survey"\n`)
	.action((_opts, command) => imageCommand(command.optsWithGlobals()));
program
	.command('video')
	.description('Render a short on-brand video from the brand tokens, type and logo')
	.option('--list', 'list formats, templates, timing and themes')
	.option('--format <id>', 'square (1080x1080), vertical (1080x1920) or landscape (1920x1080)')
	.option('--template <id>', 'social, announcement or product')
	.option('--theme <id>', 'a brand theme (see --list)')
	.option('--title <text>', 'headline')
	.option('--subtitle <text>', 'supporting line')
	.option('--kicker <text>', 'short label above an announcement')
	.option('--footer <text>', 'footer line (defaults to the brand site)')
	.option('--content <file>', 'JSON file of the same fields, or - for stdin; flags override it')
	.option('--out <dir>', 'output directory (default: .ds/videos in the project)')
	.option('--name <base>', 'file name without an extension')
	.option('--export <kinds>', 'apng, png, svg, or a comma-separated list', 'apng')
	.option('--json', 'JSON output listing the files written')
	.addHelpText('after', () => `\nExamples:\n  ${cli()} video --list --json\n  ${cli()} video --format square --template social --title "Parcel survey" --json\n  ${cli()} video --format vertical --template announcement --kicker "Field note" --title "The sheet is ready." --subtitle "Same marks, new note."\n  ${cli()} video --format landscape --template product --title "Parcel 18" --subtitle "Boundaries and access."\n`)
	.action((_opts, command) => videoCommand(command.optsWithGlobals()));
registerIllustrate(program);
registerDeck(program);
brandCommand(program);
componentCommand(program);
program.command('approve').description('Approve ds-override comments (a person, in a terminal)').option('--all', 'approve every pending override').action((opts) => approve(opts));
program.command('snapshot [url]').description('Save how each main screen looks before hand edits (run once, with the app running); reviews compare against it').action((url) => snapshot(url));
program.command('skip <screen>').description('Leave a screen as it is when it cannot pass without changing words or elements; the person sees the reason').requiredOption('--reason <text>', 'why').action((id, opts) => skip(id, opts.reason));
program.command('done <screen>').description('Mark a native screen restyled (web screens are done when their review passes)').action((id) => done(id));

program
	.command('hook <event>')
	.description('Agent hook entry point (session-start, user-prompt-submit, pre-tool-use, stop); reads the event JSON on stdin')
	.option('--harness <name>', 'claude-code | cursor | codex', 'claude-code')
	.action((event: string, opts) => {
		const input = readHookInput();
		const root = findProjectRoot(input.cwd ?? process.env.CLAUDE_PROJECT_DIR ?? process.env.CURSOR_PROJECT_DIR ?? process.cwd());
		let result: HookResult = {};
		try {
			if (opts.harness === 'cursor') result = event === 'pre-tool-use' ? cursorPreToolUse(root, input) : event === 'stop' ? cursorStop(root, input) : {};
			else if (event === 'session-start') result = sessionStart(root, input);
			else if (event === 'user-prompt-submit') result = userPromptSubmit(root, input);
			else if (event === 'pre-tool-use') result = preToolUse(root, input);
			else if (event === 'stop') result = stop(root, input);
		} catch (error) {
			// Hooks fail open: a bug in the checker must never stop someone's work.
			process.stderr.write(`${b.bin} hook ${event} failed open: ${(error as Error).message}\n`);
			process.exit(0);
		}
		try {
			mkdirSync(join(root, '.ds'), { recursive: true });
			appendFileSync(join(root, '.ds', 'hooks.log'), `${JSON.stringify({ at: new Date().toISOString(), harness: opts.harness, event, blocked: result.exitCode === 2 || !!(result.json as any)?.decision || (result.json as any)?.permission === 'deny' })}\n`);
		} catch {}
		if (result.json) process.stdout.write(`${JSON.stringify(result.json)}\n`);
		else if (result.stdout) process.stdout.write(`${result.stdout}\n`);
		if (result.stderr) process.stderr.write(`${result.stderr}\n`);
		process.exit(result.exitCode ?? 0);
	});

workflow(program);

const fail = (error: Error & { exitCode?: number }) => {
	if (error.exitCode === 0) process.exit(0);
	if (process.argv.includes('--json')) process.stdout.write(`${JSON.stringify({ ok: false, error: error.message })}\n`);
	else process.stderr.write(`${error.message}\n`);
	process.exit(error.exitCode && error.exitCode > 0 ? error.exitCode : 1);
};
try {
	await program.parseAsync();
} catch (error) {
	fail(error as Error & { exitCode?: number });
}
