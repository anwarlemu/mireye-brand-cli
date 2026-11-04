"use client";

import { Sources, Source, SourceRef, SourceGroup, useSourceLink } from "@/components/ui/sources";
import { cn } from "@/lib/utils";

// An answer cites its sources by number, in three layouts to choose from (29 Oct). In each, point
// at a number in the text or at a source: every chip with that number turns Forest while the
// other sources step back (150ms). The list chips are the small size, at the answer's scale.
//   A · Footnotes: the sources as a compact list under a rule, like footnotes.
//   B · Sidenotes: the sources in a narrow column beside the answer, stacked under it on a phone.
//   C · Cards: each source as a card under the answer, with what kind of data it is.
const SOURCES = [
  { title: "FEMA flood hazard layer", kind: "Flood zones" },
  { title: "USGS 3DEP elevation model", kind: "Elevation and slope" },
  { title: "HIFLD electric substations", kind: "Grid" },
];
const focus = "cursor-default outline-none focus-visible:outline-solid focus-visible:outline-1 focus-visible:outline-offset-4 focus-visible:outline-line-strong";

function Answer() {
  const ref = (n: number) => <SourceRef number={n} size="inline" />;
  return (
    <p className="text-body text-fg">
      The parcel is in flood zone X{ref(1)}, sits at 412 ft with a 2.8% slope{ref(2)}, and the nearest substation is 1.8 miles away{ref(3)}.
    </p>
  );
}

function SourceList() {
  return (
    <Sources aria-label="Sources" className="gap-1.5">
      {SOURCES.map((s, i) => (
        <Source key={s.title} number={i + 1} size="sm" tabIndex={0} className={focus}>
          {s.title}
        </Source>
      ))}
    </Sources>
  );
}

export function Preview() {
  return (
    <SourceGroup>
      <div className="flex w-full max-w-90 flex-col gap-3.5">
        <Answer />
        <div className="border-t border-line-subtle pt-2.5">
          <SourceList />
        </div>
      </div>
    </SourceGroup>
  );
}

export function Sidenotes() {
  return (
    <SourceGroup>
      {/* Side by side when the container is 420px or wider; stacked below that. */}
      <div className="@container w-full max-w-114">
        <div className="flex flex-col gap-3.5 @[420px]:flex-row @[420px]:gap-5">
          <div className="min-w-0 flex-1">
            <Answer />
          </div>
          <div className="border-line-subtle @max-[420px]:border-t @max-[420px]:pt-2.5 @[420px]:w-51 @[420px]:shrink-0 @[420px]:border-l @[420px]:pl-3">
            <SourceList />
          </div>
        </div>
      </div>
    </SourceGroup>
  );
}

function SourceCard({ number, title, kind }: { number: number; title: string; kind: string }) {
  const { active, dimmed, handlers } = useSourceLink(number);
  return (
    <li
      tabIndex={0}
      {...handlers}
      className={cn(
        "flex min-w-0 flex-1 basis-27 flex-col gap-2 p-2",
        "ds-cut-frame [--ds-cut:0px] [--ds-shape-fill:var(--ds-color-bg-default)] before:transition-colors before:duration-150 before:ease-out",
        active ? "[--ds-shape-stroke:var(--ds-color-border-strong)]" : "[--ds-shape-stroke:var(--ds-color-border-subtle)]",
        focus,
      )}
    >
      <SourceRef number={number} size="sm" className="self-start" />
      <span className={cn("ds-trim text-caption transition-colors duration-150 ease-out", dimmed ? "text-fg-secondary" : "text-fg")}>{title}</span>
      <span className="ds-trim text-caption text-fg-muted">{kind}</span>
    </li>
  );
}

export function Cards() {
  return (
    <SourceGroup>
      <div className="flex w-full max-w-96 flex-col gap-3.5">
        <Answer />
        <ul aria-label="Sources" role="list" className="flex flex-wrap gap-1">
          {SOURCES.map((s, i) => (
            <SourceCard key={s.title} number={i + 1} title={s.title} kind={s.kind} />
          ))}
        </ul>
      </div>
    </SourceGroup>
  );
}
