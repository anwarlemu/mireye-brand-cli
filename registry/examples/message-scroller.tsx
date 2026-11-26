"use client";

import * as React from "react";
import { ArrowRightIcon } from "@/components/icons/arrow-right";

import { Bubble, BubbleContent } from "@/components/ui/bubble";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Marker, MarkerContent } from "@/components/ui/marker";
import { Message, MessageContent, MessageHeader } from "@/components/ui/message";
import { MessageScroller, MessageScrollerButton, MessageScrollerContent, MessageScrollerItem, MessageScrollerProvider, MessageScrollerViewport, useMessageScroller } from "@/components/ui/message-scroller";

type Entry = { id: number; from: "contact" | "agent"; text: string };

const QUESTIONS = ["Check flood risk for parcel 042-117-09.", "What is the nearest substation?", "How steep is the north half?", "Is the site zoned for industrial use?", "Is there municipal water?"];
const ANSWERS = ["Zone X, outside the 100-year flood plain.", "Waxahachie North, 345 kV, 0.8 mi east.", "2.8% on average, 4.1% at the steepest.", "Yes, I-2 Industrial on all three parcels.", "Yes, a main runs along the north edge."];
const START: Entry[] = Array.from({ length: 10 }, (_, i) => ({
  id: i,
  from: i % 2 === 1 ? "agent" : "contact",
  text: i % 2 === 1 ? ANSWERS[((i - 1) / 2) % ANSWERS.length] : QUESTIONS[(i / 2) % QUESTIONS.length],
}));

function Composer({ onSend }: { onSend: (text: string) => void }) {
  const { scrollToEnd } = useMessageScroller();
  const [text, setText] = React.useState("");
  return (
    <form
      className="flex items-center gap-2 border-t border-line p-3"
      onSubmit={(event) => {
        event.preventDefault();
        if (!text.trim()) return;
        onSend(text.trim());
        setText("");
        scrollToEnd({ behavior: "auto" });
      }}
    >
      <Input aria-label="Message" value={text} onChange={(e) => setText(e.target.value)} placeholder="Ask about any U.S. location" />
      <Button type="submit" aria-label="Ask">
        Ask
        <ArrowRightIcon size={16} aria-hidden />
      </Button>
    </form>
  );
}

export function Preview() {
  const [entries, setEntries] = React.useState(START);
  return (
    <div className="mx-auto flex h-110 w-full max-w-140 flex-col overflow-hidden ds-cut-frame [--ds-shape-fill:var(--ds-color-bg-default)] [--ds-shape-stroke:var(--ds-color-border-default)]">
      <MessageScrollerProvider>
        <MessageScroller className="min-h-0 flex-1">
          <MessageScrollerViewport>
            <MessageScrollerContent className="gap-4">
              <Marker variant="separator">
                <MarkerContent>Yesterday</MarkerContent>
              </Marker>
              {entries.map((entry) => (
                <MessageScrollerItem key={entry.id}>
                  <Message align={entry.from === "agent" ? "start" : "end"}>
                    <MessageContent>
                      <MessageHeader>{entry.from === "agent" ? "Mireye" : "You"}</MessageHeader>
                      <Bubble variant={entry.from === "agent" ? "ghost" : "default"} align={entry.from === "agent" ? "start" : "end"}>
                        <BubbleContent>{entry.text}</BubbleContent>
                      </Bubble>
                    </MessageContent>
                  </Message>
                </MessageScrollerItem>
              ))}
            </MessageScrollerContent>
          </MessageScrollerViewport>
          <MessageScrollerButton />
        </MessageScroller>
        <Composer onSend={(text) => setEntries((all) => [...all, { id: all.length, from: "contact", text }])} />
      </MessageScrollerProvider>
    </div>
  );
}

export function Streaming() {
  const [count, setCount] = React.useState(3);
  React.useEffect(() => {
    if (count >= 12) return;
    // ds-latency: simulates incoming messages in this example; scrolling and input remain immediate.
    const t = setTimeout(() => setCount((c) => c + 1), 900);
    return () => clearTimeout(t);
  }, [count]);
  return (
    <div className="mx-auto h-80 w-full max-w-140 overflow-hidden ds-cut-frame [--ds-shape-fill:var(--ds-color-bg-default)] [--ds-shape-stroke:var(--ds-color-border-default)]">
      <MessageScroller>
        <MessageScrollerViewport>
          <MessageScrollerContent className="gap-2">
            {Array.from({ length: count }, (_, i) => (
              <MessageScrollerItem key={i}>
                <Bubble variant="secondary">
                  <BubbleContent>{`Read source ${i + 1}: parcel layer for Ellis County, ${(i * 37) % 90 + 10} parcels matched.`}</BubbleContent>
                </Bubble>
              </MessageScrollerItem>
            ))}
          </MessageScrollerContent>
        </MessageScrollerViewport>
        <MessageScrollerButton direction="start" />
        <MessageScrollerButton />
      </MessageScroller>
    </div>
  );
}
