import { execFileSync } from 'node:child_process';
import { chmodSync, existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, isAbsolute, join, relative, resolve } from 'node:path';
import { brand, cli } from '../lib/brand.js';
import { agentGuide } from '../lib/guide.js';
import { PKG_ROOT, pkgPath } from '../lib/paths.js';
import { type Writer, upsertBlock } from './files.js';

// What keeps agents on the brand: a short contract in the files every agent reads, and hooks that check each write
// (Claude Code, Codex, Cursor), plus a git pre-commit check for everyone.

export type Harness = 'claude-code' | 'codex' | 'cursor';
const START = '<!-- ds:contract:start -->';
const END = '<!-- ds:contract:end -->';

/** The agent running this command, from the variables each sets in its shell. Codex first: it inherits CLAUDECODE. */
export function runningHarness(env = process.env): Harness | undefined {
	if (env.CODEX_THREAD_ID || env.CODEX_SESSION_ID) return 'codex';
	if (env.CLAUDECODE) return 'claude-code';
	if (env.CURSOR_AGENT || env.CURSOR_TRACE_ID) return 'cursor';
	return undefined;
}

export const contract = () => readFileSync(pkgPath('brand', 'contract.md'), 'utf8').replaceAll('{{brand}}', brand().name).replaceAll('{{cli}}', cli()).trim();

