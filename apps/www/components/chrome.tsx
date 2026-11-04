import { CodeBlock, CodeBlockActions, CodeBlockContent, CodeBlockCopyButton, CodeBlockHeader, CodeBlockTitle } from "@/components/ui/code-block";
import { cn } from "@/lib/utils";
import { CopyText } from "@www/components/copy-text";

/**
 * A page's head on the canvas: an optional framed chip (the section), the 24px regular title, a 13px muted line under
 * it, at most 720px wide, and a 1px Stone rule under the whole head. Actions sit at the right.
 */
export function PageHead({ title, description, eyebrow, children }: { title: React.ReactNode; description?: React.ReactNode; eyebrow?: React.ReactNode; children?: React.ReactNode }) {
  return (
    <header className="border-b border-line px-4 pt-8 pb-6 sm:px-12">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="min-w-0">
          {eyebrow && <p className="mb-3 inline-flex h-5 items-center border border-line px-1.5 text-caption leading-none text-fg-secondary">{eyebrow}</p>}
          <h1 className="text-h1 leading-heading font-normal text-fg">{title}</h1>
          {description && <p className="mt-1.5 max-w-180 text-body leading-body text-fg-muted">{description}</p>}
        </div>
        {children && <div className="flex shrink-0 items-center gap-3">{children}</div>}
      </div>
    </header>
  );
}

/** The page's body, 48px in from the rail on a desktop, 16px on a phone. */
export function PageBody({ className, children }: { className?: string; children: React.ReactNode }) {
  return <div className={cn("grid gap-10 px-4 pt-8 pb-16 sm:px-12", className)}>{children}</div>;
}

/** A titled block of a page: a 16px regular title, a 13px muted line, then its content 16px below. */
export function Section({ id, title, description, children }: { id?: string; title: string; description?: React.ReactNode; children: React.ReactNode }) {
  return (
    <section id={id} className="grid min-w-0 scroll-mt-6 gap-4">
      <div className="grid gap-1">
        <h2 className="text-h3 leading-heading font-normal text-fg">{title}</h2>
        {description && <p className="max-w-180 text-body leading-body text-fg-muted">{description}</p>}
      </div>
      {children}
    </section>
  );
}

/** A shell command in a cut-frame window: "$" and the command in DM Mono, the copy key at the right. */
export function Command({ command, className }: { command: string; className?: string }) {
  return <CopyText value={command} label="Copy command" className={className} />;
}

/** Code in the library's code block, with its file name in the head. */
export function Code({ code, title, lang = "tsx", tall = false, className }: { code: string; title?: string; lang?: string; tall?: boolean; className?: string }) {
  const text = code.trim();
  return (
    <CodeBlock className={className}>
      <CodeBlockHeader>
        <CodeBlockTitle language={lang}>{title ?? lang.toUpperCase()}</CodeBlockTitle>
        <CodeBlockActions>
          <CodeBlockCopyButton value={text} />
        </CodeBlockActions>
      </CodeBlockHeader>
      <CodeBlockContent code={text} language={lang} className={tall ? "max-h-140" : "max-h-96"} />
    </CodeBlock>
  );
}
