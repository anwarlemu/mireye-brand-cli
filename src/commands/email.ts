import { mkdirSync, readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import type { Command } from 'commander';
import { EMAIL_KINDS, emailHtml, emailSample, type EmailInput, type EmailKind } from '../email/email.js';
import { writeFile, type OutFile } from '../image/output.js';
import { rasterize } from '../image/encode.js';
import { lockupSvg, lockupWidth } from '../image/logo.js';
import { loadFaces } from '../image/type.js';
import { defaultTheme, tokenHex } from '../image/catalog.js';
import { cli } from '../lib/brand.js';
import { pickName } from '../lib/names.js';
import { emit } from '../lib/output.js';
import { findProjectRoot } from '../lib/paths.js';

type Opts = { input?: string; sample?: boolean; out?: string; theme?: string; list?: boolean; json?: boolean };

export async function emailRun(kindArg: string | undefined, o: Opts) {
	if (o.list || !kindArg) {
		const data = { schemaVersion: 1, kinds: EMAIL_KINDS.map((k) => ({ id: k, sample: emailSample(k) })) };
		emit(o, data, () => [...EMAIL_KINDS.map((k) => `  ${k}`), '', `Run \`${cli()} email newsletter --input newsletter.json\` (see --list --json for each kind's fields), or --sample.`].join('\n'));
		return;
	}
	const kind = pickName('email', kindArg, [...EMAIL_KINDS]) as EmailKind;
	if (!o.input && !o.sample) throw new Error(`Pass --input ${kind}.json or --sample.`);
	let input: EmailInput = emailSample(kind);
	if (o.input) {
		try {
			input = JSON.parse(readFileSync(resolve(o.input), 'utf8')) as EmailInput;
		} catch (error) {
			throw new Error(`Could not read ${o.input} as JSON (${(error as Error).message}).`);
		}
	}
	// Checked whole before anything is written: a refused email leaves no files behind.
	const own = !input.logo;
	const html = emailHtml(kind, own ? { ...input, logo: 'logo.png' } : input, o.theme);
	const dir = resolve(o.out ?? join(findProjectRoot(), '.ds', 'email'));
	mkdirSync(dir, { recursive: true });
	const files: OutFile[] = [writeFile(join(dir, `${kind}.html`), html, 'html', 600, 0)];
	if (own) {
		// The lockup as a picture beside the email: host it with the email, or pass "logo" as its full address.
		const f = loadFaces();
		const mh = 48;
		const w = Math.ceil(lockupWidth(f.sans, mh));
		const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${mh}" viewBox="0 0 ${w} ${mh}">${lockupSvg(f.sans, 0, 0, mh, tokenHex('--ds-color-text-default', o.theme ?? defaultTheme())).svg}</svg>`;
		files.push(writeFile(join(dir, 'logo.png'), await rasterize(svg, w), 'png', w, mh));
	}
	emit(o, { schemaVersion: 1, ok: true, kind, files }, () => files.map((f) => f.path).join('\n'));
}

export function registerEmail(program: Command) {
	program
		.command('email [kind]')
		.description('Emails as plain HTML tables that survive email clients: newsletter, announcement, receipt, password-reset, signature')
		.option('--list', 'the kinds and their fields')
		.option('--input <file>', 'the email as JSON (see --list --json)')
		.option('--sample', 'sample words (replace every one)')
		.option('--theme <id>', 'a brand theme')
		.option('--out <dir>', 'output directory (default: .ds/email in the project)')
		.option('--json', 'JSON output')
		.action((kind: string | undefined, _o, command: Command) => emailRun(kind, command.optsWithGlobals() as Opts));
}
