"use client";

import * as React from "react";
import { Status, type StatusVariant } from "@/components/ui/status";

// One site's status: click the pill to screen the site. It goes from Queued to Loading, and to Verified 1.2s later;
// click again to queue it again. The pill keeps one width in every state; marks and words swap in place.
export function Preview() {
  const [variant, setVariant] = React.useState<StatusVariant>("queued");
  React.useEffect(() => {
    if (variant !== "processing") return;
    // ds-latency: the demo plays a run on a clock; no input waits on this timer.
    const id = window.setTimeout(() => setVariant("verified"), 1200);
    return () => window.clearTimeout(id);
  }, [variant]);
  const next = variant === "queued" ? "Screen this site" : variant === "verified" ? "Queue it again" : undefined;
  const word = variant === "processing" ? "Loading" : variant === "verified" ? "Verified" : "Queued";
  return (
    <div className="flex justify-center">
      <button
        type="button"
        aria-label={next ? `${word}. ${next}` : word}
        aria-disabled={variant === "processing" || undefined}
        onClick={() => setVariant((v) => (v === "queued" ? "processing" : v === "verified" ? "queued" : v))}
        className="group cursor-pointer outline-none aria-disabled:cursor-progress focus-visible:outline-solid focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-line-strong"
      >
        <Status
          variant={variant}
          className="after:transition-[background-color] after:duration-150 after:ease-out group-hover:group-not-aria-disabled:[--ds-shape-fill:var(--ds-color-fog)] group-active:after:duration-0 group-active:group-not-aria-disabled:[--ds-shape-fill:var(--ds-color-mist)]"
        />
      </button>
      {/* The change is announced outside the button, whose content is read as its name. */}
      <span role="status" className="sr-only">
        {word}
      </span>
    </div>
  );
}

// The three statuses, as Figma draws them.
export function Variants() {
  return (
    <div className="flex flex-wrap justify-center gap-3">
      <Status variant="verified" />
      <Status variant="processing" />
      <Status variant="queued" />
    </div>
  );
}
