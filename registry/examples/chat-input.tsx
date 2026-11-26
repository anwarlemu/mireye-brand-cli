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
