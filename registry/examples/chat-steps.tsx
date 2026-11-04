"use client";

import * as React from "react";
import { ChatSteps, ChatStep } from "@/components/ui/chat-steps";
import { StreamText } from "@/lib/stream-text";

// What the agent did, in the past tense. Each step joins the record as it finishes, its words
// fading in; the record holds for 2s, then plays again.
const DONE = ["Matched the parcel", "Checked the flood zone", "Sampled elevation and slope"];

export function Preview() {
  const [count, setCount] = React.useState(0);
  React.useEffect(() => {
    // ds-latency: the demo plays a run on a clock; no input waits on this timer.
    const id = window.setTimeout(() => setCount((c) => (c >= DONE.length ? 0 : c + 1)), count >= DONE.length ? 2000 : 450);
    return () => window.clearTimeout(id);
  }, [count]);
  return (
    <ChatSteps aria-live="polite" className="min-h-15">
      {DONE.slice(0, count).map((s) => (
        <ChatStep key={s}>
          <StreamText text={s} />
        </ChatStep>
      ))}
    </ChatSteps>
  );
}
