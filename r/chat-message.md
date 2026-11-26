# Chat message
The question the person sent: their words in the cut frame on Bone.

Install: npx mireye-ds add chat-message
Requires: theme, chat
Packages: none
Exports: ChatMessage
Client boundary: not required by this entry file
Reference: Figma "UI · Agent chat" (443:433): 443:441


## Usage
Use for each sent question, right-aligned above the agent's steps and answer. Set its width with a class; the text wraps inside the padding.
- Avoid: Bubbles with tails
- Avoid: An avatar beside it
- Avoid: Colored or filled messages


## Examples
Example components: npx mireye-ds add chat-message chat-input
[Preview](https://mireye-ds.agencidev.com/preview/chat-message/Preview)

examples/chat-message.tsx

```tsx
"use client";

import * as React from "react";
import { ChatMessage } from "@/components/ui/chat-message";
import { ChatInput } from "@/components/ui/chat-input";

// A conversation: type a question and press Ask; it appears as a sent message above the
// composer, which empties for the next one.
export function Preview() {
  const [sent, setSent] = React.useState(["Check flood risk and terrain for this parcel."]);
  const [draft, setDraft] = React.useState("");
  return (
    <div className="flex w-full flex-col items-center gap-3.5">
      <div className="flex w-full max-w-90 flex-col items-start gap-2.5">
        {sent.map((m, i) => (
          <ChatMessage key={i} className="w-full max-w-60">
            {m}
          </ChatMessage>
        ))}
      </div>
      <ChatInput
        className="w-full max-w-90"
        placeholder="Ask about this parcel"
        textareaProps={{ value: draft, onChange: (e) => setDraft(e.target.value), name: "question" }}
        onSubmit={(e) => {
          e.preventDefault();
          if (!draft.trim()) return;
          setSent((s) => [...s, draft.trim()]);
          setDraft("");
        }}
      />
    </div>
  );
}

```

## Source

components/ui/chat-message.tsx

```tsx
// Moved into Chat (chat.tsx) on 29 Oct. This path stays so existing imports keep working.
export { ChatMessage } from "@/components/ui/chat";

```
