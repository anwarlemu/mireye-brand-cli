import type { Command } from 'commander';
import { componentEmit, componentInspect, componentList } from '../library/emit.js';
import { cli } from '../lib/brand.js';
import { emit } from '../lib/output.js';

export function componentCommand(program: Command) {
	const component = program.command('component').description('List, inspect and emit library components');
	component.option('--json', 'JSON output').action((_opts, command) => {
		const data = componentList();
		emit(command.optsWithGlobals(), data, () => [...data.items.map((item) => `${item.name.padEnd(28)} ${item.surface.padEnd(8)} ${item.description}`), `${data.items.length} components. \`${cli()} component inspect <name> --json\``].join('\n'));
	});
	component.command('list').description('List every component').option('--json', 'JSON output').action((_opts, command) => {
		const data = componentList();
		emit(command.optsWithGlobals(), data, () => data.items.map((item) => `${item.name.padEnd(28)} ${item.surface.padEnd(8)} ${item.description}`).join('\n'));
	});
	component.command('inspect <name>').description('Props, states, usage rules and source for one component').option('--json', 'JSON output').action((name: string, _opts, command) => {
		const data = componentInspect(name);
		emit(command.optsWithGlobals(), data, () => [`${data.title} (${data.name})`, data.description, '', `Use: ${data.useFor}`, data.never.length ? `Don't: ${data.never.join('; ')}` : '', `States: ${data.states.join(', ') || 'none'}`, `Variants: ${Object.entries(data.props.variants).map(([key, values]) => `${key}=${values.join('|')}`).join('; ') || 'none'}`, `Install: ${data.install}`, data.emit ? `Emit: ${data.emit}` : 'No example file. Do not invent markup.'].filter(Boolean).join('\n'));
	});
	component.command('emit <name>').description('Emit the example markup for one component state').option('--state <name>', 'example export, default Preview').option('--json', 'JSON output').action((name: string, _opts, command) => {
		const opts = command.optsWithGlobals();
		const data = componentEmit(name, opts.state);
		emit(opts, data, () => data.code);
	});
}
