# Agent chat
The Ask Mireye panel built from the system's parts: the panel, a map strip, suggestions, follow-ups, the survey frame and an elevation profile.

Install: npx mireye-ds add agent-chat
Requires: theme, utils, mireye-mark, map-marker, diamond, icons, parcel-scan
Packages: none
Exports: ChatPanel, ChatFollowUps, MapStrip, ChatSuggestions, SurveyFrame, ProfileChart
Client boundary: yes
Reference: Figma chat explorations (434:2): "Chat 12" and "Chat 16"


## Usage
Put a conversation in `ChatPanel` (title, `onClose`, `footer` for the composer; `framed` for the cut corner and header nodes). In the empty state show `MapStrip` and `ChatSuggestions`; wrap the composer in `SurveyFrame` and put `ChatFollowUps` on it after an answer. `ProfileChart` draws an elevation profile in ticks.
- Avoid: Sliding parts in; they enter in place
- Avoid: A chat without the site it is about
- Avoid: Suggestions as a dropdown


## Examples
Example components: npx mireye-ds add agent-chat chat cited-fields site-chip node-loader button stream-text
[Preview](https://mireye-ds.agencidev.com/preview/agent-chat/Preview)

examples/agent-chat.tsx

```tsx
"use client";

import * as React from "react";
import { ChatPanel, MapStrip, ChatSuggestions, ChatFollowUps, SurveyFrame, ProfileChart } from "@/components/ui/agent-chat";
import { ChatInput, ChatMessage, ChatSteps, ChatStep } from "@/components/ui/chat";
import { CitedFields, CitedField } from "@/components/ui/cited-fields";
import { SiteChip } from "@/components/ui/site-chip";
import { NodeLoader } from "@/components/ui/node-loader";
import { Button } from "@/components/ui/button";
import { StreamText } from "@/lib/stream-text";

/*
 * Ask Mireye, end to end. Type a question and press Enter (Shift+Enter for a new line), or pick
 * one. Ask loads while the agent works; the answer arrives in parts, the way a run reports
 * them: a waiting line after 400ms, the steps one by one, the answer, its cited values, then the
 * profile. Follow-up questions lead to the next turn. The view follows the answer unless you
 * scroll up. Close keeps the conversation; Ask Mireye opens it again.
 */

type Field = { label: string; value: string; source: number };
type Answer = { steps: string[]; text: string; fields: Field[]; profile?: boolean; next: string[] };

const SITE = "39.7392, −104.9903";
const ANSWERS: Record<string, Answer> = {
  "Who owns this parcel?": {
    steps: ["Matched the parcel", "Read the county assessor's record"],
    text: "Acme Land LLC has owned it since 2019.",
    fields: [
      { label: "Owner", value: "Acme Land LLC", source: 1 },
      { label: "Acquired", value: "March 2019", source: 1 },
      { label: "Assessed value", value: "$1.2M", source: 1 },
    ],
    next: ["Is it in a flood zone?", "How far is the nearest substation?"],
  },
  "Is it in a flood zone?": {
    steps: ["Matched the parcel", "Checked the flood zone", "Sampled elevation and slope"],
    text: "No. It is in zone X, outside the 100-year floodplain, on gently sloping ground.",
    fields: [
      { label: "Flood zone", value: "Zone X", source: 1 },
      { label: "Elevation", value: "5,342 ft", source: 2 },
      { label: "Slope", value: "2.8%", source: 3 },
    ],
    profile: true,
    next: ["How steep is the terrain?", "Who owns this parcel?"],
  },
  "How steep is the terrain?": {
    steps: ["Matched the parcel", "Sampled elevation and slope"],
    text: "Gentle: 2.8% on average, with 53 ft between the lowest and highest points.",
    fields: [
      { label: "Slope", value: "2.8%", source: 1 },
      { label: "Low point", value: "5,318 ft", source: 1 },
      { label: "High point", value: "5,371 ft", source: 1 },
    ],
    profile: true,
    next: ["How far is the nearest substation?", "Who owns this parcel?"],
  },
  "How far is the nearest substation?": {
    steps: ["Matched the parcel", "Searched substations within 5 miles"],
    text: "1.8 miles, a 345 kV substation to the north-east.",
    fields: [
      { label: "Nearest substation", value: "1.8 mi", source: 1 },
      { label: "Voltage", value: "345 kV", source: 1 },
    ],
    next: ["Is it in a flood zone?", "How steep is the terrain?"],
  },
};
const QUESTIONS = ["Who owns this parcel?", "Is it in a flood zone?", "How steep is the terrain?"];
// A typed question gets the flood answer in this demo.
const answerFor = (q: string) => ANSWERS[q] ?? ANSWERS["Is it in a flood zone?"];
const PROFILE = Array.from({ length: 128 }, (_, i) => Math.min(1, Math.max(0, 0.5 + 0.22 * Math.sin(i / 16 - 1) + 0.1 * Math.sin(i / 6 + 2) + 0.04 * Math.sin(i / 2.3))));

// The beats of one answer: waiting, each step, the answer text, the cited values, the profile.
const beatsOf = (a: Answer) => ["wait", ...a.steps.map(() => "step"), "text", "fields", ...(a.profile ? ["profile"] : [])];
const BEAT_MS: Record<string, number> = { wait: 700, step: 350, text: 700, fields: 400, profile: 600 };
const enter = "motion-safe:animate-[ds-enter_200ms_var(--ds-easing-out)_both]";

type Turn = { id: number; question: string; answer: Answer };

export function Preview() {
  const [open, setOpen] = React.useState(true);
  const [site, setSite] = React.useState<string | null>(SITE);
  const [draft, setDraft] = React.useState("");
  const [turns, setTurns] = React.useState<Turn[]>([]);
  const [beat, setBeat] = React.useState(0); // of the last turn
  const body = React.useRef<HTMLDivElement>(null);
  const stick = React.useRef(true);
  const input = React.useRef<HTMLTextAreaElement>(null);

  const last = turns[turns.length - 1];
  const beats = last ? beatsOf(last.answer) : [];
  const answering = !!last && beat < beats.length;

  React.useEffect(() => {
    if (!answering) return;
    // ds-latency: the demo plays a run on a clock; no input waits on this timer.
    const id = window.setTimeout(() => setBeat((b) => b + 1), BEAT_MS[beats[beat]]);
    return () => window.clearTimeout(id);
  }, [answering, beat, beats]);

  // Follow the answer while the reader is at the bottom; stop if they scroll up to read.
  React.useEffect(() => {
    const el = body.current;
    if (el && stick.current) el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  }, [beat, turns.length]);

  const ask = (q: string) => {
    // Ask is never greyed out: sending nothing puts the cursor back in the text.
    if (!q.trim()) return input.current?.focus();
    if (answering) return;
    setTurns((t) => [...t, { id: t.length, question: q.trim(), answer: answerFor(q.trim()) }]);
    setBeat(0);
    setDraft("");
    stick.current = true;
    input.current?.focus();
  };

  if (!open) {
    return (
      <Button onClick={() => setOpen(true)}>
        Ask Mireye
      </Button>
    );
  }

  const chip = site && (
    <SiteChip icon={false} onRemove={() => setSite(null)}>
      {site}
    </SiteChip>
  );
  const composer = (
    <ChatInput
      className="w-full"
      placeholder={site ? "Ask about this site" : "Ask about any U.S. location"}
      site={chip && <span className="max-sm:hidden">{chip}</span>}
      loading={answering}
      compact
      textareaProps={{ ref: input, value: draft, onChange: (e) => setDraft(e.target.value), name: "question" }}
      onSubmit={(e) => {
        e.preventDefault();
        ask(draft);
      }}
    />
  );

  return (
    <ChatPanel
      framed
      className="h-114 w-full max-w-96"
      onClose={() => setOpen(false)}
      footer={
        <>
          {/* Follow-ups sit on the composer as chips to send, under a Mist rule. */}
          {last && !answering && <ChatFollowUps className={enter} questions={last.answer.next} onPick={ask} />}
          {/* On a phone the chip sits above the composer: inside it, ChatInput needs 400px. */}
          {chip && <div className="mb-2 sm:hidden">{chip}</div>}
          {/* The survey frame stays around the composer: a rule for every composer. */}
          <SurveyFrame>{composer}</SurveyFrame>
        </>
      }
    >
      {!turns.length ? (
        <>
          <MapStrip />
          <ChatSuggestions className="mt-auto px-3.5 pt-5 pb-5" questions={QUESTIONS} onPick={ask} />
        </>
      ) : (
        <div
          ref={body}
          onScroll={(e) => {
            const el = e.currentTarget;
            stick.current = el.scrollHeight - el.scrollTop - el.clientHeight < 80;
          }}
          className="flex min-h-0 flex-1 flex-col gap-7 overflow-y-auto fade-y px-3.5 py-5"
        >
          {turns.map((t) => {
            const live = t === last;
            const shown = live ? beat : beatsOf(t.answer).length;
            const at = (name: string) => shown > beatsOf(t.answer).indexOf(name);
            const stepsShown = Math.max(0, Math.min(t.answer.steps.length, shown - 1));
            return (
              <section key={t.id} aria-label={t.question} className="flex flex-col gap-5">
                <ChatMessage className={`max-w-60 self-end ${live ? enter : ""}`}>{t.question}</ChatMessage>
                <div aria-live={live ? "polite" : undefined} className="flex flex-col gap-5">
                  {live && shown === 0 && (
                    // The waiting line shows only once the wait passes 400ms.
                    <p className="flex items-center gap-2 text-body text-fg-secondary motion-safe:animate-[ds-enter_200ms_var(--ds-easing-out)_400ms_both]">
                      <NodeLoader size="sm" />
                      <span className="ds-trim">Reading the parcel's records</span>
                    </p>
                  )}
                  {stepsShown > 0 && (
                    <ChatSteps>
                      {t.answer.steps.slice(0, stepsShown).map((s) => (
                        <ChatStep key={s}>{live ? <StreamText text={s} /> : s}</ChatStep>
                      ))}
                    </ChatSteps>
                  )}
                  {at("text") && <p className="text-body font-medium text-fg">{live ? <StreamText text={t.answer.text} /> : t.answer.text}</p>}
                  {at("fields") && (
                    <CitedFields className="w-full">
                      {t.answer.fields.map((f, i) => (
                        <CitedField
                          key={f.label}
                          label={f.label}
                          source={f.source}
                          // On a phone the label column narrows so the value keeps room.
                          className={`max-sm:grid-cols-[calc(var(--spacing)*20)_minmax(0,1fr)_auto] ${live ? enter : ""}`}
                          style={{ animationDelay: `${i * 80}ms` }}
                        >
                          {f.value}
                        </CitedField>
                      ))}
                    </CitedFields>
                  )}
                  {t.answer.profile && at("profile") && <ProfileChart values={PROFILE} label="Elevation profile across the parcel, 5,318 to 5,371 ft" />}
                </div>
              </section>
            );
          })}
        </div>
      )}
    </ChatPanel>
  );
}


```

## Source

components/ui/agent-chat.tsx

```tsx
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

```
