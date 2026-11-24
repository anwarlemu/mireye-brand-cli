"use client";

import * as React from "react";

import { PageSection, type PageSectionProps } from "@/components/blocks/page-section";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

// A sign-up for updates: the title and one line beside an email field and the Forest key, in the page's section frame.
// The form calls `onSubscribe` with the address; the page owns what happens next (and says so under the field).

export type NewsletterSectionProps = Omit<PageSectionProps, "children" | "onSubmit"> & {
  placeholder?: string;
  action?: string;
  note?: React.ReactNode;
  onSubscribe?: (email: string) => void | Promise<void>;
};

export function NewsletterSection({ label = "Updates", title = "What changed, once a month.", intro = "New fields, new coverage and what agents asked. No other email.", placeholder = "you@company.com", action = "Subscribe", note, onSubscribe, ...props }: NewsletterSectionProps) {
  const [email, setEmail] = React.useState("");
  const [state, setState] = React.useState<"idle" | "sending" | "done" | "error">("idle");
  const valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!valid) {
      setState("error");
      return;
    }
    setState("sending");
    try {
      await onSubscribe?.(email);
      setState("done");
    } catch {
      setState("error");
    }
  };
  return (
    <PageSection label={label} title={title} intro={intro} {...props}>
      <form data-slot="newsletter-section" onSubmit={submit} noValidate className="grid max-w-140 gap-3">
        <div className="flex flex-wrap gap-3">
          <Input type="email" aria-label="Email address" placeholder={placeholder} value={email} aria-invalid={state === "error" || undefined} onChange={(e) => { setEmail(e.target.value); if (state === "error") setState("idle"); }} className="min-w-0 flex-1" />
          <Button type="submit" disabled={state === "sending"}>{state === "sending" ? "Sending" : action}</Button>
        </div>
        <p role="status" className="text-caption leading-body text-fg-muted">
          {state === "done" ? "Thanks. The next one goes out at the start of the month." : state === "error" ? "Enter an email address, like you@company.com." : note}
        </p>
      </form>
    </PageSection>
  );
}
