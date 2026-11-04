"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * StreamText: the words of an answer fade in one after another, as a streamed reply arrives.
 *
 * Adapted from prompt-kit's ResponseStream, "fade" mode (MIT):
 * Intl.Segmenter splits the text into words, and each word fades in after a delay set by its
 * position. Mireye's timing: 24ms a word and a 200ms fade on the ease-out curve, so a 20-word
 * line lands in under 0.7s. Under reduced motion the text appears at once. `onDone` fires when
 * the last word has faded in.
 */
export function StreamText({
  text,
  wordDelay = 24,
  className,
  onDone,
}: {
  text: string;
  wordDelay?: number;
  className?: string;
  onDone?: () => void;
}) {
  const words = React.useMemo(() => {
    try {
      const segmenter = new Intl.Segmenter(undefined, { granularity: "word" });
      return Array.from(segmenter.segment(text), (s) => s.segment);
    } catch {
      return text.split(/(\s+)/).filter(Boolean);
    }
  }, [text]);
  // The latest onDone, so a new callback on each render does not restart the timer.
  const done = React.useRef(onDone);
  done.current = onDone;
  React.useEffect(() => {
    // ds-latency: reports the end of the fade; the words already show, nothing waits on it.
    const id = window.setTimeout(() => done.current?.(), words.length * wordDelay + 200);
    return () => window.clearTimeout(id);
  }, [words.length, wordDelay]);
  return (
    <span className={className}>
      {words.map((w, i) => (
        <span
          key={i}
          // Spaces stay plain, so the line can still wrap between words.
          className={cn(!/^\s+$/.test(w) && "motion-safe:animate-[ds-enter_200ms_var(--ds-easing-out)_both]")}
          style={{ animationDelay: `${i * wordDelay}ms` }}
        >
          {w}
        </span>
      ))}
    </span>
  );
}
