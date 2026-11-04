"use client";

import * as React from "react";
import { ChatInput, ChatMessage, ChatSteps, ChatStep } from "@/components/ui/chat";
import { SiteChip } from "@/components/ui/site-chip";
import { NodeLoader } from "@/components/ui/node-loader";
import { StreamText } from "@/lib/stream-text";

// A conversation in its parts. Press Ask (or Enter): the question becomes a message, a waiting
// line shows while the agent starts, its steps join one by one, then the answer streams in.
// Restart, in the panel header, starts over.
const SITE = "39.8561, −104.6737";
const STEPS = ["Matched the parcel", "Checked the flood zone"];
const ANSWER = "No. It is in zone X, outside the 100-year floodplain.";
// The beats after sending: wait, each step, the answer.
const BEATS = [500, 300, 300];

export function Preview() {
  const [draft, setDraft] = React.useState("Is it in a flood zone?");
  const [site, setSite] = React.useState<string | null>(SITE);
  const [asked, setAsked] = React.useState<string | null>(null);
  const [beat, setBeat] = React.useState(0);
  const [done, setDone] = React.useState(false);
  React.useEffect(() => {
    if (!asked || beat >= BEATS.length) return;
    // ds-latency: the demo plays a run on a clock; no input waits on this timer.
    const id = window.setTimeout(() => setBeat((b) => b + 1), BEATS[beat]);
    return () => window.clearTimeout(id);
  }, [asked, beat]);
  const answering = !!asked && !done;
  return (
    <div className="flex w-full max-w-90 flex-col gap-5">
      {asked && (
        <div aria-live="polite" className="flex flex-col gap-5">
          <ChatMessage className="max-w-60 self-end motion-safe:animate-[ds-rise_200ms_var(--ds-easing-out)_both]">{asked}</ChatMessage>
          {beat === 0 && (
            <p className="flex items-center gap-2 text-body motion-safe:animate-[ds-enter_200ms_var(--ds-easing-out)_both]">
              <NodeLoader size="sm" />
              <span className="ds-trim">
                <span className="ds-shimmer">Reading the parcel's records</span>
              </span>
            </p>
          )}
          {beat > 0 && (
            <ChatSteps>
              {STEPS.slice(0, beat).map((s) => (
                <ChatStep key={s}>
                  <StreamText text={s} />
                </ChatStep>
              ))}
            </ChatSteps>
          )}
          {beat >= BEATS.length && (
            <p className="text-body text-fg">
              <StreamText text={ANSWER} onDone={() => setDone(true)} />
            </p>
          )}
        </div>
      )}
      <ChatInput
        className="w-full"
        placeholder={site ? "Ask about this parcel" : "Ask about any U.S. location"}
        // The chip carries no icon; its × on the right removes the site from the question.
        site={
          site && (
            <SiteChip icon={false} onRemove={() => setSite(null)} removeLabel="Remove site">
              {site}
            </SiteChip>
          )
        }
        loading={answering}
        submitDisabled={!answering && !draft.trim()}
        textareaProps={{ value: draft, onChange: (e) => setDraft(e.target.value), name: "question" }}
        onSubmit={(e) => {
          e.preventDefault();
          if (!draft.trim() || answering) return;
          setAsked(draft.trim());
          setDraft("");
          setBeat(0);
          setDone(false);
        }}
      />
    </div>
  );
}

