import { brand } from '../lib/brand.js';
import { defaultFooter, defaultTheme, tokenHex } from '../image/catalog.js';

// Emails as plain HTML tables with every style inline, so they survive Gmail, Outlook and Apple Mail: a newsletter,
// an announcement, a receipt, a password reset, and an email signature. Colors are the brand tokens; type is the brand
// sans with system fallbacks (email clients do not load web fonts reliably). Only the words passed are written.

export const EMAIL_KINDS = ['newsletter', 'announcement', 'receipt', 'password-reset', 'signature'] as const;
export type EmailKind = (typeof EMAIL_KINDS)[number];

export type EmailInput = {
	preheader?: string;
	headline?: string;
	body?: string;
	button?: { label: string; url: string };
	items?: { title: string; text?: string; url?: string }[];
	lines?: { label: string; amount: string }[];
	total?: { label: string; amount: string };
	footer?: string;
	name?: string;
	role?: string;
	email?: string;
	phone?: string;
	url?: string;
	logo?: string;
};

const NEEDS: Record<EmailKind, (keyof EmailInput)[]> = { newsletter: ['headline', 'items'], announcement: ['headline', 'body'], receipt: ['headline', 'lines', 'total'], 'password-reset': ['headline', 'body', 'button'], signature: ['name'] };
const TAKES: Record<EmailKind, (keyof EmailInput)[]> = {
	newsletter: ['preheader', 'headline', 'body', 'items', 'button', 'footer', 'logo', 'url'],
	announcement: ['preheader', 'headline', 'body', 'button', 'footer', 'logo', 'url'],
	receipt: ['preheader', 'headline', 'body', 'lines', 'total', 'button', 'footer', 'logo', 'url'],
	'password-reset': ['preheader', 'headline', 'body', 'button', 'footer', 'logo', 'url'],
	signature: ['name', 'role', 'email', 'phone', 'url', 'logo'],
};

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const safeUrl = (u: string) => {
	if (!/^(https?:|mailto:|tel:)/i.test(u)) throw new Error(`"${u}" is not a link an email can carry (https:, mailto: or tel:).`);
	return esc(u);
};

export function emailSample(kind: EmailKind): EmailInput {
	const samples: Record<EmailKind, EmailInput> = {
		newsletter: { preheader: 'What shipped this month.', headline: 'March at Acme', body: 'Three things changed this month.', items: [{ title: 'Batch calls', text: 'Send hundreds of locations in one call.', url: 'https://example.com/batch' }, { title: 'MCP tools', text: 'Ask from any agent.', url: 'https://example.com/mcp' }], button: { label: 'Read the changelog', url: 'https://example.com/changelog' }, footer: 'Acme, 1 Example Street' },
		announcement: { preheader: 'Now in every plan.', headline: 'Batch calls are here', body: 'Send hundreds of locations in one call.\n\nOne bad address no longer fails the rest.', button: { label: 'See how', url: 'https://example.com/batch' }, footer: 'Acme, 1 Example Street' },
		receipt: { headline: 'Your receipt', body: 'Thanks for your payment.', lines: [{ label: 'Team plan, March', amount: '$490.00' }, { label: 'Tax', amount: '$0.00' }], total: { label: 'Total', amount: '$490.00' }, footer: 'Acme, 1 Example Street' },
		'password-reset': { headline: 'Reset your password', body: 'Someone asked to reset the password for this account. If it was not you, ignore this email.', button: { label: 'Choose a new password', url: 'https://example.com/reset' } },
		signature: { name: 'Acme Person', role: 'Head of data, Acme', email: 'hello@acme.example', phone: '+1 555 0100' },
	};
	return samples[kind];
}

