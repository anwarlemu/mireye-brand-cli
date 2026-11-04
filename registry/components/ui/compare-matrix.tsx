"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { ResultMark, RESULT_LABELS, type CheckResult } from "@/components/ui/result-mark";
import { FitScore } from "@/components/ui/fit-score";
import { SourceRef } from "@/components/ui/sources";
import { Button } from "@/components/ui/button";
import { AnimatedCounter } from "@/components/ui/animated-counter";
import { Diamond } from "@/components/ui/diamond";
import { EmptyValue, NOT_RECORDED } from "@/lib/empty-value";
import { usePrefersReducedMotion } from "@/lib/use-loop-frame";

/**
 * CompareMatrix: two to four sites side by side against the same requirements. Not in Figma yet
 * (29 Oct); built from the Land platform's Compare screen (product survey).
 *
 * - Sites are columns, in the order they were picked; requirements are rows, in buy box order.
 *   The requirement column and each site column share the width 2 : 1.5 (40/30/30 with two
 *   sites), never narrower than 120px and 96px at product scale.
 * - Header: site name (two lines at most), a detail line (address or parcel ID), the FitScore bar
 *   and Remove. Cells: ResultMark, then the value. A failed cell says so in words ("Fail ·
 *   Zone AE"); a cell with no reading says "Not screened"; a source can follow inline.
 * - A cell that fails a Must requirement is marked as RequirementChecks marks a failed row
 *   (30 Oct): the cell fills Fog, a 2px Forest bar runs inside its left edge and "Fail" is
 *   Medium. Only the failing site's cell is marked, so the eye lands on the site, not the row.
 *   Its source chips step to Mist so they still show on the band.
 * - `activeRequirement` (set by the caller, e.g. while an agent answer citing it is pointed at)
 *   steps the other rows back to 80% Forest, as SourceGroup does: no fill, no hatch.
 * - Under the requirements: notes that are not judged (county signals, owner), then the summary
 *   ("4 requirements · 2 sites · Ellis County"), whose counts roll when they change.
 * - Narrow screens: the table scrolls sideways inside its own region with the requirement column
 *   pinned; a 1px Stone edge shows on the pinned column only while scrolled. Columns snap to the
 *   pinned edge. The page itself never scrolls sideways.
 * - Pointing (fine pointers only): a 10px diamond in the frame's left margin, centered between
 *   its edge and the table, marks the row under the pointer and glides from row to row (150ms,
 *   ease-out). Rows are read, not clicked: no fill (Fog stays the failure mark).
 * - Adding (29 Oct, version C chosen): the add column holds Add site, or the caller's `addSlot`.
 *   `addOverlay` floats under the add column's header, right-aligned to the table and outside
 *   the scroll region, for a panel wider than the column, such as Ask Mireye's suggestions.
 * - Motion: nothing on first render. A site that is added fades in (200ms, ease-out); while it
 *   screens, its cells show Screening; when its results arrive they rise 4px into place row by row,
 *   50ms apart, the fit bar counts up, and a failing cell fades to Fog while its bar draws down its edge
 *   (250ms). A site that is removed fades out
 *   (120ms). Whenever columns change, the ones that stay glide to their new place (200ms,
 *   ease-in-out) instead of jumping.
 * - Focus: after Remove, focus moves to the next Remove (or Add site, or the table region when
 *   no Remove is left); after an add, to the new site's name. A screen reader hears the change.
 */

export type CompareSite = {
  id: string;
  name: string;
  /** Address or parcel ID. */
  detail?: string;
  /** Fit score, 0–100. null: not screened. Leave it out to show no bar. */
  fit?: number | null;
  /** Results are still coming for this site. */
  loading?: boolean;
};

export type CompareCell = { result: CheckResult; value?: React.ReactNode; source?: number | string };

export type CompareRequirement = {
  id: string;
  /** Field name, e.g. "Acreage". */
  field: string;
  /** The rule, e.g. "≥ 200 ac". */
  requirement?: string;
  /** "must" (default) or a weight in percent. Only a Must requirement can fail. */
  kind?: "must" | number;
  results: Record<string, CompareCell>;
};

