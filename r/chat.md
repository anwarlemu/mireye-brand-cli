# Chat
The parts of a conversation with the agent: ChatMessage, ChatSteps and ChatInput, the composer.

Install: npx mireye-ds add chat
Requires: theme, utils, button, diamond
Packages: none
Exports: ChatMessage, ChatSteps, ChatStep, ChatInput
Client boundary: yes
Reference: Figma "UI · Agent chat" (443:433)


## Usage
Compose a turn from the sent `ChatMessage`, the agent's `ChatSteps` in the past tense, the answer and its CitedFields, then `ChatInput` with a SiteChip. Enter sends and Shift+Enter starts a line; `loading` walks Ask's ticks while the agent answers. AgentChat puts the whole panel together.
- Avoid: Speech bubbles or avatars
- Avoid: Agent steps in the present tense once done
- Avoid: A composer without a visible label or placeholder


## Examples
Example components: npx mireye-ds add chat site-chip node-loader stream-text
[Preview](https://mireye-ds.agencidev.com/preview/chat/Preview)

examples/chat.tsx

```tsx
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


```

## Source

components/ui/chat.tsx

```tsx
"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Diamond } from "@/components/ui/diamond";

/**
 * Chat: the parts of a conversation with the agent, in one component.
 * - ChatMessage: the question the person sent.
 * - ChatSteps and ChatStep: what the agent did to answer, in the past tense.
 * - ChatInput: the composer, with the text area, the site chip and Ask.
 * Compose them with the answer's own parts (CitedFields, Sources, ProfileChart); AgentChat
 * puts the whole panel together. Source: Figma "UI · Agent chat" (443:433).
 */

// Message ----------------------------------------------------------------------------------------

/**
 * Chat message: the question the person sent to the agent.
 * Source: Figma "UI · Agent chat" (443:433), frame 443:441 with its text 443:443.
 *
 * - 1px Stone border on white with the 12px cut corner, drawn by ds-cut-frame
 *   (Figma path: M12 0.5 H399.5 V91.5 H0.5 V12 L12 0.5 Z).
 * - 20px Regular text in Forest, 1.4 line height (28px between lines).
 * - Padding: 24px left and top, 26px under the last line. Figma's frame is 92px tall around a
 *   42px two-line cap box at y = 24, so the bottom really is 2px deeper than the top.
 * - Width: Figma's frame is 400px and the text does not fill it, so the width is the caller's
 *   (`className="w-60"`). Figma breaks the line by hand after "terrain"; pass a <br /> for that.
 *
 * Figma shows only the sent message, so there is no agent-bubble or error variant.
 */
export function ChatMessage({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      data-slot="chat-message"
      className={cn(
        "ds-cut-frame px-3.5 pt-3.5 pb-4 font-sans text-body font-normal text-fg",
        "[--ds-shape-stroke:var(--ds-color-border-default)] [--ds-shape-fill:var(--ds-color-bg-default)]",
        className,
      )}
      {...props}
    >
      {/* w-fit: the text box hugs the text, like Figma's auto-width layer, and still wraps at
          the box's padding when the text is longer than one line. */}
      <p data-slot="text" className="ds-trim w-fit">
        {children}
      </p>
    </div>
  );
}

// Steps ------------------------------------------------------------------------------------------

/**
 * Chat steps: what the agent did to answer, listed under the message ("Matched the parcel",
 * "Checked the flood zone", "Sampled elevation and slope").
 * Source: Figma "UI · Agent chat" (443:433), steps 443:445/443:447, 443:448/443:450,
 * 443:451/443:453.
 *
 * - 10px outlined diamond in Forest (1px stroke kept inside the box, as the shared Diamond
 *   draws it: Figma M5 0.71 L9.29 5 L5 9.29 L0.71 5 Z), then the 20px label 14px after it.
 * - The label is 80% Forest; the diamond stays full Forest.
 * - The diamond is centered on the label's cap box (Figma: diamond y = 471, label y = 469).
 * - Rows are 36px apart: 22px between 14px cap boxes.
 * - Figma shows one state only: every step done, in the past tense. No pending or running look.
 */
export function ChatSteps({ className, ...props }: React.OlHTMLAttributes<HTMLOListElement>) {
  // role="list": Safari drops list semantics from lists styled with list-style: none.
  return <ol role="list" data-slot="chat-steps" className={cn("flex flex-col gap-3.5", className)} {...props} />;
}

export function ChatStep({ className, children, ...props }: React.LiHTMLAttributes<HTMLLIElement>) {
  return (
    <li
      data-slot="step"
      className={cn("flex items-center gap-2 font-sans text-body font-normal text-fg-secondary", className)}
      {...props}
    >
      <Diamond size={10} variant="outline" className="text-fg" />
      <span data-slot="label" className="ds-trim">
        {children}
      </span>
    </li>
  );
}

// Input ------------------------------------------------------------------------------------------

/**
 * Chat input: the composer under an agent chat. A text area, the site the question is about
 * and the Ask button.
 * Source: Figma "UI · Agent chat" (443:433): frame 443:455, placeholder 443:457, site chip
 * 443:458, Ask button 443:464.
 *
 * - 150px tall, 1px Stone border on white with a 16px cut corner, drawn by ds-cut-frame
 *   (Figma path: M16 0.5 H599.5 V149.5 H0.5 V16 L16 0.5 Z): `--ds-cut-lg`.
 * - Placeholder: 20px Regular, 72% Forest, cap box at x = 20, y = 29.
 * - Bottom row: 50px tall, 20px from the left, right and bottom edges. The site chip (40px) and
 *   the Ask button (50px) are centered on it (Figma: chip y = 85, button y = 80).
 * - Ask is the shared Button, size "sm": 20px padding, label, 18px gap, arrow. With Gilroy's
 *   "Ask" (32px) that is Figma's 110px frame. It hugs its label, so another label still fits.
 * - Width: Figma's frame is 600px; the width is the caller's (`className="w-90"`).
 *
 * Placeholder. A native placeholder cannot be cap-trimmed or measured, so the visible one is a
 * trimmed overlay at Figma's position, shown while the text area is empty
 * (`peer-placeholder-shown`). The native placeholder stays for assistive tech but is transparent.
 * Typed text: Figma shows only the empty state. The text area's first 28px line starts 22px from
 * the top, which puts the cap height of a 20px line close to the placeholder's y = 29.
 *
 * Focus: Figma's chat board has no focus state. The border turns Forest, like the focused field
 * on "UI · Inputs" (442:124, stroke #1E231C). `state="focus"` forces it for specimens and docs.
 *
 * Behaviour (29 Oct; Figma shows none of it):
 * - Enter sends; Shift+Enter starts a new line. Enter while an IME is composing does nothing.
 * - The text area grows with the question, up to 200px, then scrolls; the composer grows with it.
 * - `submitDisabled` disables Ask (and Enter), e.g. while the question is empty.
 * - `compact` (29 Oct, from the Land platform's chat): Ask is 40px tall, the height of the
 *   chip beside it, with 14px padding and the small cut. The Figma board keeps the 50px Ask.
 * - `loading` puts Ask in its loading state while the agent answers; Enter does not send.
 */
type ChatInputProps = Omit<React.FormHTMLAttributes<HTMLFormElement>, "children"> & {
  placeholder?: string;
  /** The site the question is about, usually a <SiteChip>. */
  site?: React.ReactNode;
  /** Props for the text area: name, value, onChange, ref (to move focus back after sending)… */
  textareaProps?: React.ComponentProps<"textarea">;
  /** Forces the focus look. */
  state?: "focus";
  /** Ask is busy while the agent answers: walking ticks, and Enter does not send. */
  loading?: boolean;
  /** Disables Ask and Enter, e.g. while the question is empty. */
  submitDisabled?: boolean;
  /** A 40px Ask, the height of the site chip. */
  compact?: boolean;
};

export function ChatInput({
  className,
  placeholder,
  site,
  textareaProps,
  state,
  loading = false,
  submitDisabled = false,
  compact = false,
  ...props
}: ChatInputProps) {
  return (
    <form
      data-slot="chat-input"
      data-state={state}
      className={cn(
        "relative flex min-h-22.5 flex-col font-sans",
        "ds-cut-frame [--ds-cut:var(--ds-cut-lg)]",
        "[--ds-shape-stroke:var(--ds-color-border-default)] [--ds-shape-fill:var(--ds-color-bg-default)]",
        // Only the text area's focus turns the border Forest, as on the Inputs board's field.
        // Focusing Ask shows the button's own outline instead.
        "has-[[data-slot=textarea]:focus]:[--ds-shape-stroke:var(--ds-color-border-strong)] data-[state=focus]:[--ds-shape-stroke:var(--ds-color-border-strong)]",
        className,
      )}
      {...props}
    >
      <textarea
        data-slot="textarea"
        rows={1}
        placeholder={placeholder}
        aria-label={placeholder}
        {...textareaProps}
        onKeyDown={(e) => {
          textareaProps?.onKeyDown?.(e);
          if (e.defaultPrevented || e.key !== "Enter" || e.shiftKey || e.nativeEvent.isComposing) return;
          e.preventDefault();
          if (!loading && !submitDisabled) e.currentTarget.form?.requestSubmit();
        }}
        // Merged, so a className in textareaProps can't drop `peer` or the padding the
        // placeholder overlay is aligned to. field-sizing grows the area with its text.
        className={cn(
          "peer min-h-0 w-full flex-1 resize-none bg-transparent px-3 pt-3.5 outline-none [field-sizing:content] max-h-30 overflow-y-auto fade-y",
          "text-body font-normal text-fg placeholder:text-transparent",
          textareaProps?.className,
        )}
      />
      {placeholder && (
        <span
          aria-hidden
          data-slot="placeholder"
          className="ds-trim pointer-events-none absolute top-4.5 left-3 hidden whitespace-nowrap text-body font-normal text-fg-muted peer-placeholder-shown:block"
        >
          {placeholder}
        </span>
      )}
      <div data-slot="actions" className="mx-3 mb-3 flex h-8 items-center gap-3">
        {site}
        <Button type="submit" size="sm" className={cn("ml-auto", compact && "h-6 gap-1.5 px-2 [--ds-cut:var(--ds-cut-sm)]")} loading={loading} disabled={submitDisabled}>
          Ask
        </Button>
      </div>
    </form>
  );
}

```
