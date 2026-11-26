# Chat input
The composer: a text area that grows with the question, the site chip and Ask, in the large cut frame.

Install: npx mireye-ds add chat-input
Requires: theme, chat
Packages: none
Exports: ChatInput
Client boundary: not required by this entry file
Reference: Figma "UI · Agent chat" (443:433): frame 443:455


## Usage
Use under a conversation. Pass `placeholder`, `site` (a SiteChip), `textareaProps` for the value and an `onSubmit`. `submitDisabled` disables Ask and Enter while the question is empty; `loading` keeps Enter from sending while the agent answers; `compact` makes Ask the chip's height.
- Avoid: A send icon in place of Ask
- Avoid: A composer taller than its question
- Avoid: Sending on Shift+Enter


## Examples
Example components: npx mireye-ds add chat-input chat-message site-chip node-loader
[Preview](https://mireye-ds.agencidev.com/preview/chat-input/Preview)

examples/chat-input.tsx

```tsx
"use client";

import * as React from "react";
import { ChatInput } from "@/components/ui/chat-input";
import { ChatMessage } from "@/components/ui/chat-message";
import { SiteChip } from "@/components/ui/site-chip";
import { NodeLoader } from "@/components/ui/node-loader";

// The composer: the question is about the chosen site, which can be removed. Ask sends it; the
// agent's waiting line takes its place under the message.
const SITE = "39.8561, −104.6737";

export function Preview() {
  const [site, setSite] = React.useState<string | null>(SITE);
  const [draft, setDraft] = React.useState("");
  const [asked, setAsked] = React.useState<string | null>(null);
  return (
    <div className="flex w-full flex-col items-center gap-3.5">
      {asked && (
        <div className="flex w-full max-w-90 flex-col items-start gap-2.5">
          <ChatMessage className="w-full max-w-60">{asked}</ChatMessage>
          <p role="status" className="flex items-center gap-2 text-body text-fg-secondary">
            <NodeLoader size="sm" />
            <span className="ds-trim">Reading {site ? "the parcel's records" : "the location"}</span>
          </p>
        </div>
      )}
      <ChatInput
        className="w-full max-w-90"
        placeholder={site ? "Ask about this parcel" : "Ask about any U.S. location"}
        site={site && <SiteChip onRemove={() => setSite(null)}>{site}</SiteChip>}
        textareaProps={{ value: draft, onChange: (e) => setDraft(e.target.value), name: "question" }}
        onSubmit={(e) => {
          e.preventDefault();
          if (!draft.trim()) return;
          setAsked(draft.trim());
          setDraft("");
        }}
      />
    </div>
  );
}

```

## Source

components/ui/chat-input.tsx

```tsx
// Moved into Chat (chat.tsx) on 29 Oct. This path stays so existing imports keep working.
export { ChatInput } from "@/components/ui/chat";

```
