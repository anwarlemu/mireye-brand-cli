"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { MireyeMark } from "@/components/ui/mireye-mark";
import { MapMarker } from "@/components/ui/map-marker";
import { Diamond } from "@/components/ui/diamond";
import { PlusIcon } from "@/components/icons/plus";
import { CONTOURS_INDEX, CONTOURS_MINOR } from "@/components/ui/parcel-scan";

/**
 * Agent chat: the "Ask Mireye" panel, built from the system's parts. Source: the chat
 * explorations in Figma (434:2, "Chat 12, Map strip, text low, light" and "Chat 16, Cut-corner
 * source"), chosen on 29 Oct as the direction. Explorations set no values, so sizes here
 * follow the system (see registry/docs/agent-chat.md).
 *
 * - ChatPanel: a white panel with a Mist outline. `framed` (the Land platform's chat, 29 Oct)
 *   gives it the large cut corner and a survey node where the header's rule meets each edge, as
 *   rules meet at nodes on the contour boards. Header: the mark, "Ask Mireye" and a close button (the plus
 *   icon turned 45°); leave `onClose` out to dock it. Body, then the composer.
 * - ChatFollowUps: the next questions as chips on the composer, under a Mist rule (Fog on hover, Mist when pressed), so they read
 *   as questions to send, not as part of the answer.
 * - MapStrip: the site on a strip of contours, marked with MapMarker's survey lines and nodes.
 * - ChatSuggestions: the empty state's question and ready questions to pick (principle 15).
 * - SurveyFrame: survey lines and corner nodes around the composer before the first question.
 * - ProfileChart: an elevation profile drawn in the tick language, 1px lines every 4px under a
 *   1.5px Forest line. It draws left to right in 600ms, at a constant speed.
 * Product scale: these explorations were drawn at Figma's 1920 scale; sizes here are 0.6 of them
 * on the 4px grid (a 40px header, 14px side padding, a 120px map strip).
 * Motion: parts of an answer enter in place (opacity, 200ms) as they arrive; nothing slides.
 * Under reduced motion everything appears at once.
 */

export function ChatPanel({
  title = "Ask Mireye",
  onClose,
  footer,
  framed = false,
  className,
  children,
}: {
  /** The cut corner and the survey nodes on the header's rule. */
  framed?: boolean;
  title?: string;
  onClose?: () => void;
  footer?: React.ReactNode;
  className?: string;
  children?: React.ReactNode;
}) {
  return (
    <section
      aria-label={title}
      data-slot="chat-panel"
      className={cn(
        "relative flex flex-col font-sans text-fg",
        framed
          ? "ds-cut-frame p-px [--ds-cut:var(--ds-cut-lg)] [--ds-shape-stroke:var(--ds-color-border-subtle)] [--ds-shape-fill:var(--ds-color-bg-default)]"
          : "border border-line-subtle bg-surface",
        className,
      )}
    >
      {framed && ["left-[0.5px]", "right-[0.5px]"].map((side) => (
        // A zero-size anchor on the outline where the header's rule meets it; the node centers on it.
        <span key={side} aria-hidden className={cn("absolute top-[calc(var(--spacing)*10+0.5px)] z-10 size-0", side)}>
          <Diamond size={7} className="-translate-1/2 text-fg" />
        </span>
      ))}
      <header data-slot="header" className="flex h-10 shrink-0 items-center justify-between border-b border-line-subtle pr-2 pl-3.5">
        <span className="flex items-center gap-2">
          <MireyeMark className="h-auto w-4" />
          <span className="ds-trim text-body">{title}</span>
        </span>
        {onClose && (
          <button
            type="button"
            aria-label="Close"
            onClick={onClose}
            className="flex size-6 cursor-pointer items-center justify-center text-fg outline-none hover:bg-mist active:bg-mist focus-visible:outline-solid focus-visible:outline-1 focus-visible:outline-line-strong"
          >
            <PlusIcon size={18} className="rotate-45" />
          </button>
        )}
      </header>
      <div data-slot="body" className="flex min-h-0 flex-1 flex-col">
        {children}
      </div>
      {footer && (
        <div data-slot="footer" className="shrink-0 px-3.5 pt-1 pb-3.5">
          {footer}
        </div>
      )}
    </section>
  );
}

/** The next questions as chips on the composer, under a Mist rule across the panel. */
export function ChatFollowUps({ questions, onPick, className }: { questions: string[]; onPick: (q: string) => void; className?: string }) {
  return (
    <ul aria-label="Follow-up questions" className={cn("-mx-3.5 mb-4.5 flex flex-wrap gap-2.5 border-t border-line-subtle px-3.5 pt-3", className)}>
      {questions.map((q) => (
        <li key={q}>
          <button
            type="button"
            onClick={() => onPick(q)}
            className={cn(
              "ds-cut-frame flex h-6 cursor-pointer items-center px-2 text-body text-fg-secondary [--ds-cut:var(--ds-cut-sm)]",
              "[--ds-shape-stroke:var(--ds-color-border-subtle)] [--ds-shape-fill:var(--ds-color-bg-default)]",
              "transition-colors duration-150 ease-out after:transition-[background-color] after:duration-150 after:ease-out active:after:duration-0",
              "hover:text-fg hover:[--ds-shape-fill:var(--ds-color-fog)] active:[--ds-shape-fill:var(--ds-color-mist)]",
              "outline-none focus-visible:outline-solid focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-line-strong",
            )}
          >
            <span className="ds-trim">{q}</span>
          </button>
        </li>
      ))}
    </ul>
  );
}

