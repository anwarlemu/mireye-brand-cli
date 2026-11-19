import * as React from "react";

import { ArrowRightIcon } from "@/components/icons/arrow-right";
import { PageSection, type PageSectionProps } from "@/components/blocks/page-section";
import { Button } from "@/components/ui/button";
import { Ticks } from "@/components/ui/ticks";
import { cn } from "@/lib/utils";

// The closing card: a large cut panel with the title, one line and the page's last two actions, with a tick row along
// its foot (the brand's progress language, here a still mark). `dark` is Forest with Bone ink and a Fog key (the Forest
// key would vanish on Forest); `light` is a Bone frame with a Forest line, the Forest key and an outlined one. Nothing
// moves.

export type CtaLink = { label: string; href: string };

export type CtaSectionProps = Omit<PageSectionProps, "children" | "intro"> & {
  description?: React.ReactNode;
  primary?: CtaLink | null;
  secondary?: CtaLink | null;
  tone?: "dark" | "light";
  /** The share of the tick row that is lit, 0 to 1. */
  progress?: number;
};

export function CtaSection({
  title = "Give your agent the ground truth.",
  description = "Start free with 1,000 requests a month. No card needed.",
  primary = { label: "Get started", href: "#get-started" },
  secondary = { label: "Book a call", href: "#contact" },
  tone = "dark",
  progress = 0.62,
  label,
  ...props
}: CtaSectionProps) {
  const dark = tone === "dark";
  return (
    <PageSection {...props}>
      <div
        className={cn(
          "grid gap-8 p-6 sm:p-10 lg:p-12 [--ds-cut:var(--ds-cut-lg)]",
          dark ? "ds-cut text-fg-inverse [--ds-shape-fill:var(--ds-color-bg-inverse)]" : "ds-cut-frame text-fg [--ds-shape-fill:var(--ds-color-bg-page)] [--ds-shape-stroke:var(--ds-color-border-strong)]",
        )}
      >
        <div className="grid gap-4">
          {label != null && <p className={cn("font-mono text-caption leading-tight", dark ? "text-fg-inverse-muted" : "text-fg-muted")}>{label}</p>}
          <h2 className="max-w-(--ds-layout-heading) text-h1 leading-heading font-normal text-balance">{title}</h2>
          {description != null && <p className={cn("max-w-(--ds-layout-text) text-body-lg leading-body", dark ? "text-fg-inverse-muted" : "text-fg-secondary")}>{description}</p>}
        </div>
        {(primary || secondary) && (
          <div className="flex flex-wrap items-center gap-3">
            {primary && (
              <Button asChild variant={dark ? "secondary" : "default"}>
                <a href={primary.href}>
                  {primary.label}
                  <ArrowRightIcon size={20} />
                </a>
              </Button>
            )}
            {secondary &&
              (dark ? (
                <a
                  href={secondary.href}
                  className="inline-flex h-9 items-center px-2 text-body font-medium text-fg-inverse-muted outline-none transition-colors duration-150 ease-out hover:text-fg-inverse focus-visible:outline-solid focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-fg-inverse motion-reduce:transition-none"
                >
                  {secondary.label}
                </a>
              ) : (
                <Button asChild variant="outline">
                  <a href={secondary.href}>{secondary.label}</a>
                </Button>
              ))}
          </div>
        )}
        <Ticks aria-hidden pitch={6} value={progress} on={dark ? "var(--ds-color-text-inverse)" : "var(--ds-color-text-default)"} off={dark ? "var(--ds-color-track-dark)" : "var(--ds-color-border-default)"} className="h-5 w-full" />
      </div>
    </PageSection>
  );
}