/** The git work tree's top folder, or undefined outside git. */
export function gitTop(root: string) {
	try {
		return execFileSync('git', ['rev-parse', '--show-toplevel'], { cwd: root, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim() || undefined;
	} catch {
		return undefined;
	}
}

const posixPath = (p: string) => p.split('\\').join('/');

/**
 * The folder whose node_modules holds the project's copy of the CLI: the project's own, or a workspace root above it
 * (a monorepo hoists it there). Paths written into hooks are relative to it, so they work on every clone.
 */
function binHome(root: string) {
	const bin = brand().bin;
	const top = gitTop(root);
	for (let dir = resolve(root); ; dir = dirname(dir)) {
		if (existsSync(join(dir, 'node_modules', bin, 'bin.js'))) return dir;
		if (dir === dirname(dir) || (top && resolve(dir) === resolve(top))) return undefined;
	}
}

/** How each harness finds the project's copy of the CLI from the directory it runs hooks in. */
export function binCommand(root: string, harness: Harness | 'other') {
	const bin = brand().bin;
	const home = binHome(root);
	if (!home) return `node "${join(PKG_ROOT, 'bin.js')}"`;
	const up = posixPath(relative(root, home));
	const fromRoot = `${up ? `${up}/` : ''}node_modules/${bin}/bin.js`;
	if (harness === 'claude-code') return `node "$CLAUDE_PROJECT_DIR/${fromRoot}"`;
	if (harness === 'cursor') return `node "$CURSOR_PROJECT_DIR/${fromRoot}"`;
	const top = gitTop(root);
	if (harness === 'codex') {
		const fromTop = top ? posixPath(relative(top, home)) : '';
		return `node "$(git rev-parse --show-toplevel 2>/dev/null || pwd)/${fromTop ? `${fromTop}/` : ''}node_modules/${bin}/bin.js"`;
	}
	return `node ${fromRoot}`;
}

function mergeHooks(existing: any, cmd: string, harness: 'claude-code' | 'codex') {
	const settings = existing ?? {};
	settings.hooks ??= {};
	const ours = (c: string) => c.includes(' hook ') && (c.includes(brand().bin) || c.includes('bin.js'));
	const events: [string, string | undefined, string, number][] = [
		['SessionStart', undefined, 'session-start', 10],
		['UserPromptSubmit', undefined, 'user-prompt-submit', 10],
		['PreToolUse', harness === 'codex' ? 'apply_patch|Edit|Write' : 'Write|Edit|MultiEdit', 'pre-tool-use', 20],
		['Stop', undefined, 'stop', 120],
	];
	for (const key of Object.keys(settings.hooks)) {
		settings.hooks[key] = (settings.hooks[key] ?? []).map((g: any) => ({ ...g, hooks: (g.hooks ?? []).filter((h: any) => !ours(String(h.command ?? ''))) })).filter((g: any) => g.hooks.length);
		if (!settings.hooks[key].length) delete settings.hooks[key];
	}
	for (const [event, matcher, name, timeout] of events) {
		settings.hooks[event] = [...(settings.hooks[event] ?? []), { ...(matcher ? { matcher } : {}), hooks: [{ type: 'command', command: `${cmd} hook ${name}${harness === 'codex' ? ' --harness codex' : ''}`, timeout }] }];
	}
	return settings;
}

export function installAgents(w: Writer) {
	const text = contract();
	const skill = readFileSync(pkgPath('brand', 'skill.md'), 'utf8').replaceAll('{{brand}}', brand().name).replaceAll('{{bin}}', brand().bin).replaceAll('{{source}}', brand().source).replaceAll('{{registry}}', brand().registryUrl ?? '');
	for (const directory of ['.agents/skills', '.claude/skills']) w.write(`${directory}/${brand().bin}/SKILL.md`, skill);
	w.write('.ds/agent-guide.md', `${agentGuide()}\n`);
	for (const rel of ['GEMINI.md', '.github/copilot-instructions.md']) w.write(rel, upsertBlock(w.read(rel) ?? '', text, START, END));
	// A CLAUDE.md that only imports AGENTS.md gets the contract through it.
	const claude = w.read('CLAUDE.md');
	if (claude === undefined && w.read('AGENTS.md') !== undefined) w.write('CLAUDE.md', '@AGENTS.md\n');
	const importsAgents = /^@AGENTS\.md\s*$/m.test(w.read('CLAUDE.md') ?? '');
	for (const rel of importsAgents ? ['AGENTS.md'] : ['CLAUDE.md', 'AGENTS.md']) w.write(rel, upsertBlock(w.read(rel) ?? '', text, START, END));
	// Agents that read their own file first when it exists (Hermes: .hermes.md before AGENTS.md; Gemini: GEMINI.md).
	for (const rel of ['.hermes.md', 'HERMES.md']) if (w.read(rel) !== undefined) w.write(rel, upsertBlock(w.read(rel)!, text, START, END));
	w.write('.cursor/rules/ds.mdc', `---\ndescription: ${brand().name} design system\nalwaysApply: true\n---\n\n${START}\n${text}\n${END}\n`);
	w.write('.claude/settings.json', `${JSON.stringify(mergeHooks(w.json('.claude/settings.json'), binCommand(w.root, 'claude-code'), 'claude-code'), null, 2)}\n`);
	w.write('.codex/hooks.json', `${JSON.stringify(mergeHooks(w.json('.codex/hooks.json'), binCommand(w.root, 'codex'), 'codex'), null, 2)}\n`);
	const cursor = w.json('.cursor/hooks.json') ?? { version: 1, hooks: {} };
	cursor.hooks ??= {};
	const strip = (list: any[] = []) => list.filter((h) => !String(h.command ?? '').includes(' hook '));
	cursor.hooks.preToolUse = [...strip(cursor.hooks.preToolUse), { command: `${binCommand(w.root, 'cursor')} hook pre-tool-use --harness cursor`, matcher: 'Write|Edit|MultiEdit|StrReplace|apply_patch', timeout: 20 }];
	cursor.hooks.stop = [...strip(cursor.hooks.stop), { command: `${binCommand(w.root, 'cursor')} hook stop --harness cursor`, loop_limit: 5 }];
	w.write('.cursor/hooks.json', `${JSON.stringify(cursor, null, 2)}\n`);
	installPreCommit(w);
	const gitignore = w.read('.gitignore') ?? '';
	const ignore = ['.ds/session.json', '.ds/review/', '.ds/hooks.log'].filter((l) => !gitignore.split('\n').includes(l));
	if (ignore.length) w.write('.gitignore', `${gitignore.trimEnd()}\n${ignore.join('\n')}\n`.replace(/^\n/, ''));
}

/** The check in .git/hooks/pre-commit. Git does not share that folder, so session start puts it back on a fresh clone. */
export function installPreCommit(w: Writer) {
	const top = gitTop(w.root);
	if (!top) return;
	let hooks: string;
	try {
		hooks = execFileSync('git', ['rev-parse', '--git-path', 'hooks'], { cwd: w.root, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();
	} catch {
		return;
	}
	const file = join(isAbsolute(hooks) ? hooks : resolve(w.root, hooks), 'pre-commit');
	// Git runs the hook at the top of the work tree; an app in a subfolder (a monorepo's apps/web) checks from its own folder,
	// in its own block, so each app in the repository keeps its check.
	const app = posixPath(relative(top, w.root));
	const command = `${binCommand(w.root, 'other')} check --changed || { echo "${cli()} check failed. Fix the errors above before committing."; exit 1; }`;
	const block = app ? `(cd ${JSON.stringify(app)} && ${command}) || exit 1` : command;
	const existing = existsSync(file) ? readFileSync(file, 'utf8') : '#!/bin/sh\n';
	const next = upsertBlock(existing.startsWith('#!') ? existing : `#!/bin/sh\n${existing}`, block, `# ds:pre-commit${app ? `(${app})` : ''}:start`, `# ds:pre-commit${app ? `(${app})` : ''}:end`);
	if (next === existing) return;
	const rel = posixPath(relative(w.root, file));
	w.changes.push({ file: rel, action: existsSync(file) ? 'patched' : 'wrote' });
	if (w.dryRun) return;
	mkdirSync(dirname(file), { recursive: true });
	writeFileSync(file, next);
	chmodSync(file, 0o755);
}
