# Chat steps
What the agent did to answer, in the past tense, each step behind an outlined diamond.

Install: npx mireye-ds add chat-steps
Requires: theme, chat
Packages: none
Exports: ChatSteps, ChatStep
Client boundary: not required by this entry file
Reference: Figma "UI · Agent chat" (443:433): 443:445 to 443:453


## Usage
Use under the question once the agent has worked: "Matched the parcel", "Checked the flood zone". Steps join as they finish; StreamText fades their words in.
- Avoid: Present tense once a step is done
- Avoid: A spinner on a step; use AgentSteps for live work


## Examples
Example components: npx mireye-ds add chat-steps stream-text
[Preview](https://mireye-ds.agencidev.com/preview/chat-steps/Preview)

examples/chat-steps.tsx

```tsx
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

```

## Source

components/ui/chat-steps.tsx

```tsx
// Moved into Chat (chat.tsx) on 29 Oct. This path stays so existing imports keep working.
export { ChatSteps, ChatStep } from "@/components/ui/chat";

```
