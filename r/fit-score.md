# Fit score
How well a site meets the buyer's requirements, 0 to 100: a tick bar, a chip or a ring, with the level in words.

Install: npx mireye-ds add fit-score
Requires: theme, utils, ticks, tag, dial, empty-value, use-loop-frame
Packages: none
Exports: FIT_THRESHOLDS, FitLevel, FIT_LEVEL_LABELS, fitLevel, fitText, FitScore
Client boundary: yes
Reference: Not in Figma yet; built from Ticks, Tag and the Dial's geometry


## Usage
Use the bar in tables and Compare headers, the chip on cards and the ring on the parcel record. Pass `value` (null when never screened) and `loading` while a screen runs. Levels are words, never colors: Strong fit (80 and up), Moderate (60 to 79), Weak (under 60).
- Avoid: Coloring the score by level
- Avoid: A percent sign; it is a score
- Avoid: A level without its word


## Examples
Example components: npx mireye-ds add fit-score
[Preview](https://mireye-ds.agencidev.com/preview/fit-score/Preview) | [NotScreened](https://mireye-ds.agencidev.com/preview/fit-score/NotScreened)

examples/fit-score.tsx

```tsx
"use client";

import * as React from "react";
import { FitScore } from "@/components/ui/fit-score";

// A screen running, then its score, then re-screens with new scores: the number rolls and the
// ticks count to it. The loop holds each score for 1.4s.
const SCORES = [92, 67, 57, 100];

function useScreen(scores: number[]) {
  const [i, setI] = React.useState(-1); // -1: screening
  React.useEffect(() => {
    // ds-latency: the demo plays a run on a clock; no input waits on this timer.
    const id = window.setTimeout(() => setI((n) => (n + 1) % scores.length), i < 0 ? 700 : 1400);
    return () => window.clearTimeout(id);
  }, [i, scores.length]);
  return i < 0 ? { loading: true, value: null } : { loading: false, value: scores[i] };
}

function Bar() {
  const s = useScreen(SCORES);
  return <FitScore value={s.value} loading={s.loading} className="w-30" />;
}

function Chip() {
  const s = useScreen(SCORES);
  return <FitScore variant="chip" value={s.value} loading={s.loading} />;
}

function Ring() {
  const s = useScreen([50, 72, 91]);
  return <FitScore variant="ring" value={s.value} loading={s.loading} coverage={{ screened: 15, total: 22 }} />;
}

// Live: a screen running, then scores that count in. Bar for tables, chip for cards, ring for the parcel record.
export function Preview() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-10">
      <Bar />
      <Chip />
      <Ring />
    </div>
  );
}

// A site that was never screened (every tick Mist, "Not screened") beside a score of 0 (every tick Stone, "Weak 0").
export function NotScreened() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-10">
      <FitScore value={null} className="w-30" />
      <FitScore value={0} className="w-30" />
      <FitScore variant="chip" value={null} />
      <FitScore variant="ring" value={null} coverage={{ screened: 0, total: 22 }} />
    </div>
  );
}

```

## Source

components/ui/fit-score.tsx

```tsx
"use client";

import * as React from "react";
import { cn, svgBox, svgSize } from "@/lib/utils";
import { Ticks } from "@/components/ui/ticks";
import { Tag } from "@/components/ui/tag";
import { DIALS, Dial } from "@/components/ui/dial";
import { EmptyValue, NOT_SCREENED } from "@/lib/empty-value";
import { usePrefersReducedMotion } from "@/lib/use-loop-frame";

/**
 * FitScore: how well a site meets the buyer's requirements, 0 to 100. Not in Figma yet (29 Oct);
 * built from the Land platform's Leads table, cards and parcel record (product survey), with
 * existing parts only.
 *
 * - A score, not a share, so it never shows "%": the number under a "Fit" header and in the
 *   ring, "{n} fit" on a chip. Tabular figures, Regular, Forest.
 * - Levels are words, never colors: Strong fit (80 and up), Moderate fit (60–79), Weak fit
 *   (under 60). The cut points are provisional until the design confirms them (FIT_THRESHOLDS). Bar and
 *   chip only flag the weak case, as a word before the number ("Weak 57"); the ring always shows
 *   the level as its verdict. Assistive tech always hears the level ("57 fit, weak").
 * - variant="bar" (tables, Compare headers): the number, then a Ticks row 20px tall, 6px pitch,
 *   as wide as the container in whole ticks. Lit lines = the score's share of the lines, rounded
 *   to whole lines so no tick is half lit.
 * - variant="chip" (cards and lists): a Tag reading "{n} fit", its text centered. The chip hugs its
 *   text and morphs to the new width when the text changes (200ms, ease-out), instead of
 *   reserving the widest text and leaving a gap.
 * - variant="ring" (the parcel record): the Dial's 140px geometry, 24 ticks, lit clockwise from
 *   12 o'clock, the score in the center, then the verdict and the coverage ("15 of 22 fields
 *   screened") under it.
 * - Not screened (value null): every tick Mist, the token for empty ticks, so it differs from a
 *   score of 0 (all Stone); the words say "Not screened". While a screen runs (`loading`), the
 *   number's place reads "Screening" with the shimmer.
 * - Motion: one counted value drives the number, the lit ticks and the level words, so they
 *   never disagree mid-count. A new score counts to its value in 400ms on a quint ease-out (fast,
 *   then settling), up or down, from wherever the count is; a score that arrives after a screen
 *   or "Not screened" counts up from 0. A level word only shows once the count agrees with it:
 *   "Weak" appears when the number drops under 60 and leaves the moment a score of 60 or more
 *   comes in; the ring's verdict clears as a count starts and comes in once the number reaches
 *   the new score's band (about 100ms into the count). When "Weak" comes or goes, the number
 *   glides to its new place (200ms, ease-in-out) instead of jumping.
 *   Words that replace each other (Screening, the number, the verdict) come in with a 200ms
 *   fade, a 4px rise and a 2px blur that masks the swap. The first render, a remount and a resize
 *   are still. While the ring's screen runs, the Dial turns. Under reduced motion everything
 *   jumps.
 *
 * Product scale: the sizes above are Figma-scale; the bar is 120px wide with a 12px tick row
 * (the 6px pitch does not scale), and the ring draws the Dial's geometry at 0.6 (84px).
 */

export const FIT_THRESHOLDS = { strong: 80, moderate: 60 } as const;
export type FitLevel = "strong" | "moderate" | "weak";
export const FIT_LEVEL_LABELS: Record<FitLevel, string> = { strong: "Strong fit", moderate: "Moderate fit", weak: "Weak fit" };

export function fitLevel(value: number | null | undefined, t: { strong: number; moderate: number } = FIT_THRESHOLDS): FitLevel | null {
  if (value == null || Number.isNaN(value)) return null;
  return value >= t.strong ? "strong" : value >= t.moderate ? "moderate" : "weak";
}

/** "57 fit, weak": the accessible reading of a score. */
export function fitText(value: number | null | undefined, t?: { strong: number; moderate: number }) {
  const level = fitLevel(value, t);
  return level == null ? NOT_SCREENED : `${Math.round(value!)} fit, ${level}`;
}

const PITCH = 6;
const clamp = (v: number) => Math.min(100, Math.max(0, Math.round(v)));
const COUNT_MS = 400;
const EASE_OUT = "cubic-bezier(0.23, 1, 0.32, 1)";
const EASE_IN_OUT = "cubic-bezier(0.77, 0, 0.175, 1)";
const quint = (t: number) => 1 - (1 - t) ** 5;

/**
 * The score as it is drawn. It counts to each new score in 400ms on a quint ease-out, starting
 * from wherever the count is, so a new score mid-count turns it around without a jump. With no
 * score (not screened, or a screen running) it is null, and the next score counts up from 0.
 * The first render shows the score still.
 */
function useCountedScore(target: number | null) {
  const reduced = usePrefersReducedMotion();
  const [shown, setShown] = React.useState(target);
  const current = React.useRef(target);
  React.useEffect(() => {
    if (target == null || reduced) {
      current.current = target;
      setShown(target);
      return;
    }
    const from = current.current ?? 0;
    if (from === target) return;
    const start = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / COUNT_MS);
      const v = from + (target - from) * quint(t);
      current.current = v;
      setShown(v);
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, reduced]);
  // A score that just arrived reads 0 until the first frame of its count.
  return target == null ? null : (shown ?? 0);
}

/** False on the first render, true after: parts that mount later may animate in. */
function useMounted() {
  const mounted = React.useRef(false);
  React.useEffect(() => {
    mounted.current = true;
  }, []);
  return mounted;
}

/**
 * A word or number that replaces another in place: a 200ms fade, a 4px rise and a 2px blur that
 * masks the swap. Still when `play` is false at mount (the component's first render).
 */
function Enter({ play, className, children }: { play: boolean; className?: string; children: React.ReactNode }) {
  const ref = React.useRef<HTMLSpanElement>(null);
  const reduced = usePrefersReducedMotion();
  React.useLayoutEffect(() => {
    if (!play || reduced) return;
    ref.current?.animate(
      [
        { opacity: 0, filter: "blur(2px)", transform: "translateY(4px)" },
        { opacity: 1, filter: "blur(0px)", transform: "none" },
      ],
      { duration: 200, easing: EASE_OUT },
    );
    // Only on mount: a new word is a new element (keyed by the caller).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return (
    <span ref={ref} className={cn("inline-block", className)}>
      {children}
    </span>
  );
}

/**
 * "Weak 57 fit" for the bar and the chip. "Weak" shows only while both the count and the score
 * are under 60; when it comes or goes, the number glides by the word's width (200ms,
 * ease-in-out) and the word fades in behind it (160ms, 120ms later), so nothing jumps sideways
 * and the two never overlap.
 */
function ScoreText({ shown, score, thresholds, unit }: { shown: number; score: number; thresholds?: { strong: number; moderate: number }; unit?: string }) {
  const reduced = usePrefersReducedMotion();
  const n = Math.round(shown);
  const weak = fitLevel(score, thresholds) === "weak" && fitLevel(n, thresholds) === "weak";
  const word = React.useRef<HTMLSpanElement>(null);
  const number = React.useRef<HTMLSpanElement>(null);
  // Where the number sat on the last frame (layout, without transforms), so the glide starts
  // from there whether the text is left-aligned (bar) or centered (chip).
  const lastLeft = React.useRef<number | null>(null);
  const wasWeak = React.useRef(weak);
  React.useLayoutEffect(() => {
    const left = number.current?.offsetLeft ?? null;
    const before = lastLeft.current;
    lastLeft.current = left;
    if (wasWeak.current === weak) return;
    wasWeak.current = weak;
    if (reduced || left == null || before == null) return;
    const dx = before - left;
    number.current?.animate([{ transform: `translateX(${dx}px)` }, { transform: "none" }], { duration: 200, easing: EASE_IN_OUT });
    // The word waits until the number has mostly moved out of its way, so the two never overlap.
    word.current?.animate([{ opacity: 0, filter: "blur(2px)" }, { opacity: 1, filter: "blur(0px)" }], { duration: 160, delay: 120, easing: EASE_OUT, fill: "backwards" });
  });
  return (
    <>
      {weak && (
        <span ref={word} className="inline-block">
          {"Weak\u00a0"}
        </span>
      )}
      <span ref={number} className="inline-block">
        {n}
        {unit}
      </span>
    </>
  );
}

/** How many whole 6px lines fit the element's exact (unrounded) width. */
function useLineCount<T extends HTMLElement>() {
  const ref = React.useRef<T>(null);
  const [lines, setLines] = React.useState(0);
  React.useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const count = (w: number) => setLines(Math.max(2, Math.floor((w - 1) / PITCH) + 1));
    count(el.getBoundingClientRect().width);
    const ro = new ResizeObserver(([e]) => count(e.contentRect.width));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  return [ref, lines] as const;
}

/**
 * The chip's text box: as wide as its text, centered, and easing to a new width (200ms) when the
 * text changes, so the chip morphs instead of jumping. The first width is set without motion.
 */
function Morph({ children }: { children: React.ReactNode }) {
  const inner = React.useRef<HTMLSpanElement>(null);
  const [width, setWidth] = React.useState<number | null>(null);
  React.useLayoutEffect(() => {
    const el = inner.current;
    if (!el) return;
    const measure = () => setWidth(el.offsetWidth);
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  return (
    <span
      className="inline-flex justify-center overflow-x-clip transition-[width] duration-200 ease-(--ds-easing-out) motion-reduce:transition-none"
      style={width == null ? undefined : { width }}
    >
      <span ref={inner} className="inline-block shrink-0 whitespace-nowrap">
        {children}
      </span>
    </span>
  );
}

/** Text that never changes the box's width: every option is reserved in one grid cell. */
function Reserve({ options, children }: { options: string[]; children: React.ReactNode }) {
  return (
    <span className="inline-grid">
      {options.map((o) => (
        <span key={o} aria-hidden className="invisible [grid-area:1/1]">
          {o}
        </span>
      ))}
      <span className="[grid-area:1/1]">{children}</span>
    </span>
  );
}

type FitScoreProps = Omit<React.HTMLAttributes<HTMLDivElement>, "children"> & {
  /** The fit score, 0–100. null: not screened. */
  value: number | null;
  variant?: "bar" | "chip" | "ring";
  /** Fields the screen read, for the ring: { screened: 15, total: 22 }. */
  coverage?: { screened: number; total: number };
  /** Level cut points. Default FIT_THRESHOLDS. */
  thresholds?: { strong: number; moderate: number };
  /** A screen is running; the score is not known yet. */
  loading?: boolean;
  /** Text after the bar's number, e.g. " fit" in a Compare header. Tables under a "Fit" header leave it out. */
  unit?: string;
};

export function FitScore({ value, variant = "bar", coverage, thresholds, loading = false, unit, className, ...props }: FitScoreProps) {
  const score = value == null ? null : clamp(value);
  const level = loading ? null : fitLevel(score, thresholds);
  const shown = useCountedScore(loading ? null : score);
  const mounted = useMounted();
  const meter =
    score != null && !loading
      ? { role: "meter", "aria-label": "Fit", "aria-valuemin": 0, "aria-valuemax": 100, "aria-valuenow": score, "aria-valuetext": fitText(score, thresholds) }
      : {};

  if (variant === "chip") {
    return (
      <Tag data-slot="fit-score" data-variant="chip" data-level={level ?? undefined} aria-busy={loading || undefined} className={cn("tabular-nums", className)} {...props}>
        <Morph>
          {loading ? (
            <Enter key="screening" play={mounted.current}>
              <span className="ds-shimmer">Screening</span>
            </Enter>
          ) : score == null || shown == null ? (
            <Enter key="none" play={mounted.current}>
              <EmptyValue />
            </Enter>
          ) : (
            <Enter key="score" play={mounted.current}>
              <ScoreText shown={shown} score={score} thresholds={thresholds} unit=" fit" />
              <span className="sr-only">, {level}</span>
            </Enter>
          )}
        </Morph>
      </Tag>
    );
  }

  const parts = { score, shown, level, loading, meter, thresholds, play: mounted.current };
  if (variant === "ring") return <FitRing {...parts} coverage={coverage} className={className} {...props} />;

  return <FitBar {...parts} unit={unit} className={className} {...props} />;
}

type PartProps = Omit<React.HTMLAttributes<HTMLDivElement>, "children"> & {
  score: number | null;
  /** The counted score as drawn; null without a score. */
  shown: number | null;
  level: FitLevel | null;
  loading: boolean;
  meter: Record<string, unknown>;
  thresholds?: { strong: number; moderate: number };
  /** False on the first render: nothing animates in. */
  play: boolean;
};

function FitBar({ score, shown, level, loading, meter, thresholds, play, unit, className, ...props }: PartProps & { unit?: string }) {
  const [ref, lines] = useLineCount<HTMLSpanElement>();
  const lit = shown == null ? 0 : Math.round((shown / 100) * lines);
  const empty = score == null || loading;
  return (
    <div
      data-slot="fit-score"
      data-variant="bar"
      data-level={level ?? undefined}
      aria-busy={loading || undefined}
      className={cn("flex w-30 flex-col gap-2", className)}
      {...meter}
      {...props}
    >
      <span data-slot="value" aria-hidden={meter.role ? true : undefined} className="ds-trim whitespace-nowrap text-body text-fg tabular-nums">
        {loading ? (
          <Enter key="screening" play={play}>
            <span className="ds-shimmer">Screening</span>
          </Enter>
        ) : score == null || shown == null ? (
          <Enter key="none" play={play}>
            <EmptyValue />
          </Enter>
        ) : (
          <Enter key="score" play={play}>
            <ScoreText shown={shown} score={score} thresholds={thresholds} unit={unit} />
          </Enter>
        )}
      </span>
      <span ref={ref} data-slot="bar" className="block h-3 w-full">
        <Ticks
          pitch={PITCH}
          filled={lit}
          on="var(--ds-color-border-strong)"
          off={empty ? "var(--ds-color-border-subtle)" : "var(--ds-color-border-default)"}
          className="h-3"
          // The track is drawn from the same line count the lit ticks use, so they always agree.
          style={{ width: lines ? `${(lines - 1) * PITCH + 1}px` : `calc(round(down, 100% - 1px, ${PITCH}px) + 1px)` }}
        />
      </span>
    </div>
  );
}

const RING = DIALS[140];
const RING_TICKS = RING.ticks;

function FitRing({ score, shown, level, loading, coverage, meter, thresholds, play, className, ...props }: PartProps & { coverage?: { screened: number; total: number } }) {
  const lit = shown == null ? 0 : Math.round((shown / 100) * RING_TICKS);
  const empty = score == null || loading;
  // The verdict clears when a count starts and comes in once the count reaches the new score's
  // band, so it never names a level the number is not in.
  const counted = shown == null ? null : fitLevel(Math.round(shown), thresholds);
  const verdict = loading ? "screening" : level == null ? "none" : counted === level ? level : "counting";
  const c = 70;
  const r2 = (v: number) => Math.round(v * 100) / 100;
  return (
    <div data-slot="fit-score" data-variant="ring" data-level={level ?? undefined} aria-busy={loading || undefined} className={cn("flex flex-col items-center gap-5", className)} {...props}>
      <div className="relative" {...meter}>
        {loading ? (
          <Dial size={140} running aria-hidden className="block" />
        ) : (
        <svg width={140} height={140} viewBox="0 0 140 140" fill="none" aria-hidden className={cn("block", svgBox)} style={svgSize(140)}>
          {Array.from({ length: RING_TICKS }, (_, k) => {
            const a = (k * 2 * Math.PI) / RING_TICKS;
            return (
              <line
                key={k}
                x1={r2(c + RING.inner * Math.sin(a))}
                y1={r2(c - RING.inner * Math.cos(a))}
                x2={r2(c + RING.outer * Math.sin(a))}
                y2={r2(c - RING.outer * Math.cos(a))}
                strokeWidth={RING.stroke}
                stroke={k < lit ? "var(--ds-color-border-strong)" : empty ? "var(--ds-color-border-subtle)" : "var(--ds-color-border-default)"}
              />
            );
          })}
        </svg>
        )}
        <span data-slot="value" aria-hidden className="absolute inset-0 flex items-center justify-center text-h3 text-fg tabular-nums">
          {!empty && shown != null && (
            <Enter key="score" play={play}>
              {Math.round(shown)}
            </Enter>
          )}
        </span>
      </div>
      <dl className="flex gap-7">
        <div className="flex flex-col gap-2">
          <dt className="ds-trim text-caption text-fg-secondary">Verdict</dt>
          <dd data-slot="verdict" className="ds-trim text-body text-fg">
            <Reserve options={[...Object.values(FIT_LEVEL_LABELS), NOT_SCREENED, "Screening"]}>
              <Enter key={verdict} play={play}>
                {verdict === "screening" ? (
                  <span className="ds-shimmer">Screening</span>
                ) : verdict === "none" ? (
                  <EmptyValue />
                ) : verdict === "counting" ? null : (
                  FIT_LEVEL_LABELS[verdict]
                )}
              </Enter>
            </Reserve>
          </dd>
        </div>
        {coverage && (
          <div className="flex flex-col gap-2">
            <dt className="ds-trim text-caption text-fg-secondary">Screened</dt>
            <dd data-slot="coverage" className="ds-trim text-body text-fg tabular-nums">
              {coverage.screened} of {coverage.total} fields
            </dd>
          </div>
        )}
      </dl>
    </div>
  );
}

```