export type CompareNote = {
  id: string;
  label: string;
  values: Record<string, { value?: React.ReactNode; detail?: React.ReactNode }>;
  /** What an empty cell reads. Default "Not recorded"; a list such as county signals passes "None on record". */
  empty?: React.ReactNode;
};

/** One rule for every cell and the tally: Screening while loading, Unknown without a reading,
 * and a weighted requirement never fails. */
function resolveResult(cell: CompareCell | undefined, weighted: boolean, loading?: boolean): CheckResult {
  if (loading) return "screening";
  if (!cell || cell.value == null) return "unknown";
  return weighted && cell.result === "fail" ? "pass" : cell.result;
}

type CompareMatrixProps = Omit<React.HTMLAttributes<HTMLDivElement>, "children"> & {
  sites: CompareSite[];
  requirements: CompareRequirement[];
  notes?: CompareNote[];
  /** The market named in the summary, e.g. "Ellis County". */
  market?: string;
  /** Replaces the default summary line. */
  summary?: React.ReactNode;
  /** Adds an "n of m pass" row under the requirements. */
  showTally?: boolean;
  /** The requirement under discussion; the other rows step back. */
  activeRequirement?: string | null;
  onRemoveSite?: (id: string) => void;
  onAddSite?: () => void;
  minSites?: number;
  maxSites?: number;
  /** Replaces the Add site button in the add column's header, e.g. a button that opens a panel. */
  addSlot?: React.ReactNode;
  /** A panel that floats under the add column's header, right-aligned to the table. */
  addOverlay?: React.ReactNode;
};

const EASE_IN_OUT = "cubic-bezier(0.77, 0, 0.175, 1)";

const cell = "px-1.5 pt-2.5 pb-3 align-top text-left border-b border-line-subtle transition-colors duration-150 ease-out";
// The failure mark, as on a failed RequirementChecks row: a 2px Forest bar inside the cell's
// left edge, drawn down it when the failure lands (250ms), on the Fog band.
const failMark =
  "relative before:absolute before:inset-y-0 before:left-0 before:w-[2px] before:origin-top before:bg-line-strong before:scale-y-0 before:transition-transform before:duration-250 before:ease-(--ds-easing-out) motion-reduce:before:transition-none";
const failCell = "bg-subtle before:scale-y-100 [&_[data-slot=source-ref]:not([data-active])]:[--ds-shape-fill:var(--ds-color-mist)]";
const pinned = cn(
  "sticky left-0 z-10 bg-surface",
  "after:pointer-events-none after:absolute after:inset-y-0 after:right-0 after:w-px after:bg-line after:opacity-0 after:transition-opacity after:duration-150 after:ease-out",
  "group-data-[scrolled]/region:after:opacity-100",
);

