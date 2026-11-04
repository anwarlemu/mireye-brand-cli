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