export function emailHtml(kind: EmailKind, input: EmailInput, theme = defaultTheme()): string {
	const missing = NEEDS[kind].filter((k) => input[k] === undefined || input[k] === '' || (Array.isArray(input[k]) && !(input[k] as unknown[]).length));
	if (missing.length) throw new Error(`The ${kind} email needs ${missing.join(' and ')}.`);
	const extra = (Object.keys(input) as (keyof EmailInput)[]).filter((k) => !TAKES[kind].includes(k));
	if (extra.length) throw new Error(`The ${kind} email draws no ${extra.join(' or ')}. It takes ${TAKES[kind].join(', ')}.`);
	const t = (name: string) => tokenHex(name, theme);
	const bg = t('--ds-color-bg-default');
	const ink = t('--ds-color-text-default');
	const muted = t('--ds-color-text-secondary');
	const line = t('--ds-color-border-default');
	const action = t('--ds-color-action-primary');
	const actionFg = t('--ds-color-action-primary-fg');
	const sans = `'Gilroy', -apple-system, 'Segoe UI', Helvetica, Arial, sans-serif`;
	const mono = `'DM Mono', ui-monospace, Menlo, Consolas, monospace`;
	const site = input.url ?? brand().site ?? '';
	const logo = input.logo ? `<img src="${/^[\w./-]+\.png$/.test(input.logo) ? esc(input.logo) : safeUrl(input.logo)}" width="120" alt="${esc(brand().name)}" style="display:block;border:0;height:auto;">` : `<span style="font-family:${sans};font-size:18px;color:${ink};">${esc(brand().name)}</span>`;
	const p = (text: string, color = ink, size = 16) => text.split(/\n{2,}/).map((para) => `<p style="margin:0 0 16px;font-family:${sans};font-size:${size}px;line-height:1.5;color:${color};">${esc(para).replace(/\n/g, '<br>')}</p>`).join('');
	const button = (b: { label: string; url: string }) => `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:8px 0 24px;"><tr><td style="background:${action};"><a href="${safeUrl(b.url)}" style="display:inline-block;padding:12px 20px;font-family:${sans};font-size:15px;color:${actionFg};text-decoration:none;">${esc(b.label)}</a></td></tr></table>`;
	if (kind === 'signature') {
		return `<table role="presentation" cellpadding="0" cellspacing="0" style="border-collapse:collapse;"><tr><td style="padding:0 16px 0 0;border-right:1px solid ${line};vertical-align:top;">${logo}</td><td style="padding:0 0 0 16px;vertical-align:top;font-family:${sans};"><div style="font-size:15px;color:${ink};">${esc(input.name!)}</div>${input.role ? `<div style="font-size:13px;color:${muted};">${esc(input.role)}</div>` : ''}${input.email ? `<div style="font-family:${mono};font-size:12px;color:${muted};padding-top:6px;"><a href="mailto:${esc(input.email)}" style="color:${muted};text-decoration:none;">${esc(input.email)}</a></div>` : ''}${input.phone ? `<div style="font-family:${mono};font-size:12px;color:${muted};"><a href="tel:${esc(input.phone.replace(/[^+\d]/g, ''))}" style="color:${muted};text-decoration:none;">${esc(input.phone)}</a></div>` : ''}${site ? `<div style="font-family:${mono};font-size:12px;padding-top:6px;"><a href="${safeUrl(site)}" style="color:${ink};text-decoration:none;">${esc(defaultFooter())}</a></div>` : ''}</td></tr></table>\n`;
	}
	let main = `<h1 style="margin:0 0 16px;font-family:${sans};font-size:28px;line-height:1.15;font-weight:400;color:${ink};">${esc(input.headline!)}</h1>`;
	if (input.body) main += p(input.body);
	if (kind === 'newsletter') for (const it of input.items ?? []) main += `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-top:1px solid ${line};"><tr><td style="padding:16px 0;"><div style="font-family:${sans};font-size:18px;color:${ink};margin-bottom:4px;">${it.url ? `<a href="${safeUrl(it.url)}" style="color:${ink};text-decoration:none;">${esc(it.title)}</a>` : esc(it.title)}</div>${it.text ? p(it.text, muted, 15) : ''}</td></tr></table>`;
	if (kind === 'receipt') {
		const row = (l: { label: string; amount: string }, strong = false) => `<tr><td style="padding:10px 0;border-top:1px solid ${line};font-family:${sans};font-size:15px;color:${strong ? ink : muted};">${esc(l.label)}</td><td align="right" style="padding:10px 0;border-top:1px solid ${line};font-family:${mono};font-size:15px;color:${ink};">${esc(l.amount)}</td></tr>`;
		main += `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:8px 0 24px;">${(input.lines ?? []).map((l) => row(l)).join('')}${row(input.total!, true)}</table>`;
	}
	if (input.button) main += button(input.button);
	const pre = input.preheader ? `<div style="display:none;max-height:0;overflow:hidden;">${esc(input.preheader)}</div>` : '';
	const foot = [input.footer ? esc(input.footer) : '', site ? `<a href="${safeUrl(site)}" style="color:${muted};">${esc(defaultFooter())}</a>` : ''].filter(Boolean).join('<br>');
	return `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"><meta name="color-scheme" content="light"><title>${esc(input.headline!)}</title></head>
<body style="margin:0;padding:0;background:${bg};">${pre}
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${bg};"><tr><td align="center" style="padding:32px 16px;">
<table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">
<tr><td style="padding:0 0 24px;border-bottom:1px solid ${line};">${logo}</td></tr>
<tr><td style="padding:32px 0 8px;">${main}</td></tr>
<tr><td style="padding:24px 0 0;border-top:1px solid ${line};font-family:${mono};font-size:12px;line-height:1.6;color:${muted};">${foot}</td></tr>
</table></td></tr></table>
</body></html>
`;
}
