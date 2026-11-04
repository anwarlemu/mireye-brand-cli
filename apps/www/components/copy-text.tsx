"use client";

import * as React from "react";
import { CheckIcon, CopyIcon } from "@phosphor-icons/react/ssr";

import { cn } from "@/lib/utils";

/**
 * A command to copy, in a cut-frame window: white in the 1px Stone line with the 8px chamfer at the top-left, 40px tall,
 * a Slate "$" and the command in DM Mono at 12px, 16px in, and a square copy key at the right that fills with Fog under
 * the pointer and turns into a check for two seconds.
 */
export function CopyText({ value, label = "Copy", className }: { value: string; label?: string; className?: string }) {
  const [copied, setCopied] = React.useState(false);
  React.useEffect(() => {
    if (!copied) return;
    // ds-latency: resets completed clipboard feedback; copying and press feedback are already immediate.
    const t = setTimeout(() => setCopied(false), 2000);
    return () => clearTimeout(t);
  }, [copied]);
  return (
    <div className={cn("ds-cut-frame flex h-10 w-full min-w-0 items-center gap-3 pr-1 pl-4 [--ds-shape-fill:var(--ds-color-bg-default)] [--ds-shape-stroke:var(--ds-color-border-default)]", className)}>
      <code className="flex min-w-0 flex-1 gap-2 font-mono text-caption leading-tight text-code-text">
        <span aria-hidden className="shrink-0 text-fg-subtle select-none">
          $
        </span>
        <span className="truncate">{value}</span>
      </code>
      <button
        type="button"
        aria-label={copied ? "Copied" : label}
        onClick={() => navigator.clipboard.writeText(value).then(() => setCopied(true), () => undefined)}
        className="inline-flex size-8 shrink-0 cursor-pointer items-center justify-center text-fg outline-none transition-[background-color] duration-150 ease-out hover:bg-subtle active:bg-subtle-hover active:transition-none focus-visible:outline-solid focus-visible:outline-1 focus-visible:-outline-offset-1 focus-visible:outline-line-strong motion-reduce:transition-none"
      >
        {copied ? <CheckIcon className="size-4" /> : <CopyIcon className="size-4" />}
      </button>
      <span aria-live="polite" className="sr-only">
        {copied ? "Copied" : ""}
      </span>
    </div>
  );
}
