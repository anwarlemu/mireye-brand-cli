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
          className="flex min-h-0 flex-1 flex-col gap-7 overflow-y-auto px-3.5 py-5"
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

