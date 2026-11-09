declare module '@babel/plugin-transform-typescript' {
	const plugin: import('@babel/core').PluginItem;
	export default plugin;
}

/** fontkit ships no types. Imagery uses layout and glyph paths only. */
declare module 'fontkit' {
	export type Font = {
		unitsPerEm: number;
		ascent: number;
		descent: number;
		layout(text: string): {
			glyphs: { path: { toSVG(): string } }[];
			positions: { xAdvance: number; yAdvance: number; xOffset: number; yOffset: number }[];
		};
	};
	export function create(buffer: Buffer): Font;
}
