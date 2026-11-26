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