export function CompareMatrix({
  sites,
  requirements,
  notes = [],
  market,
  summary,
  showTally = false,
  activeRequirement = null,
  onRemoveSite,
  onAddSite,
  minSites = 2,
  maxSites = 4,
  addSlot,
  addOverlay,
  className,
  "aria-label": ariaLabel = "Compare sites",
  ...props
}: CompareMatrixProps) {
  const reduced = usePrefersReducedMotion();
  const root = React.useRef<HTMLDivElement>(null);
  const table = React.useRef<HTMLTableElement>(null);
  const region = React.useRef<HTMLDivElement>(null);
  const [scrolled, setScrolled] = React.useState(false);
  const [overflows, setOverflows] = React.useState(false);
  React.useLayoutEffect(() => {
    const el = region.current;
    if (!el) return;
    const check = () => setOverflows(el.scrollWidth > el.clientWidth + 1);
    const ro = new ResizeObserver(check);
    ro.observe(el);
    if (el.firstElementChild) ro.observe(el.firstElementChild);
    return () => ro.disconnect();
  }, []);

  const canRemove = !!onRemoveSite && sites.length > minSites;
  const canAdd = (!!onAddSite || !!addSlot) && sites.length < maxSites;
  const cols = sites.length + (canAdd ? 1 : 0);
  // Shares of the width: requirement 2, each site and the add column 1.5.
  const shares = 2 + 1.5 * cols;
  const minUnits = 30 + 24 * cols; // Figma-scale 200 + 160 per column, at 0.6 on the 4px grid
  // The pinned column's width at the table's minimum width, for the scroll padding, so a column
  // snapped or scrolled into view never hides under it.
  const pinUnits = (2 / shares) * minUnits;

  // Columns that stay glide to their new place when columns come or go: each cell's
  // content starts where it was and moves there (FLIP), so the rules and bands never move.
  const lefts = React.useRef(new Map<string, number>());
  const layoutKey = `${sites.map((s) => s.id).join()}|${canAdd}`;
  const lastKey = React.useRef(layoutKey);
  React.useLayoutEffect(() => {
    const t = table.current;
    if (!t) return;
    const now = new Map<string, number>();
    t.querySelectorAll<HTMLElement>("thead [data-col]").forEach((th) => now.set(th.dataset.col!, th.offsetLeft));
    if (lastKey.current !== layoutKey && !reduced) {
      for (const [col, x] of now) {
        const was = lefts.current.get(col);
        if (col === "label" || was == null || Math.abs(was - x) < 1) continue;
        t.querySelectorAll<HTMLElement>(`[data-col="${col}"] > *`).forEach((el) =>
          el.animate([{ transform: `translateX(${was - x}px)` }, { transform: "none" }], { duration: 200, easing: EASE_IN_OUT }),
        );
      }
    }
    lastKey.current = layoutKey;
    lefts.current = now;
  });

  // Sites shown at first render don't fade in; sites added later do. A site that leaves the list
  // is forgotten, so adding it back fades it in too.
  const first = React.useRef(new Set(sites.map((s) => s.id)));
  React.useEffect(() => {
    for (const id of first.current) if (!sites.some((s) => s.id === id)) first.current.delete(id);
  }, [sites]);
  const still = (id: string) => first.current.has(id);
  const [leaving, setLeaving] = React.useState<Set<string>>(new Set());
  const pending = React.useRef(new Set<string>());
  const [announce, setAnnounce] = React.useState("");
  const removeButtons = React.useRef(new Map<string, HTMLSpanElement>());
  const nameCells = React.useRef(new Map<string, HTMLTableCellElement>());
  const addRef = React.useRef<HTMLSpanElement>(null);
  const focusAfter = React.useRef<{ removedAt?: number; added?: boolean } | null>(null);
  const prevIds = React.useRef(sites.map((s) => s.id));
  React.useEffect(() => {
    const was = prevIds.current;
    prevIds.current = sites.map((s) => s.id);
    const f = focusAfter.current;
    const added = sites.find((s) => !was.includes(s.id));
    // An add from a search or picker in the add column: its control is gone, so focus would fall
    // to the page; it goes to the new site's name instead. Focus elsewhere on the page stays.
    if (added && !f?.added) {
      const active = document.activeElement;
      if (active === document.body || root.current?.contains(active)) nameCells.current.get(added.id)?.focus();
      setAnnounce(`${added.name} added. ${sites.length} ${sites.length === 1 ? "site" : "sites"} in compare.`);
    }
    if (!f) return;
    focusAfter.current = null;
    if (f.added) {
      if (added) {
        nameCells.current.get(added.id)?.focus();
        setAnnounce(`${added.name} added. ${sites.length} ${sites.length === 1 ? "site" : "sites"} in compare.`);
      }
      return;
    }
    if (f.removedAt != null) {
      if (canRemove) {
        const next = sites[Math.min(f.removedAt, sites.length - 1)];
        next && removeButtons.current.get(next.id)?.querySelector("button")?.focus();
      } else (addRef.current?.querySelector("button") ?? region.current)?.focus();
    }
  }, [sites, canRemove]);

  const remove = (site: CompareSite, index: number) => {
    // A second Remove during the fade must not take the list under its minimum.
    if (pending.current.has(site.id) || sites.length - pending.current.size <= minSites) return;
    pending.current.add(site.id);
    setLeaving((l) => new Set(l).add(site.id));
    // ds-latency: the column is already fading out; this only unmounts it once the 120ms fade ends.
    window.setTimeout(() => {
      pending.current.delete(site.id);
      setLeaving((l) => {
        const n = new Set(l);
        n.delete(site.id);
        return n;
      });
      focusAfter.current = { removedAt: index };
      onRemoveSite?.(site.id);
      const left = sites.length - 1;
      setAnnounce(`${site.name} removed. ${left} ${left === 1 ? "site" : "sites"} in compare.`);
    }, 120);
  };
  const add = () => {
    focusAfter.current = { added: true };
    onAddSite?.();
  };

  const fade = (id: string) =>
    cn(leaving.has(id) ? "opacity-0 transition-opacity duration-120 ease-out" : !still(id) && "motion-safe:animate-[ds-enter_200ms_var(--ds-easing-out)_both]");
  // Results that arrive after the first render rise into place, row by row.
  const rise = (id: string, row: number) => (still(id) ? undefined : row * 50);

  // Pointing: the marker's height follows the row under the pointer. The first one appears in
  // place; the next ones glide.
  const [node, setNode] = React.useState<{ y: number | null; left: number; fresh: boolean }>({ y: null, left: 0, fresh: true });
  const point = (e: React.PointerEvent) => {
    if (e.pointerType !== "mouse" || !root.current || !region.current) return;
    const tr = (e.target as Element).closest("tbody tr");
    const r = root.current.getBoundingClientRect();
    const g = region.current.getBoundingClientRect();
    const b = tr?.getBoundingClientRect();
    const y = b ? b.top + b.height / 2 - r.top : null;
    setNode((n) => (n.y === y ? n : { y, left: (g.left - r.left) / 2, fresh: n.y == null }));
  };
  const leave = () => setNode((n) => ({ ...n, y: null, fresh: true }));

  // The overlay sits under the add column's header, its right edge on the table's.
  const addHeader = React.useRef<HTMLTableCellElement>(null);
  const [overlayAt, setOverlayAt] = React.useState<{ top: number; right: number } | null>(null);
  React.useLayoutEffect(() => {
    if (!addOverlay) return;
    const place = () => {
      const r = root.current?.getBoundingClientRect();
      const g = region.current?.getBoundingClientRect();
      const h = addHeader.current?.getBoundingClientRect();
      if (r && g && h) setOverlayAt({ top: h.bottom - r.top + 8, right: r.right - g.right });
    };
    place();
    window.addEventListener("resize", place);
    return () => window.removeEventListener("resize", place);
  }, [!!addOverlay, layoutKey]);
  const weighted = (r: CompareRequirement) => (r.kind ?? "must") !== "must";
  const failed = (r: CompareRequirement) => !weighted(r) && sites.some((s) => resolveResult(r.results[s.id], false, s.loading) === "fail");
  const dim = (id: string) => activeRequirement != null && activeRequirement !== id;

  if (!sites.length) {
    return (
      <div data-slot="compare-matrix" className={cn("flex flex-col items-start gap-3.5", className)} {...props}>
        <p className="ds-trim text-body text-fg-secondary">Pick two to four sites to compare.</p>
        {onAddSite && (
          <Button variant="secondary" size="sm" onClick={onAddSite}>
            Add site
          </Button>
        )}
      </div>
    );
  }

  return (
    <div ref={root} data-slot="compare-matrix" className={cn("relative flex flex-col font-sans", className)} {...props}>
      <div
        ref={region}
        role="region"
        aria-label={ariaLabel}
        tabIndex={overflows ? 0 : -1}
        data-scrolled={scrolled || undefined}
        onScroll={(e) => {
          setScrolled(e.currentTarget.scrollLeft > 0);
          leave();
        }}
        // A control focused inside the region scrolls clear of the pinned column.
        onFocus={(e) => {
          if (e.target !== e.currentTarget) e.target.scrollIntoView({ inline: "nearest", block: "nearest" });
        }}
        style={{ scrollPaddingLeft: `calc(var(--spacing) * ${pinUnits})` }}
        className={cn(
          "group/region overflow-x-auto overscroll-x-contain bg-surface snap-x snap-proximity",
          "outline-none focus-visible:outline-solid focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-line-strong",
        )}
      >
        <table
          ref={table}
          onPointerOver={point}
          onPointerLeave={leave}
          className="w-full table-fixed border-separate border-spacing-0"
          style={{ minWidth: `calc(var(--spacing) * ${minUnits})` }}
        >
          <colgroup>
            <col style={{ width: `${(2 / shares) * 100}%` }} />
            {sites.map((s) => (
              <col key={s.id} style={{ width: `${(1.5 / shares) * 100}%` }} />
            ))}
            {canAdd && <col style={{ width: `${(1.5 / shares) * 100}%` }} />}
          </colgroup>
          <thead>
            <tr data-row="head">
              <th scope="col" data-col="label" className={cn(pinned, "border-b border-line px-1.5 pb-2.5 align-bottom text-left")}>
                {/* With Remove under each name, the label sits on Remove's 40px row. */}
                <span className={cn("flex", onRemoveSite && "h-6 items-center")}>
                  <span className="ds-trim text-caption font-normal text-fg-secondary">Requirement</span>
                </span>
              </th>
              {sites.map((s, i) => (
                <th
                  key={s.id}
                  ref={(el) => {
                    if (el) nameCells.current.set(s.id, el);
                    else nameCells.current.delete(s.id);
                  }}
                  tabIndex={-1}
                  scope="col"
                  data-col={s.id}
                  className={cn("snap-start border-b border-line px-1.5 pb-2.5 align-bottom text-left font-normal text-fg outline-none", fade(s.id))}
                >
                  <div className="flex flex-col gap-2">
                    {/* Trimmed so every header line sits 12px apart; padding with an equal
                        negative margin keeps the clip edge clear of the letters. */}
                    <span className="ds-trim [margin-block:-0.25em] line-clamp-2 [padding-block:0.25em] text-body">{s.name}</span>
                    <span className="ds-trim [margin-block:-0.3em] truncate [padding-block:0.3em] text-caption text-fg-secondary">
                      {s.loading && s.fit === undefined ? <span className="ds-shimmer">Screening</span> : (s.detail ?? " ")}
                    </span>
                    {s.fit !== undefined && <FitScore value={s.fit} loading={s.loading} unit=" fit" className="w-full max-w-30" />}
                    {onRemoveSite && (
                      <span
                        ref={(el) => {
                          if (el) removeButtons.current.set(s.id, el);
                          else removeButtons.current.delete(s.id);
                        }}
                        className={cn("self-start", !canRemove && "invisible")}
                      >
                        {/* The design's text key; `link` until the system's Button carries a `text` variant. */}
                        <Button
                          variant="link"
                          aria-label={`Remove ${s.name} from compare`}
                          onClick={() => remove(s, i)}
                        >
                          Remove
                        </Button>
                      </span>
                    )}
                  </div>
                </th>
              ))}
              {canAdd && (
                <th ref={addHeader} scope="col" data-col="add" className="snap-start border-b border-line px-1.5 pb-2.5 align-bottom text-left font-normal">
                  <span ref={addRef} className="block">
                    {addSlot ?? (
                      <Button variant="link" onClick={add}>
                        Add site
                      </Button>
                    )}
                  </span>
                </th>
              )}
            </tr>
          </thead>
          {/* With notes under it, the last row's rule is the Stone one that opens the notes. */}
          <tbody className={cn(notes.length > 0 && "[&>tr:last-child>*]:border-b-line")}>
            {requirements.map((r, k) => {
              const band = failed(r);
              const quiet = dim(r.id);
              return (
                <tr key={r.id} data-requirement={r.id} data-failed={band || undefined} className={quiet ? "text-fg-secondary" : "text-fg"}>
                  <th scope="row" data-col="label" className={cn(pinned, cell, "font-normal")}>
                    <span className="flex flex-wrap gap-1.5">
                      <span className="ds-trim text-body">{r.field}</span>
                      {r.requirement && <span className="ds-trim text-caption text-fg-secondary tabular-nums">{r.requirement}</span>}
                    </span>
                  </th>
                  {sites.map((s) => {
                    const c = r.results[s.id];
                    const result = resolveResult(c, weighted(r), s.loading);
                    return (
                      <td key={s.id} data-col={s.id} data-failed={result === "fail" || undefined} className={cn(cell, failMark, result === "fail" && failCell, fade(s.id))}>
                        <ResultCell cell={c} result={result} delay={rise(s.id, k)} />
                      </td>
                    );
                  })}
                  {canAdd && <td data-col="add" className={cell} />}
                </tr>
              );
            })}
            {showTally && (
              <tr>
                <th scope="row" data-col="label" className={cn(pinned, cell, "font-normal")}>
                  <span className="ds-trim block text-caption text-fg-secondary">Requirements met</span>
                </th>
                {sites.map((s) => {
                  const pass = requirements.filter((r) => resolveResult(r.results[s.id], weighted(r), s.loading) === "pass").length;
                  return (
                    <td key={s.id} data-col={s.id} className={cn(cell, "text-caption text-fg-secondary tabular-nums", fade(s.id))}>
                      <span className="ds-trim block">
                        {s.loading ? (
                          <span className="ds-shimmer">Screening</span>
                        ) : (
                          <>
                            <AnimatedCounter value={pass} /> of {requirements.length} pass
                          </>
                        )}
                      </span>
                    </td>
                  );
                })}
                {canAdd && <td data-col="add" className={cell} />}
              </tr>
            )}
          </tbody>
          {notes.length > 0 && (
            <tbody>
              {notes.map((n) => (
                <tr key={n.id}>
                  <th scope="row" data-col="label" className={cn(pinned, cell, "font-normal")}>
                    <span className="ds-trim block text-caption text-fg-secondary">{n.label}</span>
                  </th>
                  {sites.map((s) => {
                    const v = n.values[s.id];
                    return (
                      <td key={s.id} data-col={s.id} className={cn(cell, "text-fg", fade(s.id))}>
                        <span className="ds-trim block text-body">
                          {v?.value != null ? (
                            <>
                              {v.value}
                              {v.detail && <span className="text-fg-secondary"> · {v.detail}</span>}
                            </>
                          ) : (
                            <EmptyValue>{n.empty ?? NOT_RECORDED}</EmptyValue>
                          )}
                        </span>
                      </td>
                    );
                  })}
                  {canAdd && <td data-col="add" className={cell} />}
                </tr>
              ))}
            </tbody>
          )}
        </table>
      </div>
      <Diamond
        size={10}
        aria-hidden
        className={cn(
          "pointer-events-none absolute top-0 left-0 text-fg ease-out motion-reduce:transition-none",
          node.fresh ? "transition-opacity duration-150" : "transition-[opacity,transform] duration-150",
          node.y == null && "opacity-0",
        )}
        style={{ transform: `translate(${node.left}px, ${node.y ?? 0}px) translate(-50%, -50%)` }}
      />
      {addOverlay && canAdd && overlayAt && (
        <div className="absolute z-30" style={{ top: overlayAt.top, right: overlayAt.right }}>
          {addOverlay}
        </div>
      )}
      <p className="ds-trim pt-5 text-caption text-fg-secondary tabular-nums">
        {summary ?? (
          <>
            <AnimatedCounter value={requirements.length} /> requirements · <AnimatedCounter value={sites.length} /> sites
            {market && ` · ${market}`}
          </>
        )}
      </p>
      <span role="status" className="sr-only">
        {announce}
      </span>
    </div>
  );
}

