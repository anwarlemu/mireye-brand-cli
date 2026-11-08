import { existsSync, readFileSync } from 'node:fs';
import { dirname, relative, resolve } from 'node:path';
import { parse } from '@babel/parser';
import { walkFiles } from '../lib/glob.js';
import { brand } from '../lib/brand.js';
import { componentConfig, resolveAlias } from './config.js';
import type { Project } from '../project/detect.js';
import type { Writer } from './files.js';

const CHAKRA_PACKAGES = ['@chakra-ui/react', '@emotion/react'];
// The provider the CLI writes, named for the brand in brand.json (<Name>ChakraProvider).
const PROVIDER = () => `${brand().name.replace(/[^A-Za-z0-9]/g, '')}ChakraProvider`;
export const chakraPackages = () => CHAKRA_PACKAGES;
export const providerName = () => PROVIDER();

const VERSIONS: Record<string, string> = { '@chakra-ui/react': '@3.37.0', '@emotion/react': '@^11.14.0', '@emotion/cache': '@^11.14.0' };

/** The packages Chakra needs in this project: a Next App Router root also imports Emotion's cache for its server styles. */
export function missingChakraPackages(root: string, project?: Pick<Project, 'framework'>) {
	let installed: Record<string, string> = {};
	try { const pkg = JSON.parse(readFileSync(resolve(root, 'package.json'), 'utf8')); installed = { ...pkg.dependencies, ...pkg.devDependencies }; } catch {}
	const next = project ? project.framework === 'next' : !!installed.next;
	return [...CHAKRA_PACKAGES, ...(next ? ['@emotion/cache'] : [])].filter(name => !installed[name] || (name === '@chakra-ui/react' && !/^(\^|~)?3\./.test(installed[name]))).map(name => `${name}${VERSIONS[name]}`);
}

// The provider files earlier versions wrote, replaced on the next run; a provider the app edited is kept.
const plainProvider = (tsx: boolean) => `"use client";\n\nimport { ChakraProvider, createSystem, defaultConfig } from "@chakra-ui/react";\n\nconst brandSystem = createSystem(defaultConfig, { preflight: false });\n\nexport function ${PROVIDER()}({ children }${tsx ? ': { children: React.ReactNode }' : ''}) {\n  return <ChakraProvider value={brandSystem}>{children}</ChakraProvider>;\n}\n`;

// Chakra styles through Emotion, which writes <style> tags inline while the server renders; in the Next App Router that
// breaks hydration on every page. The registry collects them and hands them to useServerInsertedHTML for the head.
const nextProvider = (tsx: boolean) => {
	const t = (ts: string) => (tsx ? ts : '');
	return `"use client";

import * as React from "react";
import createCache from "@emotion/cache";
import { CacheProvider } from "@emotion/react";
import { ChakraProvider, createSystem, defaultConfig } from "@chakra-ui/react";
import { useServerInsertedHTML } from "next/navigation";

const brandSystem = createSystem(defaultConfig, { preflight: false });

// Emotion writes Chakra's styles inline while the server renders, so hydration would not match. Collect them and put
// them in the head through useServerInsertedHTML.
function EmotionRegistry({ children }${t(': { children: React.ReactNode }')}) {
  const [registry] = React.useState(() => {
    const cache = createCache({ key: "ck" });
    cache.compat = true;
    const insert = cache.insert;
    let inserted${t(': string[]')} = [];
    cache.insert = (...args) => {
      const serialized = args[1];
      if (cache.inserted[serialized.name] === undefined) inserted.push(serialized.name);
      return insert(...args);
    };
    const flush = () => {
      const names = inserted;
      inserted = [];
      return names;
    };
    return { cache, flush };
  });
  useServerInsertedHTML(() => {
    const names = registry.flush();
    if (!names.length) return null;
    const styles = names.map((name) => registry.cache.inserted[name]).filter((style) => typeof style === "string").join("");
    return <style data-emotion={\`\${registry.cache.key} \${names.join(" ")}\`} dangerouslySetInnerHTML={{ __html: styles }} />;
  });
  return <CacheProvider value={registry.cache}>{children}</CacheProvider>;
}

export function ${PROVIDER()}({ children }${t(': { children: React.ReactNode }')}) {
  return (
    <EmotionRegistry>
      <ChakraProvider value={brandSystem}>{children}</ChakraProvider>
    </EmotionRegistry>
  );
}
`;
};

function moduleName(from: string, to: string) {
	const value = relative(dirname(from), to).split('\\').join('/');
	return value.startsWith('.') ? value : `./${value}`;
}