export function MapStrip({ className }: { className?: string }) {
  // The site sits two thirds across, as in the exploration, at any width.
  const ref = React.useRef<HTMLDivElement>(null);
  const [width, setWidth] = React.useState(0);
  const [height, setHeight] = React.useState(0);
  React.useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => {
      setWidth(e.contentRect.width);
      setHeight(e.contentRect.height);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  return (
    <div ref={ref} data-slot="map-strip" aria-hidden className={cn("relative h-30 shrink-0 overflow-hidden border-b border-line-subtle", className)}>
      {/* The system's survey contours (ParcelScan's 240×128 artwork), stretched to cover the strip; the
          lines stay 1px. */}
      <svg viewBox="0 0 240 128" preserveAspectRatio="xMidYMid slice" className="absolute inset-0 block size-full" fill="none">
        <path d={CONTOURS_MINOR} vectorEffect="non-scaling-stroke" className="stroke-line-subtle" />
        <path d={CONTOURS_INDEX} vectorEffect="non-scaling-stroke" className="stroke-line" />
      </svg>
      {width > 0 && <MapMarker x={Math.round(width * 0.66)} y={Math.round(height / 2)} />}
    </div>
  );
}

/**
 * Ready questions to pick: under a question in the title style in the empty state, or alone
 * (`title={null}`) as follow-ups after an answer.
 */
export function ChatSuggestions({
  title = "What do you want to know about this site?",
  questions,
  onPick,
  className,
}: {
  title?: string | null;
  questions: string[];
  onPick: (q: string) => void;
  className?: string;
}) {
  return (
    <div data-slot="chat-suggestions" className={cn("flex flex-col gap-5", className)}>
      {title && <h2 className="max-w-60 text-h3 font-normal text-balance text-fg">{title}</h2>}
      <ul className="flex flex-col gap-0.5">
        {questions.map((q) => (
          <li key={q}>
            <button
              type="button"
              onClick={() => onPick(q)}
              // At least 24px tall at any scale, WCAG's smallest touch target.
              className="flex min-h-[24px] cursor-pointer items-center gap-2 text-caption text-fg-secondary transition-colors duration-150 ease-out outline-none hover:text-fg focus-visible:outline-solid focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-line-strong"
            >
              <Diamond size={8} variant="outline" className="text-fg" />
              <span className="ds-trim">{q}</span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

/**
 * Survey lines across the panel at the composer's top and bottom, with a node at each corner.
 * `framed={false}` fades the marks out (200ms) and keeps the composer mounted, so typing focus
 * survives the first question.
 */
export function SurveyFrame({ children, framed = true, className }: { children: React.ReactNode; framed?: boolean; className?: string }) {
  const marks = cn("transition-opacity duration-200 ease-out", framed ? "opacity-100" : "opacity-0");
  return (
    <div data-slot="survey-frame" className={cn("relative", className)}>
      <span aria-hidden className={cn("absolute -inset-x-3.5 top-0 h-px bg-line", marks)} />
      <span aria-hidden className={cn("absolute -inset-x-3.5 bottom-0 h-px bg-line", marks)} />
      {["-top-0.5 -left-0.5", "-top-0.5 -right-0.5", "-bottom-0.5 -left-0.5", "-bottom-0.5 -right-0.5"].map((at) => (
        <Diamond key={at} size={7} className={cn("absolute z-10 text-fg", at, marks)} />
      ))}
      {children}
    </div>
  );
}

/** Elevation profile in ticks. `values` run 0–1, left to right. */
export function ProfileChart({ values, label, className }: { values: number[]; label: string; className?: string }) {
  const PITCH = 4;
  const H = 64;
  const w = (values.length - 1) * PITCH + 1;
  const y = (v: number) => 4 + (1 - v) * (H - 8);
  const line = values.map((v, i) => `${i ? "L" : "M"}${i * PITCH + 0.5} ${y(v).toFixed(2)}`).join("");
  return (
    <svg
      role="img"
      aria-label={label}
      data-slot="profile-chart"
      viewBox={`0 0 ${w} ${H}`}
      preserveAspectRatio="none"
      className={cn("block h-10 w-full motion-safe:animate-[ds-draw_600ms_linear_both]", className)}
    >
      {values.map((v, i) => (
        <path key={i} d={`M${i * PITCH + 0.5} ${y(v).toFixed(2)}V${H}`} vectorEffect="non-scaling-stroke" className="stroke-line" strokeWidth={1} />
      ))}
      <path d={line} fill="none" vectorEffect="non-scaling-stroke" className="stroke-line-strong" strokeWidth={1.5} />
    </svg>
  );
}
