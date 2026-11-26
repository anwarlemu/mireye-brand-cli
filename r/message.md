# Message
One message in an agent conversation: a square avatar, the sender and a DM Mono time, the bubbles and a muted footer.

Install: npx mireye-ds add message
Requires: theme, utils
Packages: none
Exports: Message, MessageAvatar, MessageContent, MessageFooter, MessageGroup, MessageHeader
Client boundary: not required by this entry file
Reference: Figma UI · Agent chat (443:433): Message and Sources, at the product scale


## Usage
Use for each turn of a conversation with the agent. Put the person's question in a default Bubble with align end on the Message, and the agent's answer in a ghost Bubble beside a Forest avatar holding a Diamond. Use MessageFooter for what backs the answer (Cited 3 sources). Group turns in MessageGroup.
- Avoid: Circular avatars
- Avoid: Coloured sender names
- Avoid: Read receipts
- Avoid: Messages that slide or fade in


## Examples
Example components: npx mireye-ds add message bubble diamond
[Preview](https://mireye-ds.agencidev.com/preview/message/Preview) | [Replies](https://mireye-ds.agencidev.com/preview/message/Replies)

examples/message.tsx

```tsx
import { Bubble, BubbleContent } from "@/components/ui/bubble";
import { Diamond } from "@/components/ui/diamond";
import { Message, MessageAvatar, MessageContent, MessageFooter, MessageGroup, MessageHeader } from "@/components/ui/message";

export function Preview() {
  return (
    <MessageGroup className="mx-auto w-full max-w-140">
      <Message align="end">
        <MessageAvatar>A</MessageAvatar>
        <MessageContent>
          <MessageHeader>
            You <time dateTime="2026-10-28T16:12">4:12 PM</time>
          </MessageHeader>
          <Bubble align="end">
            <BubbleContent>Check flood risk and terrain for this parcel.</BubbleContent>
          </Bubble>
        </MessageContent>
      </Message>
      <Message>
        <MessageAvatar className="bg-inverse text-fg-inverse">
          <Diamond size={14} />
        </MessageAvatar>
        <MessageContent>
          <MessageHeader>
            Mireye <time dateTime="2026-10-28T16:12">4:12 PM</time>
          </MessageHeader>
          <Bubble variant="ghost">
            <BubbleContent>The parcel is in Zone X, outside the 100-year flood plain. It sits at 412 ft with a 2.8% average slope.</BubbleContent>
          </Bubble>
          <MessageFooter>
            <Diamond size={8} variant="outline" /> Cited 3 sources
          </MessageFooter>
        </MessageContent>
      </Message>
    </MessageGroup>
  );
}

export function Replies() {
  return (
    <Message className="mx-auto max-w-140">
      <MessageAvatar>A</MessageAvatar>
      <MessageContent>
        <MessageHeader>
          Acme Energy <time dateTime="2026-10-28T16:20">4:20 PM</time>
        </MessageHeader>
        <Bubble variant="secondary">
          <BubbleContent>Add the Navarro sites to the shortlist too.</BubbleContent>
        </Bubble>
      </MessageContent>
    </Message>
  );
}

```

## Source

components/ui/message.tsx

```tsx
import * as React from "react";

import { cn } from "@/lib/utils";

// One message in an agent conversation: a 32px square avatar (an initial on Fog, or the agent's Forest tile), the
// sender in 12px Forest at 80% with the time in DM Mono beside it, the bubbles, and a 12px muted footer (Cited 3
// sources). What the person sent (align end) mirrors to the right. Nothing animates in.
function MessageGroup({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="message-group" className={cn("flex min-w-0 flex-col gap-4", className)} {...props} />;
}

function Message({ className, align = "start", ...props }: React.ComponentProps<"div"> & { align?: "start" | "end" }) {
  return <div data-slot="message" data-align={align} className={cn("group/message relative flex w-full min-w-0 gap-2.5 font-sans text-body data-[align=end]:flex-row-reverse", className)} {...props} />;
}

function MessageAvatar({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="message-avatar"
      className={cn(
        "flex size-8 shrink-0 items-center justify-center self-start overflow-hidden bg-subtle text-body leading-none font-medium text-fg *:[img]:size-full *:[img]:object-cover",
        className,
      )}
      {...props}
    />
  );
}

function MessageContent({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="message-content" className={cn("flex w-full min-w-0 flex-col gap-1.5 break-words group-data-[align=end]/message:items-end", className)} {...props} />;
}

/** The sender and the time: "Mireye" in Forest at 80%, "4:12 PM" in DM Mono, muted. */
function MessageHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="message-header"
      className={cn("flex max-w-full min-w-0 items-baseline gap-2 text-caption leading-tight text-fg-secondary group-data-[align=end]/message:flex-row-reverse [&_time]:font-mono [&_time]:text-fg-muted", className)}
      {...props}
    />
  );
}

function MessageFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="message-footer"
      className={cn("flex max-w-full min-w-0 items-center gap-1.5 text-caption leading-tight text-fg-muted group-data-[align=end]/message:justify-end [&_svg:not([class*='size-'])]:size-3.5", className)}
      {...props}
    />
  );
}

export { Message, MessageAvatar, MessageContent, MessageFooter, MessageGroup, MessageHeader };

```
