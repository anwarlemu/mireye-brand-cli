import type { Command } from 'commander';
import { brandOverview, fontCatalog, logoCatalog, tokenByName, tokenCatalog, voiceCatalog } from '../brand/system.js';
import { cli } from '../lib/brand.js';
import { emit } from '../lib/output.js';

export function brandCommand(program: Command) {
	const brand = program.command('brand').description('Read tokens, fonts, logos and voice from the brand files');
	brand.option('--json', 'JSON output').action((_opts, command) => {
		const data = brandOverview();
		emit(command.optsWithGlobals(), data, () => [`${data.name}`, `Token groups: ${data.tokenGroups.map((group) => `${group.id} (${group.count})`).join(', ')}`, `Sans: ${data.fonts.sans ?? 'missing'}`, `Mono: ${data.fonts.mono ?? 'missing'}`, `Logos: ${data.logos.join(', ') || 'none'}`, `Voice bans: ${data.voice.banned.join(', ')}`, ...(data.logoGaps.length ? data.logoGaps : []), `Run \`${cli()} brand tokens --json\`.`].join('\n'));
	});
	brand.command('tokens').description('List token groups or one token').option('--group <id>', 'color, type, spacing, radii, motion or other').option('--name <token>', 'one token, exact').option('--json', 'JSON output').action((_opts, command) => {
		const opts = command.optsWithGlobals();
		if (opts.group && opts.name) throw new Error('Pass --group or --name, not both.');
		if (opts.name) {
			const data = tokenByName(opts.name);
			emit(opts, data, () => `${data.token}  ${data.value}  (${data.group})`);
			return;
		}
		const data = tokenCatalog(opts.group);
		emit(opts, data, () => {
			const groups = opts.group ? [opts.group as string] : Object.keys(data.tokens);
			return groups.map((group) => [`${group}`, ...Object.entries(data.tokens[group] ?? {}).map(([token, value]) => `  ${token.padEnd(36)} ${value}`)].join('\n')).join('\n\n');
		});
	});
	brand.command('fonts').description('List the font files and their licenses').option('--json', 'JSON output').action((_opts, command) => {
		const data = fontCatalog();
		emit(command.optsWithGlobals(), data, () => [`Sans: ${data.sans.family ?? 'missing'}`, ...data.sans.files.map((file) => `  ${file.weight}  ${file.path}  ${file.present ? 'present' : 'MISSING'}`), `Mono: ${data.mono.family ?? 'missing'}`, ...data.mono.files.map((file) => `  ${file.weight}  ${file.path}  ${file.present ? 'present' : 'MISSING'}`), data.sans.license ?? '', data.mono.license ?? ''].filter(Boolean).join('\n'));
	});
	brand.command('logos').description('List logo files and the usage rules that are actually in the repo').option('--json', 'JSON output').action((_opts, command) => {
		const data = logoCatalog();
		emit(command.optsWithGlobals(), data, () => [...data.files.map((file) => `${file.path}  ${file.viewBox ?? file.format}`), ...data.usage.map((rule) => `- ${rule.text} (${rule.source})`), ...data.notInRepo].join('\n'));
	});
	brand.command('voice').description('Read voice and the banned words').option('--json', 'JSON output').action((_opts, command) => {
		const data = voiceCatalog();
		emit(command.optsWithGlobals(), data, () => [data.text, '', `Banned: ${data.banned.join(', ')}`].join('\n'));
	});
}