function ResultCell({ cell, result, delay }: { cell?: CompareCell; result: CheckResult; delay?: number }) {
  if (result === "screening")
    return (
      <span className="flex items-start gap-1.5">
        <span className="mt-0.5 flex w-2 justify-center">
          <ResultMark result="screening" />
        </span>
        <span className="sr-only">Screening</span>
      </span>
    );
  const hasValue = result !== "unknown";
  return (
    <span
      className={cn("flex items-start gap-1.5 text-body tabular-nums", delay != null && "motion-safe:animate-[ds-rise_200ms_var(--ds-easing-out)_both]")}
      style={delay != null ? { animationDelay: `${delay}ms` } : undefined}
    >
      <span className="mt-0.5 flex w-2 shrink-0 justify-center">
        <ResultMark result={result} />
      </span>
      <span className="ds-trim min-w-0">
        {result === "fail" ? (
          <>
            <span className="font-medium">{RESULT_LABELS.fail}</span>
            {hasValue ? " · " : ""}
          </>
        ) : (
          <span className="sr-only">{RESULT_LABELS[result]} </span>
        )}
        {hasValue ? cell!.value : result === "unknown" ? <EmptyValue /> : null}
        {cell?.source != null && hasValue && <SourceRef number={cell.source} size="inline" />}
      </span>
    </span>
  );
}
