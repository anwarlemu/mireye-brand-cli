# Contact page
The contact page: the title and channels (a mono label over each link) beside a form in a cut frame (name, work email, topic, message, the Forest key) that says it was sent in place.

Install: npx mireye-ds add contact-page
Requires: theme, icons, page-section, site-footer, site-header, button, field, input, native-select, textarea
Packages: none
Exports: ContactChannel, ContactValues, ContactPageProps, ContactPage
Client boundary: yes
Reference: Mireye website (mireye-website, read-only): contact flow; fields from the library (Figma UI · Inputs 442:79)


## Usage
Use for /contact. Pass `channels`, `topics` and `onSubmit`; the template sends nothing itself.
- Avoid: More than one Forest key
- Avoid: Maps or photos of an office
- Avoid: Required fields without labels


## Examples
Example components: npx mireye-ds add contact-page
[Preview](https://mireye-ds.agencidev.com/preview/contact-page/Preview)

examples/contact-page.tsx

```tsx
"use client";

import { ContactPage } from "@/components/blocks/contact-page";

export function Preview() {
  return <ContactPage />;
}

```

## Source

components/blocks/contact-page.tsx

```tsx
"use client";

import * as React from "react";

import { ArrowRightIcon } from "@/components/icons/arrow-right";
import { PageSection } from "@/components/blocks/page-section";
import { SiteFooter, type SiteFooterProps } from "@/components/blocks/site-footer";
import { SiteHeader, type SiteHeaderProps } from "@/components/blocks/site-header";
import { Button } from "@/components/ui/button";
import { Field, FieldDescription, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import { Textarea } from "@/components/ui/textarea";

// The contact page: the title and the ways to reach the team on one side (each a mono label over a link), the form on
// the other in a cut frame (name, work email, topic, message, the Forest key). The form calls `onSubmit` with its
// values; it sends nothing itself. After sending, the frame says so in place.

export type ContactChannel = { label: string; value: string; href: string };
export type ContactValues = { name: string; email: string; topic: string; message: string };

const CHANNELS: ContactChannel[] = [
  { label: "Sales", value: "sales@mireye.com", href: "mailto:sales@mireye.com" },
  { label: "Support", value: "support@mireye.com", href: "mailto:support@mireye.com" },
  { label: "Docs", value: "Read the API reference", href: "#docs" },
];

export type ContactPageProps = {
  header?: SiteHeaderProps;
  title?: string;
  intro?: string;
  channels?: ContactChannel[];
  topics?: string[];
  onSubmit?: (values: ContactValues) => void;
  footer?: SiteFooterProps;
};

export function ContactPage({
  header,
  title = "Talk to the team.",
  intro = "Tell us what your agent needs to know about places. An engineer replies within one business day.",
  channels = CHANNELS,
  topics = ["Pricing and plans", "Coverage for a region", "The platform", "Something else"],
  onSubmit,
  footer,
}: ContactPageProps) {
  const [sent, setSent] = React.useState(false);
  return (
    <div data-slot="contact-page" className="min-h-dvh bg-page font-sans text-fg">
      <SiteHeader current="#contact" {...header} />
      <main>
        <PageSection closing={false}>
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
            <div className="grid content-start gap-8">
              <div className="grid gap-4">
                <p className="font-mono text-caption leading-tight text-fg-muted">Contact</p>
                <h1 className="text-display leading-display font-normal text-balance text-fg">{title}</h1>
                <p className="max-w-(--ds-layout-text) text-body-lg leading-body text-fg-secondary">{intro}</p>
              </div>
              <dl className="grid border-t border-line-subtle">
                {channels.map((c) => (
                  <div key={c.label} className="grid gap-1 border-b border-line-subtle py-4 sm:grid-cols-3 sm:items-baseline">
                    <dt className="font-mono text-caption text-fg-muted">{c.label}</dt>
                    <dd className="m-0 sm:col-span-2">
                      <a href={c.href} className="text-body text-fg underline decoration-line underline-offset-4 outline-none transition-[text-decoration-color] duration-150 ease-out hover:decoration-line-strong focus-visible:outline-solid focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-line-strong motion-reduce:transition-none">
                        {c.value}
                      </a>
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
            <div className="ds-cut-frame p-5 sm:p-8 [--ds-cut:var(--ds-cut-lg)] [--ds-shape-fill:var(--ds-color-bg-page)] [--ds-shape-stroke:var(--ds-color-border-default)]">
              {sent ? (
                <div role="status" className="grid gap-3">
                  <h2 className="text-h2 leading-heading font-normal text-fg">Thanks, we have your message.</h2>
                  <p className="text-body leading-body text-fg-secondary">An engineer will reply by email within one business day.</p>
                  <Button variant="ghost" arrow className="w-fit" onClick={() => setSent(false)}>
                    Send another
                  </Button>
                </div>
              ) : (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    const data = new FormData(e.currentTarget);
                    onSubmit?.({ name: String(data.get("name") ?? ""), email: String(data.get("email") ?? ""), topic: String(data.get("topic") ?? ""), message: String(data.get("message") ?? "") });
                    setSent(true);
                  }}
                >
                  <FieldGroup>
                    <div className="grid gap-5 sm:grid-cols-2">
                      <Field>
                        <FieldLabel htmlFor="contact-name">Name</FieldLabel>
                        <Input id="contact-name" name="name" autoComplete="name" required />
                      </Field>
                      <Field>
                        <FieldLabel htmlFor="contact-email">Work email</FieldLabel>
                        <Input id="contact-email" name="email" type="email" autoComplete="email" required />
                      </Field>
                    </div>
                    <Field>
                      <FieldLabel htmlFor="contact-topic">Topic</FieldLabel>
                      <NativeSelect id="contact-topic" name="topic" defaultValue={topics[0]}>
                        {topics.map((t) => (
                          <NativeSelectOption key={t} value={t}>
                            {t}
                          </NativeSelectOption>
                        ))}
                      </NativeSelect>
                    </Field>
                    <Field>
                      <FieldLabel htmlFor="contact-message">Message</FieldLabel>
                      <Textarea id="contact-message" name="message" rows={5} placeholder="The places, fields and volume you have in mind" required />
                      <FieldDescription>No sensitive data, please. We reply by email.</FieldDescription>
                    </Field>
                    <Button type="submit" className="w-full sm:w-fit">
                      Send message
                      <ArrowRightIcon size={20} />
                    </Button>
                  </FieldGroup>
                </form>
              )}
            </div>
          </div>
        </PageSection>
      </main>
      <SiteFooter {...footer} />
    </div>
  );
}

```
