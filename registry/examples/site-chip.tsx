"use client";

import * as React from "react";
import { SiteChip } from "@/components/ui/site-chip";
import { ChatInput } from "@/components/ui/chat";

// The site a question is about. Pick another site and the chip eases to its new width while the new coordinates rise
// in; remove it and the chip leaves the way it came.
const SITES = ["32.1745, -96.8921", "39.8561, -104.6737", "35.4676, -97.5164"];

export function Preview() {
  const [site, setSite] = React.useState<string | null>(SITES[0]);
  return (
    <div className="mx-auto flex w-full max-w-90 flex-col gap-3">
      <div className="flex flex-wrap gap-2">
        {SITES.map((s, k) => (
          <button
            key={s}
            type="button"
            aria-pressed={site === s}
            onClick={() => setSite(s)}
            className="ds-trim cursor-pointer text-caption text-fg-secondary underline-offset-4 outline-none hover:text-fg aria-pressed:text-fg aria-pressed:underline focus-visible:outline-solid focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-line-strong"
          >
            Site {k + 1}
          </button>
        ))}
      </div>
      <ChatInput
        placeholder={site ? "Ask about this parcel" : "Ask about any U.S. location"}
        site={site && <SiteChip onRemove={() => setSite(null)}>{site}</SiteChip>}
        submitDisabled
      />
    </div>
  );
}

// On its own, with and without the parcel icon.
export function Variants() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-3">
      <SiteChip>32.1745, -96.8921</SiteChip>
      <SiteChip icon={false}>32.1745, -96.8921</SiteChip>
    </div>
  );
}
