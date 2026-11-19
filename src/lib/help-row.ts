/** One row of help or list text: a name, then what it is in a column. A name too long for the column puts its
 * description on the next line, aligned, instead of running into it. */
export function helpRow(name: string, what: string, width: number, indent = '  '): string {
	if (!what) return `${indent}${name}`;
	return name.length < width ? `${indent}${name.padEnd(width)}${what}` : `${indent}${name}\n${indent}${' '.repeat(width)}${what}`;
}
