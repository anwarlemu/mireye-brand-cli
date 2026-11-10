import { principlesFor } from '../brand/principles.js';
import { emit } from '../lib/output.js';

export function principlesCommand(surface: string | undefined, opts: { json?: boolean; surface?: string }) {
	const data = principlesFor(surface ?? opts.surface);
	emit(opts, data, () => {
		const blocks: string[] = [data.note];
		const product = 'product' in data ? data.product : undefined;
		const website = 'website' in data ? data.website : undefined;
		if (product) blocks.push('', 'Product', ...product.rules.map((rule) => `- ${rule}`), '', 'Do', ...product.do.map((rule) => `- ${rule}`), '', "Don't", ...product.dont.map((rule) => `- ${rule}`));
		if (website) blocks.push('', 'Website', ...website.rules.map((rule) => `- ${rule}`), '', 'Do', ...website.do.map((rule) => `- ${rule}`), '', "Don't", ...website.dont.map((rule) => `- ${rule}`));
		if ('voice' in data && data.voice) blocks.push('', 'Voice', data.voice.text);
		return blocks.join('\n');
	});
}