function addImport(source: string, spec: string) {
	if (source.includes(`from "${spec}"`) || source.includes(`from '${spec}'`)) return source;
	const imports = [...source.matchAll(/^import[\s\S]*?;\s*$/gm)];
	if (!imports.length) return `import { ${PROVIDER()} } from "${spec}";\n${source}`;
	const last = imports.at(-1)!;
	const end = last.index! + last[0].length;
	return `${source.slice(0, end)}\nimport { ${PROVIDER()} } from "${spec}";${source.slice(end)}`;
}

/** Set up Chakra once at the application root while leaving the app's Tailwind reset and theme in control. */
export function installChakraProvider(w: Writer, project: Project) {
	const config = componentConfig(w.root, project);
	const providerPath = `${relative(w.root, resolveAlias(w.root, `${config.aliases.ui}/provider`))}${config.tsx ? '.tsx' : '.jsx'}`;
	const layout = project.layouts.find(file => /\/layout\.(tsx|jsx|js)$/.test(`/${file}`));
	const appRouter = project.framework === 'next' && !!layout;
	const providerSource = appRouter ? nextProvider(config.tsx) : plainProvider(config.tsx);
	const existingProvider = w.read(providerPath);
	if (existingProvider && !existingProvider.includes(PROVIDER())) return { providerPath, warning: `${providerPath} already exists; merge ${PROVIDER()} into it before using Chakra components.` };
	if (!existingProvider || existingProvider === plainProvider(config.tsx) || existingProvider === nextProvider(config.tsx)) w.write(providerPath, providerSource);

	if (layout) {
		const source = w.read(layout) ?? '';
		const ast = parse(source, { sourceType: 'module', plugins: ['typescript', 'jsx'] });
		let body: any;
		const visit = (node: any) => {
			if (!node || typeof node !== 'object') return;
			if (node.type === 'JSXElement' && node.openingElement.name?.type === 'JSXIdentifier' && node.openingElement.name.name === 'body' && node.closingElement) body = node;
			for (const [key, value] of Object.entries(node)) if (!['loc', 'comments', 'tokens'].includes(key)) {
				if (Array.isArray(value)) value.forEach(visit); else if (value && typeof value === 'object') visit(value);
			}
		};
		visit(ast);
		if (source.includes(PROVIDER())) return { providerPath, entry: layout };
		if (body) {
			const start = body.openingElement.end, end = body.closingElement.start;
			const wrapped = `${source.slice(0, start)}<${PROVIDER()}>${source.slice(start, end)}</${PROVIDER()}>${source.slice(end)}`;
			w.write(layout, addImport(wrapped, moduleName(layout, providerPath.replace(/\.(tsx|jsx)$/, ''))));
			return { providerPath, entry: layout };
		}
	}

	// Vite and React Router applications render their root from a createRoot(...).render(<App />) entry.
	const entries = walkFiles(w.root, ['**/*.{tsx,jsx,ts,js}'], ['**/node_modules/**', '**/.next/**', '**/dist/**', '**/build/**']);
	for (const entry of entries) {
		const source = w.read(entry);
		if (!source || !/createRoot\s*\(/.test(source) || !/\.render\s*\(/.test(source)) continue;
		const ast = parse(source, { sourceType: 'unambiguous', plugins: ['typescript', 'jsx'] });
		let root: any;
		const visit = (node: any) => {
			if (!node || typeof node !== 'object') return;
			if (node.type === 'CallExpression' && node.callee?.type === 'MemberExpression' && node.callee.property?.name === 'render') {
				const child = node.arguments?.[0];
				if (child?.type === 'JSXElement' || child?.type === 'JSXFragment') root = child;
			}
			for (const [key, value] of Object.entries(node)) if (!['loc', 'comments', 'tokens'].includes(key)) {
				if (Array.isArray(value)) value.forEach(visit); else if (value && typeof value === 'object') visit(value);
			}
		};
		visit(ast);
		if (root && source.includes(PROVIDER())) return { providerPath, entry };
		if (!root) continue;
		const wrapped = `${source.slice(0, root.start)}<${PROVIDER()}>${source.slice(root.start, root.end)}</${PROVIDER()}>${source.slice(root.end)}`;
		w.write(entry, addImport(wrapped, moduleName(entry, providerPath.replace(/\.(tsx|jsx)$/, ''))));
		return { providerPath, entry };
	}

	if (project.framework === 'astro') return { providerPath, warning: `Wrap the React island that uses ${brand().name} components in ${PROVIDER()}.` };
	if (existsSync(resolve(w.root, providerPath))) return { providerPath, warning: `Wrap the application root in ${PROVIDER()} to use Chakra components.` };
	return { providerPath, warning: `Add a React entry point, then wrap its root in ${PROVIDER()} to use Chakra components.` };
}
